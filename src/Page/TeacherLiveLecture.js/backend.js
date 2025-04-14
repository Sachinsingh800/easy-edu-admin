require("dotenv/config");
const mongoose = require("mongoose");
const app = require("./app");
const { createServer } = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

// Models
const courseLectureModel = require("./models/adminModel/adminCourseModel/adminCourseLectureModel");
const studentAuthModel = require("./models/studentModel/studentAuthModel");
const adminAuthModel = require("./models/adminModel/adminAuthModel");
const CoursePaymentModel = require("./models/studentModel/studentCoursePaymentModel");
const courseModel = require("./models/adminModel/adminCourseModel/adminCourseModel");

// Utils
const { generateAgoraToken } = require("./utils/agora");
const { isValidObjectId } = require("mongoose");

// Create HTTP server from Express app
const httpServer = createServer(app);
const port = process.env.PORT || 3003;

// Create Socket.IO server with global CORS allowing all origins
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Database connection
mongoose
  .connect(process.env.MONGODB_URL_LOCAL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected successfully"))
  .catch(err => console.error("MongoDB connection error:", err));

// ===============================================================
// Utility Functions
// ===============================================================

// This function fetches the lecture document, populates the participants,
// and filters the list to include only "active" participants (where leftAt is null).
const getParticipantsList = async (lectureId) => {
  console.log([getParticipantsList] Called for lectureId: ${lectureId});
  const lecture = await courseLectureModel
    .findById(lectureId)
    .populate("liveDetails.participants.user", "name email avatar _id")
    .select("liveDetails.participants");
  
  if (!lecture) {
    console.warn([getParticipantsList] No lecture found for ID: ${lectureId});
    return [];
  }
  
  console.log([getParticipantsList] Total participants fetched: ${lecture.liveDetails.participants.length});
  
  // Group by user._id (string) and select only records with leftAt === null.
  // (If there are multiple records per user, select the one with the latest joinedAt.)
  const uniqueParticipants = {};
  lecture.liveDetails.participants.forEach((p, index) => {
    if (!p.leftAt) {
      const uid = p.user._id.toString();
      console.log([getParticipantsList] Active record found for user ${uid} at index ${index} with joinedAt: ${p.joinedAt});
      if (
        !uniqueParticipants[uid] ||
        new Date(p.joinedAt) > new Date(uniqueParticipants[uid].joinedAt)
      ) {
        uniqueParticipants[uid] = p;
        console.log([getParticipantsList] Unique participant updated for user ${uid});
      }
    }
  });
  
  const activeParticipants = Object.values(uniqueParticipants);
  console.log([getParticipantsList] Unique active participants count: ${activeParticipants.length});
  return activeParticipants;
};

// Emit the updated participant list for a lecture room.
const emitParticipantsUpdate = async (lectureId) => {
  console.log([emitParticipantsUpdate] Emitting participants update for lectureId: ${lectureId});
  try {
    const participants = await getParticipantsList(lectureId);
    console.log([emitParticipantsUpdate] Emitting ${participants.length} active participants to room lecture-${lectureId});
    io.to(lecture-${lectureId}).emit("participants-update", {
      lectureId,
      participants,
      count: participants.length,
      timestamp: new Date()
    });
  } catch (error) {
    console.error("[emitParticipantsUpdate] Error emitting participants update:", error);
  }
};

// ===============================================================
// Socket Authentication Middleware
// ===============================================================
io.use(async (socket, next) => {
  try {
    const { token, userType } = socket.handshake.auth;
    if (!token || !userType) throw new Error("Authentication credentials missing");

    const secret = userType === "admin"
      ? process.env.JWT_SECRET_KEY_ADMIN
      : process.env.JWT_SECRET_KEY_STUDENT;

    const decoded = jwt.verify(token, secret);
    const UserModel = userType === "admin" ? adminAuthModel : studentAuthModel;
    const user = await UserModel.findById(decoded._id).select("-password");

    if (!user) throw new Error("User not found");
    // Attach user data to the socket under the property name "admin" or "user"
    socket[userType] = user;
    next();
  } catch (error) {
    console.error(Socket auth error: ${error.message});
    next(new Error("Authentication failed"));
  }
});

// ===============================================================
// Socket Connection and Event Handlers
// ===============================================================
io.on("connection", (socket) => {
  console.log(New connection: ${socket.id}, role: ${socket.admin ? "admin" : "user"});

  // Utility for error handling: logs and emits a socket error event.
  const handleError = (error, event) => {
    console.error(Socket ${event} error:, error);
    socket.emit("socket-error", { event, message: error.message });
  };

  // --------------------------
  // Admin: Start/Resume Lecture
  // --------------------------
  socket.on("go-live", async ({ lectureId, isResume }) => {
    try {
      if (!socket.admin) throw new Error("Unauthorized access");
      if (!mongoose.Types.ObjectId.isValid(lectureId))
        throw new Error("Invalid lecture ID");

      const lecture = await courseLectureModel.findOneAndUpdate(
        { _id: lectureId, "liveDetails.teacher": socket.admin._id },
        {
          $set: { "liveDetails.status": "live" },
          $push: {
            "liveDetails.connectionHistory": {
              action: isResume ? "resume" : "start",
              timestamp: new Date()
            }
          }
        },
        { new: true }
      );
      if (!lecture) throw new Error("Lecture not found or unauthorized");

      const agoraToken = generateAgoraToken(
        lecture.liveDetails.channelName,
        socket.admin._id.toString(),
        "publisher"
      );
      socket.join(lecture-${lectureId});
      socket.emit("go-live-success", {
        token: agoraToken,
        channelName: lecture.liveDetails.channelName,
        status: lecture.liveDetails.status
      });
    } catch (error) {
      handleError(error, "go-live");
    }
  });

  // --------------------------
  // Admin: End Lecture
  // --------------------------
  socket.on("end-lecture", async (lectureId) => {
    try {
      if (!socket.admin) throw new Error("Unauthorized access");
      if (!mongoose.Types.ObjectId.isValid(lectureId))
        throw new Error("Invalid lecture ID");

      const lecture = await courseLectureModel.findOneAndUpdate(
        { _id: lectureId, "liveDetails.teacher": socket.admin._id },
        {
          $set: { "liveDetails.status": "ended" },
          $push: {
            "liveDetails.connectionHistory": {
              action: "end",
              timestamp: new Date()
            }
          }
        },
        { new: true }
      );
      if (!lecture) throw new Error("Lecture not found or unauthorized");

      // Mark all participant records as left for this lecture.
      await courseLectureModel.updateMany(
        { _id: lectureId },
        { $set: { "liveDetails.participants.$[].leftAt": new Date() } }
      );
      io.to(lecture-${lectureId}).emit("lecture-ended", {
        status: "ended",
        message: "Lecture has ended",
        timestamp: new Date()
      });
      await emitParticipantsUpdate(lectureId);
      io.in(lecture-${lectureId}).socketsLeave(lecture-${lectureId});
      socket.emit("end-lecture-success", { lectureId });
    } catch (error) {
      handleError(error, "end-lecture");
    }
  });

  // --------------------------
  // Student: Join Lecture Request
  // --------------------------
  socket.on("student-join-request", async (lectureId) => {
    try {
      if (!socket.user) throw new Error("Unauthorized access");
      if (!mongoose.Types.ObjectId.isValid(lectureId))
        throw new Error("Invalid lecture ID");

      // Find lecture with population of teacher and course information
      const lecture = await courseLectureModel.findById(lectureId)
        .populate("liveDetails.teacher", "name email")
        .populate("courseId", "title price mrp discount isFree");

      if (!lecture || lecture.contentType !== "Live")
        throw new Error("Lecture not available");
      if (lecture.liveDetails.status === "ended")
        return socket.emit("lecture-ended");

      // Payment check for non-free content
      const course = await courseModel.findById(lecture.courseId);
      if (!course) throw new Error("Associated course not found");
      if (!lecture.isFreeContent && !course.isFree) {
        const paymentExists = await CoursePaymentModel.findOne({
          courseId: course._id,
          userId: socket.user._id,
        });
        if (!paymentExists) {
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

      // Generate Agora token for subscriber
      const agoraToken = generateAgoraToken(
        lecture.liveDetails.channelName,
        socket.user._id.toString(),
        "subscriber"
      );

      // Refresh the join record: if an existing participant record exists, update leftAt to null.
      const existingRecord = lecture.liveDetails.participants.find(
        (p) => p.user.toString() === socket.user._id.toString()
      );
      if (existingRecord) {
        await courseLectureModel.updateOne(
          {
            _id: lectureId,
            "liveDetails.participants.user": socket.user._id,
          },
          {
            $set: {
              "liveDetails.participants.$.leftAt": null,
              "liveDetails.participants.$.joinedAt": new Date(),
            },
          }
        );
        console.log(Updated join record for user ${socket.user._id} in lecture ${lectureId});
      } else {
        await courseLectureModel.updateOne(
          { _id: lectureId },
          {
            $push: {
              "liveDetails.participants": {
                user: socket.user._id,
                joinedAt: new Date(),
              },
            },
          }
        );
        console.log(Added new join record for user ${socket.user._id} in lecture ${lectureId});
      }

      socket.join(lecture-${lectureId});
      await emitParticipantsUpdate(lectureId);
      socket.emit("join-success", {
        token: agoraToken,
        channelName: lecture.liveDetails.channelName,
        teacher: lecture.liveDetails.teacher,
        status: lecture.liveDetails.status,
      });
      socket.to(lecture-${lectureId}).emit("participant-joined", {
        userId: socket.user._id,
        timestamp: new Date(),
      });
    } catch (error) {
      handleError(error, "student-join-request");
    }
  });

  // --------------------------
  // Student: Alternative join event (if needed)
  // --------------------------
  socket.on("student-join", async (lectureId) => {
    try {
      if (!socket.user) throw new Error("Unauthorized access");
      if (!isValidObjectId(lectureId))
        throw new Error("Invalid lecture ID format");

      const lecture = await courseLectureModel.findById(lectureId);
      if (!lecture || lecture.status === "ended")
        throw new Error("Lecture not available");

      socket.join(lecture-${lectureId});

      // Update join record similar to the student-join-request event.
      const existingRecord = lecture.liveDetails.participants.find(
        (p) => p.user.toString() === socket.user._id.toString()
      );
      if (existingRecord) {
        await courseLectureModel.updateOne(
          {
            _id: lectureId,
            "liveDetails.participants.user": socket.user._id,
          },
          {
            $set: {
              "liveDetails.participants.$.leftAt": null,
              "liveDetails.participants.$.joinedAt": new Date(),
            },
          }
        );
      } else {
        await courseLectureModel.updateOne(
          { _id: lectureId },
          {
            $push: {
              "liveDetails.participants": {
                user: socket.user._id,
                joinedAt: new Date(),
                leftAt: null,
              },
            },
          }
        );
      }
      socket.to(lecture-${lectureId}).emit("participant-joined", {
        userId: socket.user._id,
        timestamp: new Date(),
      });
      socket.emit("audio-control", {
        mute: true,
        lectureId,
        message: "You have been muted by default.",
      });
    } catch (error) {
      console.error("Error in student-join event:", error);
      socket.emit("lecture-error", "Failed to join lecture");
    }
  });

  // --------------------------
  // Request participants list on demand
  // --------------------------
  socket.on("request-participants", async (lectureId) => {
    console.log([request-participants] Request received for lectureId: ${lectureId});
    try {
      if (!isValidObjectId(lectureId)) throw new Error("Invalid lecture ID");
      const participants = await getParticipantsList(lectureId);
      console.log([request-participants] Sending participants update with ${participants.length} entries);
      socket.emit("participants-update", {
        lectureId,
        participants,
        count: participants.length,
      });
    } catch (error) {
      console.error("[request-participants] Error:", error.message);
      handleError(error, "request-participants");
    }
  });

  // --------------------------
  // Admin: Remove participant (force disconnect)
  // --------------------------
  socket.on("remove-participant", async ({ lectureId, userId }) => {
    try {
      if (!socket.admin) throw new Error("Unauthorized access");
      await courseLectureModel.updateOne(
        { _id: lectureId },
        { $set: { "liveDetails.participants.$[elem].leftAt": new Date() } },
        { arrayFilters: [{ "elem.user": userId }] }
      );
      await emitParticipantsUpdate(lectureId);
      io.to(userId).emit("force-disconnect", { reason: "Removed by admin" });
    } catch (error) {
      handleError(error, "remove-participant");
    }
  });

  // --------------------------
  // Real-time lecture status updates
  // --------------------------
  socket.on("request-lecture-status", async (lectureId) => {
    try {
      const lecture = await courseLectureModel.findById(lectureId).select("liveDetails.status");
      if (!lecture) throw new Error("Lecture not found");
      socket.emit("lecture-status-update", {
        status: lecture.liveDetails.status,
        timestamp: new Date(),
      });
    } catch (error) {
      handleError(error, "request-lecture-status");
    }
  });

  // --------------------------
  // Mute/Unmute events: Admin controls
  // --------------------------
  socket.on("mute-student", ({ lectureId, userId }) => {
    try {
      if (!socket.admin) throw new Error("Unauthorized access");
      io.to(userId).emit("audio-control", {
        mute: true,
        lectureId,
        message: "Your microphone has been muted by the admin."
      });
    } catch (error) {
      handleError(error, "mute-student");
    }
  });

  socket.on("unmute-student", ({ lectureId, userId }) => {
    try {
      if (!socket.admin) throw new Error("Unauthorized access");
      io.to(userId).emit("audio-control", {
        mute: false,
        lectureId,
        message: "Your microphone has been enabled by the admin."
      });
    } catch (error) {
      handleError(error, "unmute-student");
    }
  });

  // --------------------------
  // Disconnect handler: Update participant status and emit updated list
  // --------------------------
  socket.on("disconnect", async () => {
    try {
      console.log(Socket disconnected: ${socket.id});

      if (socket.admin) {
        const lectures = await courseLectureModel.find({
          "liveDetails.teacher": socket.admin._id,
          "liveDetails.status": "live"
        });
        for (const lecture of lectures) {
          await courseLectureModel.findByIdAndUpdate(lecture._id, {
            $set: { "liveDetails.status": "paused" },
            $push: {
              "liveDetails.connectionHistory": {
                action: "disconnect",
                timestamp: new Date()
              }
            }
          });
          io.to(lecture-${lecture._id}).emit("lecture-update", {
            status: "paused",
            message: "Admin disconnected",
            timestamp: new Date()
          });
        }
      }

      if (socket.user) {
        // Update this user's participant records as left (set leftAt).
        await courseLectureModel.updateMany(
          { "liveDetails.participants.user": socket.user._id },
          { $set: { "liveDetails.participants.$[elem].leftAt": new Date() } },
          { arrayFilters: [{ "elem.user": socket.user._id }] }
        );
        // For each lecture room that this socket was in, emit updated participants list.
        const rooms = Array.from(socket.rooms).filter(room => room.startsWith("lecture-"));
        for (const room of rooms) {
          const lecId = room.split("-")[1];
          await emitParticipantsUpdate(lecId);
        }
      }
    } catch (error) {
      console.error("Disconnect error:", error.message);
    }
  });
});

httpServer.listen(port, () => {
  console.log(🚀 Server running on port ${port});
});