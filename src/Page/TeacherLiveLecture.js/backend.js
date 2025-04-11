const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
const port = process.env.PORT || 4000;

mongoose
  .connect(process.env.MONGODB_URL_LOCAL, {
    useNewUrlParser: true,
    useUnifiedTopoLogy: true,
  })

  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.log(err.message));

// Utility function to get participants list
const getParticipantsList = async (lectureId) => {
  const lecture = await courseLectureModel
    .findById(lectureId)
    .populate("liveDetails.participants.user", "name email avatar")
    .select("liveDetails.participants");

  return lecture.liveDetails.participants.filter((p) => !p.leftAt);
};

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    const userType = socket.handshake.auth.userType;

    console.log("token: " + token);
    console.log("userType: " + userType);

    if (!token || !userType) {
      throw new Error("Authentication credentials missing");
    }

    const secret =
      userType === "admin"
        ? process.env.JWT_SECRET_KEY_ADMIN
        : process.env.JWT_SECRET_KEY_STUDENT;

    // Verify JWT
    const decoded = jwt.verify(token, secret);

    let user;

    if (userType === "admin") {
      user = await adminAuthModel.findById(decoded._id).select("-password");
    } else {
      user = await studentAuhModel.findById(decoded._id);
      console.log("userType ", userType, user);
    }

    if (!user) {
      throw new Error(${userType} not found);
    }

    // Attach user type specific data
    if (userType === "admin") {
      socket.admin = {
        _id: user._id,
        email: user.email,
        role: user.role,
      };
    } else {
      socket.user = {
        _id: user._id,
        email: user.email,
        role: user.role,
      };
    }

    next();
  } catch (error) {
    console.error(Socket auth error: ${error.message});
    next(new Error("Authentication failed"));
  }
});

io.on("connection", (socket) => {
  console.log(
    New connection: ${socket.id}, role: ${socket.admin ? "admin" : "user"}
  );

  // Error handling utility
  const handleError = (error, event, socket) => {
    console.error(Socket ${event} error:, error);
    socket.emit("socket-error", { event, message: error.message });
  };

  /**
   * GO-LIVE SOCKET EVENT (for Admin/Teacher)
   *
   * Expects the data payload to have:
   *  - lectureId: the MongoDB ID for the lecture
   *  - isResume: boolean indicating if the session is being resumed or started for the first time
   */

  socket.on("go-live", async (data) => {
    if (!socket.admin) {
      console.warn(Unauthorized go-live attempt from socket: ${socket.id});
      return socket.emit("go-live-error", "Unauthorized access");
    }

    const { lectureId, isResume } = data;

    // Validate lecture ID format
    if (!mongoose.Types.ObjectId.isValid(lectureId)) {
      console.error(Invalid lecture ID format: ${lectureId});
      return socket.emit("go-live-error", "Invalid lecture ID format");
    }

    try {
      // Find and update lecture:
      // - Only update if the lecture's liveDetails.teacher matches the current admin ID
      // - Set the status to 'live'
      // - Push the connection event (start/resume) into connectionHistory
      const lecture = await courseLectureModel.findOneAndUpdate(
        { _id: lectureId, "liveDetails.teacher": socket.admin._id },
        {
          $set: { "liveDetails.status": "live" },
          $push: {
            "liveDetails.connectionHistory": {
              action: isResume ? "resume" : "start",
              timestamp: new Date(),
            },
          },
        },
        { new: true }
      );

      if (!lecture) {
        console.error(
          Lecture not available or unauthorized for lectureId: ${lectureId}
        );
        return socket.emit(
          "go-live-error",
          "Lecture not available or you are not authorized"
        );
      }

      // Generate Agora token for live session
      const token = generateAgoraToken(
        lecture.liveDetails.channelName,
        socket.admin._id,
        "publisher"
      );

      console.log(
        Lecture ${lectureId} is now live. Token generated for admin ${socket.admin.email}
      );

      // Optionally, join the lecture room if needed:
      socket.join(lecture-${lectureId});

      // Emit success back to the teacher with the necessary information
      socket.emit("go-live-success", {
        success: true,
        token,
        channelName: lecture.liveDetails.channelName,
        status: lecture.liveDetails.status,
      });
    } catch (error) {
      handleError(error, "go-live", socket);
    }
  });

  // admin Connection Handler
  socket.on("admin-connect", async (lectureId) => {
    if (!socket.admin) {
      console.log(Unauthorized admin connection attempt by ${socket.id});
      return;
    }

    console.log(
      admin ${socket.admin.email} is attempting to connect to lecture: ${lectureId}
    );
    console.log(socket.admin._id, "admin...................................");
    // Validate lectureId format
    if (!mongoose.Types.ObjectId.isValid(lectureId)) {
      console.log(Invalid lecture ID format: ${lectureId});
      return socket.emit("lecture-error", "Invalid lecture ID format");
    }

    try {
      const lecture = await courseLectureModel.findOne({
        _id: lectureId,
        "liveDetails.teacher": socket.admin._id,
      });

      if (!lecture) {
        console.log(
          Lecture not found or unauthorized access by ${socket.admin.email}
        );
        return socket.emit("lecture-error", "Lecture not found");
      }

      console.log(
        Lecture found: ${lectureId}, joining room lecture-${lectureId}
      );

      // Join lecture room
      socket.join(lecture-${lectureId});

      // Update lecture status
      const updatedLecture = await courseLectureModel.findByIdAndUpdate(
        lectureId,
        {
          status: "live",
          $push: {
            connectionHistory: {
              action: lecture.status === "paused" ? "reconnect" : "connect",
              timestamp: new Date(),
            },
          },
        },
        { new: true }
      );

      console.log(Lecture status updated to live for lecture: ${lectureId});

      // Broadcast to all participants
      io.to(lecture-${lectureId}).emit("lecture-update", {
        status: "live",
        message: "admin has joined the lecture",
        teacher: socket.admin.email,
        timestamp: new Date(),
      });

      console.log(Broadcasted lecture update for lecture: ${lectureId});

      // Send confirmation to teacher
      socket.emit("lecture-connected", {
        channelName: lecture.channelName,
        participants: updatedLecture.participants,
      });

      console.log(
        Teacher ${socket.admin.email} connected to lecture: ${lectureId}
      );
    } catch (error) {
      console.error("Error in teacher connection:", error);
      socket.emit("lecture-error", "Failed to connect to lecture");
    }
  });

  /**
   * end-lecture event: Admin ends a live lecture.
   * This updates the lecture's status to "ended" and notifies all participants.
   */

  socket.on("end-lecture", async (lectureId) => {
    if (!socket.admin) {
      console.warn(
        Unauthorized end-lecture attempt from socket: ${socket.id}
      );
      return socket.emit("end-lecture-error", "Unauthorized access");
    }

    if (!mongoose.Types.ObjectId.isValid(lectureId)) {
      console.error(Invalid lecture ID format: ${lectureId});
      return socket.emit("end-lecture-error", "Invalid lecture ID format");
    }

    try {
      const lecture = await courseLectureModel.findOneAndUpdate(
        { _id: lectureId, "liveDetails.teacher": socket.admin._id },
        {
          $set: { status: "ended", "liveDetails.status": "ended" },
          $push: {
            connectionHistory: {
              action: "end",
              timestamp: new Date(),
            },
          },
        },
        { new: true }
      );

      if (!lecture) {
        console.error(
          Lecture not available or unauthorized for lectureId: ${lectureId}
        );
        return socket.emit(
          "end-lecture-error",
          "Lecture not available or you are not authorized"
        );
      }

      // Broadcast the end-of-lecture event to all participants
      io.to(lecture-${lectureId}).emit("lecture-ended", {
        status: "ended",
        message: "Lecture has ended",
        timestamp: new Date(),
      });

      // Optionally, you can force all sockets to leave the lecture room.
      io.in(lecture-${lectureId}).socketsLeave(lecture-${lectureId});

      socket.emit("end-lecture-success", { lectureId });
      console.log(Lecture ${lectureId} ended by admin ${socket.admin.email});
    } catch (error) {
      handleError(error, "end-lecture", socket);
    }
  });

  socket.on("student-join-request", async (lectureId) => {
    try {
      console.log("...................... jjjjjjjjjjjjjjjjjjjjjjjjj check 2");

      if (!socket.user) throw new Error("Unauthorized access");

      // Validate lecture ID
      if (!mongoose.isValidObjectId(lectureId)) {
        return socket.emit("lecture-error", "Invalid lecture ID format");
      }

      // Find lecture with population
      const lecture = await courseLectureModel
        .findById(lectureId)
        .populate("liveDetails.teacher", "name email")
        .populate("courseId", "title price mrp discount isFree");

      // Lecture availability checks
      if (!lecture || lecture.contentType !== "Live") {
        return socket.emit("lecture-error", "Lecture not available");
      }

      // Lecture status check
      if (lecture.liveDetails.status === "ended") {
        return socket.emit("lecture-ended");
      }

      // Course free check
      const course = await courseModel.findById(lecture.courseId);
      if (!course) throw new Error("Associated course not found");

      console.log("...................... jjjjjjjjjjjjjjjjjjjjjjjjj check ");

      // Payment verification for non-free content
      if (!lecture.isFreeContent && !course.isFree) {
        const paymentExists = await CoursePaymentModel.findOne({
          courseId: lecture.courseId,
          userId: socket.user._id,
        });

        if (!paymentExists) {
          console.log(
            ` ${
              ({
                courseId: course._id,
                title: course.title,
                price: course.price,
                mrp: course.mrp,
                discount: course.discount,
              },
              {
                amount: course.price,
                currency: "INR",
                description: course.title,
              })
            }`
          );

          console.log(
            "...................... jjjjjjjjjjjjjjjjjjjjjjjjj check 2"
          );

          return socket.emit("payment-required", {
            courseDetails: {
              courseId: course._id,
              title: course.title,
              price: course.price,
              mrp: course.mrp,
              discount: course.discount,
            },
            checkout: {
              amount: course.price,
              currency: "INR",
              description: course.title,
            },
          });
        }
      }

      console.log(
        "lecture.liveDetails.channelName.................",
        lecture.liveDetails.channelName
      );

      // Generate Agora token
      const token = generateAgoraToken(
        lecture.liveDetails.channelName,
        socket.user._id,
        "subscriber"
      );

      // Update participants list if not already joined
      await courseLectureModel.updateOne(
        {
          _id: lectureId,
          "liveDetails.participants.user": { $ne: socket.user._id },
        },
        {
          $push: {
            "liveDetails.participants": {
              user: socket.user._id,
              joinedAt: new Date(),
            },
          },
        }
      );

      // Join lecture room
      socket.join(lecture-${lectureId});

      // Notify student and others
      socket.emit("join-success", {
        token,
        channelName: lecture.liveDetails.channelName,
        teacher: lecture.liveDetails.teacher,
        status: lecture.liveDetails.status,
      });

      socket.to(lecture-${lectureId}).emit("participant-joined", {
        userId: socket.user._id,
        timestamp: new Date(),
      });
    } catch (error) {
      handleError(error, "student-join-request", socket);
    }
  });

  // Student Connection Handler
  socket.on("student-join", async (lectureId) => {
    if (!socket.user) {
      console.log(Unauthorized student connection attempt by ${socket.id});
      return;
    }

    console.log(
      Student ${socket.user.email} is attempting to join lecture: ${lectureId}
    );

    // Validate lectureId format
    if (!mongoose.Types.ObjectId.isValid(lectureId)) {
      console.log(Invalid lecture ID format: ${lectureId});
      return socket.emit("lecture-error", "Invalid lecture ID format");
    }

    try {
      const lecture = await courseLectureModel.findById(lectureId);

      if (!lecture || lecture.status === "ended") {
        console.log(Lecture not available or ended for lecture: ${lectureId});
        return socket.emit("lecture-error", "Lecture not available");
      }

      console.log(
        Lecture found: ${lectureId}, student joining room lecture-${lectureId}
      );

      // Join lecture room
      socket.join(lecture-${lectureId});

      // Update participant list
      const updateResult = await courseLectureModel.updateOne(
        { _id: lectureId, "participants.user": { $ne: socket.user._id } },
        {
          $push: {
            participants: {
              user: socket.user._id,
              joinedAt: new Date(),
              leftAt: null,
            },
          },
        }
      );

      console.log(
        Student ${socket.user.email} added to participants in lecture: ${lectureId}
      );

      // Notify others
      socket.to(lecture-${lectureId}).emit("participant-joined", {
        userId: socket.user._id,
        timestamp: new Date(),
      });

      console.log(
        Broadcasted participant joined event for student: ${socket.user.email}
      );
    } catch (error) {
      console.error("Error in student joining:", error);
      socket.emit("lecture-error", "Failed to join lecture");
    }
  });

  // Request participants list
  socket.on("request-participants", async (lectureId) => {
    try {
      if (!isValidObjectId(lectureId)) throw new Error("Invalid lecture ID");

      const participants = await getParticipantsList(lectureId);
      socket.emit("participants-update", {
        lectureId,
        participants,
        count: participants.length,
      });
    } catch (error) {
      handleError(error, "request-participants");
    }
  });

  // Admin: Remove participant
  socket.on("remove-participant", async ({ lectureId, userId }) => {
    try {
      if (!socket.admin) throw new Error("Unauthorized access");

      await courseLectureModel.updateOne(
        { _id: lectureId },
        { $set: { "liveDetails.participants.$[elem].leftAt": new Date() } },
        { arrayFilters: [{ "elem.user": userId }] }
      );

      const participants = await getParticipantsList(lectureId);

      io.to(lecture-${lectureId}).emit("participants-update", {
        lectureId,
        participants,
        count: participants.length,
        action: "remove",
        userId,
      });
    } catch (error) {
      handleError(error, "remove-participant");
    }
  });

// live chat 

// audio with condition (Admin (Participents unmute / mute ))


  // Real-time Lecture Status Updates
  socket.on("request-lecture-status", async (lectureId) => {
    try {
      const lecture = await courseLectureModel
        .findById(lectureId)
        .select("liveDetails.status");

      if (!lecture) throw new Error("Lecture not found");

      socket.emit("lecture-status-update", {
        status: lecture.liveDetails.status,
        timestamp: new Date(),
      });
    } catch (error) {
      handleError(error, "request-lecture-status", socket);
    }
  });

  // Disconnect handler
  socket.on("disconnect", async () => {
    try {
      console.log(Socket disconnected: ${socket.id});

      if (socket.admin) {
        const lectures = await courseLectureModel.find({
          "liveDetails.teacher": socket.admin._id,
          "liveDetails.status": "live",
        });

        for (const lecture of lectures) {
          await courseLectureModel.findByIdAndUpdate(lecture._id, {
            $set: { "liveDetails.status": "paused" },
            $push: {
              "liveDetails.connectionHistory": {
                action: "disconnect",
                timestamp: new Date(),
              },
            },
          });

          io.to(lecture-${lecture._id}).emit("lecture-update", {
            status: "paused",
            message: "Admin disconnected",
            timestamp: new Date(),
          });
        }
      }

      if (socket.user) {
        await courseLectureModel.updateMany(
          { "liveDetails.participants.user": socket.user._id },
          { $set: { "liveDetails.participants.$[elem].leftAt": new Date() } },
          { arrayFilters: [{ "elem.user": socket.user._id }] }
        );

        const rooms = Array.from(socket.rooms).filter((room) =>
          room.startsWith("lecture-")
        );
        rooms.forEach(async (room) => {
          const lectureId = room.split("-")[1];
          const participants = await getParticipantsList(lectureId);

          io.to(room).emit("participants-update", {
            lectureId,
            participants,
            count: participants.length,
            action: "leave",
            userId: socket.user._id,
          });
        });
      }
    } catch (error) {
      console.error("Disconnect error:", error);
    }
  });
});