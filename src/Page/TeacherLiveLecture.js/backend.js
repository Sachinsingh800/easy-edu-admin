// require("dotenv/config");

// const mongoose = require("mongoose");

// const app = require("./app");

// const { createServer } = require("http");
// const { Server } = require("socket.io");
// const jwt = require("jsonwebtoken");
// const courseLectureModel = require("./models/adminModel/adminCourseModel/adminCourseLectureModel");
// const studentAuhModel = require("./models/studentModel/studentAuthModel");
// const { generateAgoraToken } = require("./utils/agora");

// const httpServer = createServer(app);
// // const io = new Server(httpServer, {
// //   cors: {
// //     origin: ["*","http://localhost:3000", "https://live-classes.vercel.app"],
// //     methods: ["GET", "POST"],
// //     credentials: true,
// //   },
// // });

// const io = new Server(httpServer, {
//   cors: {
//     origin: "*",
//     methods: ["GET", "POST"],
//   },
// });
// const port = process.env.PORT || 4000;

// mongoose
//   .connect(process.env.MONGODB_URL_LOCAL, {
//     useNewUrlParser: true,
//     useUnifiedTopoLogy: true,
//   })

//   .then(() => console.log("MongoDB connected successfully"))
//   .catch((err) => console.log(err.message));

// io.use(async (socket, next) => {
//   try {
//     const token = socket.handshake.auth.token;
//     const userType = socket.handshake.auth.userType;

//     console.log("token: " + token);
//     console.log("userType: " + userType);

//     if (!token || !userType) {
//       throw new Error("Authentication credentials missing");
//     }

//     const secret =
//       userType === "admin"
//         ? process.env.JWT_SECRET_KEY_ADMIN
//         : process.env.JWT_SECRET_KEY_STUDENT;

//     // Verify JWT
//     const decoded = jwt.verify(token, secret);

//     // Check user existence in DB
//     const user = await studentAuhModel.findById(decoded.id);
//     if (!user) throw new Error("User not found");

//     // Attach user type specific data
//     if (userType === "admin") {
//       socket.admin = {
//         _id: user._id,
//         email: user.email,
//         role: user.role,
//       };
//     } else {
//       socket.user = {
//         _id: user._id,
//         email: user.email,
//         role: user.role,
//       };
//     }

//     next();
//   } catch (error) {
//     console.error(Socket auth error: ${error.message});
//     next(new Error("Authentication failed"));
//   }
// });

// io.on("connection", (socket) => {
//   console.log(
//     New connection: ${socket.id}, role: ${socket.admin ? "admin" : "user"}
//   );

//   /**
//    * GO-LIVE SOCKET EVENT (for Admin/Teacher)
//    *
//    * Expects the data payload to have:
//    *  - lectureId: the MongoDB ID for the lecture
//    *  - isResume: boolean indicating if the session is being resumed or started for the first time
//    */
//   socket.on("go-live", async (data) => {
//     if (!socket.admin) {
//       console.warn(Unauthorized go-live attempt from socket: ${socket.id});
//       return socket.emit("go-live-error", "Unauthorized access");
//     }

//     const { lectureId, isResume } = data;

//     // Validate lecture ID format
//     if (!mongoose.Types.ObjectId.isValid(lectureId)) {
//       console.error(Invalid lecture ID format: ${lectureId});
//       return socket.emit("go-live-error", "Invalid lecture ID format");
//     }

//     try {
//       // Find and update lecture:
//       // - Only update if the lecture's liveDetails.teacher matches the current admin ID
//       // - Set the status to 'live'
//       // - Push the connection event (start/resume) into connectionHistory
//       const lecture = await courseLectureModel.findOneAndUpdate(
//         { _id: lectureId, "liveDetails.teacher": socket.admin._id },
//         {
//           $set: { "liveDetails.status": "live" },
//           $push: {
//             "liveDetails.connectionHistory": {
//               action: isResume ? "resume" : "start",
//               timestamp: new Date(),
//             },
//           },
//         },
//         { new: true }
//       );

//       if (!lecture) {
//         console.error(
//           Lecture not available or unauthorized for lectureId: ${lectureId}
//         );
//         return socket.emit(
//           "go-live-error",
//           "Lecture not available or you are not authorized"
//         );
//       }

//       // Generate Agora token for live session
//       const token = generateAgoraToken(
//         lecture.liveDetails.channelName,
//         socket.admin._id,
//         "publisher"
//       );

//       console.log(
//         Lecture ${lectureId} is now live. Token generated for admin ${socket.admin.email}
//       );

//       // Optionally, join the lecture room if needed:
//       socket.join(lecture-${lectureId});

//       // Emit success back to the teacher with the necessary information
//       socket.emit("go-live-success", {
//         token,
//         channelName: lecture.liveDetails.channelName,
//         status: lecture.liveDetails.status,
//       });
//     } catch (error) {
//       console.error("Error in go-live event:", error.message);
//       socket.emit("go-live-error", error.message);
//     }
//   });

//   // admin Connection Handler
//   socket.on("admin-connect", async (lectureId) => {
//     if (!socket.admin) {
//       console.log(Unauthorized admin connection attempt by ${socket.id});
//       return;
//     }

//     console.log(
//       admin ${socket.admin.email} is attempting to connect to lecture: ${lectureId}
//     );
//     console.log(socket.admin._id, "admin...................................");
//     // Validate lectureId format
//     if (!mongoose.Types.ObjectId.isValid(lectureId)) {
//       console.log(Invalid lecture ID format: ${lectureId});
//       return socket.emit("lecture-error", "Invalid lecture ID format");
//     }

//     try {
//       const lecture = await courseLectureModel.findOne({
//         _id: lectureId,
//         teacher: socket.admin._id,
//       });

//       if (!lecture) {
//         console.log(
//           Lecture not found or unauthorized access by ${socket.admin.email}
//         );
//         return socket.emit("lecture-error", "Lecture not found");
//       }

//       console.log(
//         Lecture found: ${lectureId}, joining room lecture-${lectureId}
//       );

//       // Join lecture room
//       socket.join(lecture-${lectureId});

//       // Update lecture status
//       const updatedLecture = await courseLectureModel.findByIdAndUpdate(
//         lectureId,
//         {
//           status: "live",
//           $push: {
//             connectionHistory: {
//               action: lecture.status === "paused" ? "reconnect" : "connect",
//               timestamp: new Date(),
//             },
//           },
//         },
//         { new: true }
//       );

//       console.log(Lecture status updated to live for lecture: ${lectureId});

//       // Broadcast to all participants
//       io.to(lecture-${lectureId}).emit("lecture-update", {
//         status: "live",
//         message: "admin has joined the lecture",
//         teacher: socket.admin.email,
//         timestamp: new Date(),
//       });

//       console.log(Broadcasted lecture update for lecture: ${lectureId});

//       // Send confirmation to teacher
//       socket.emit("lecture-connected", {
//         channelName: lecture.channelName,
//         participants: updatedLecture.participants,
//       });

//       console.log(
//         Teacher ${socket.admin.email} connected to lecture: ${lectureId}
//       );
//     } catch (error) {
//       console.error("Error in teacher connection:", error);
//       socket.emit("lecture-error", "Failed to connect to lecture");
//     }
//   });

//   /**
//    * end-lecture event: Admin ends a live lecture.
//    * This updates the lecture's status to "ended" and notifies all participants.
//    */
//   socket.on("end-lecture", async (lectureId) => {
//     if (!socket.admin) {
//       console.warn(
//         Unauthorized end-lecture attempt from socket: ${socket.id}
//       );
//       return socket.emit("end-lecture-error", "Unauthorized access");
//     }

//     if (!mongoose.Types.ObjectId.isValid(lectureId)) {
//       console.error(Invalid lecture ID format: ${lectureId});
//       return socket.emit("end-lecture-error", "Invalid lecture ID format");
//     }

//     try {
//       const lecture = await courseLectureModel.findOneAndUpdate(
//         { _id: lectureId, "liveDetails.teacher": socket.admin._id },
//         {
//           $set: { status: "ended", "liveDetails.status": "ended" },
//           $push: {
//             connectionHistory: {
//               action: "end",
//               timestamp: new Date(),
//             },
//           },
//         },
//         { new: true }
//       );

//       if (!lecture) {
//         console.error(
//           Lecture not available or unauthorized for lectureId: ${lectureId}
//         );
//         return socket.emit(
//           "end-lecture-error",
//           "Lecture not available or you are not authorized"
//         );
//       }

//       // Broadcast the end-of-lecture event to all participants
//       io.to(lecture-${lectureId}).emit("lecture-ended", {
//         status: "ended",
//         message: "Lecture has ended",
//         timestamp: new Date(),
//       });

//       // Optionally, you can force all sockets to leave the lecture room.
//       io.in(lecture-${lectureId}).socketsLeave(lecture-${lectureId});

//       socket.emit("end-lecture-success", { lectureId });
//       console.log(Lecture ${lectureId} ended by admin ${socket.admin.email});
//     } catch (error) {
//       console.error("Error in end-lecture event:", error.message);
//       socket.emit("end-lecture-error", error.message);
//     }
//   });

//   // Student Connection Handler
//   socket.on("student-join", async (lectureId) => {
//     if (!socket.user) {
//       console.log(Unauthorized student connection attempt by ${socket.id});
//       return;
//     }

//     console.log(
//       Student ${socket.user.email} is attempting to join lecture: ${lectureId}
//     );

//     // Validate lectureId format
//     if (!mongoose.Types.ObjectId.isValid(lectureId)) {
//       console.log(Invalid lecture ID format: ${lectureId});
//       return socket.emit("lecture-error", "Invalid lecture ID format");
//     }

//     try {
//       const lecture = await courseLectureModel.findById(lectureId);

//       if (!lecture || lecture.status === "ended") {
//         console.log(Lecture not available or ended for lecture: ${lectureId});
//         return socket.emit("lecture-error", "Lecture not available");
//       }

//       console.log(
//         Lecture found: ${lectureId}, student joining room lecture-${lectureId}
//       );

//       // Join lecture room
//       socket.join(lecture-${lectureId});

//       // Update participant list
//       const updateResult = await courseLectureModel.updateOne(
//         { _id: lectureId, "participants.user": { $ne: socket.user._id } },
//         {
//           $push: {
//             participants: {
//               user: socket.user._id,
//               joinedAt: new Date(),
//               leftAt: null,
//             },
//           },
//         }
//       );

//       console.log(
//         Student ${socket.user.email} added to participants in lecture: ${lectureId}
//       );

//       // Notify others
//       socket.to(lecture-${lectureId}).emit("participant-joined", {
//         userId: socket.user._id,
//         timestamp: new Date(),
//       });

//       console.log(
//         Broadcasted participant joined event for student: ${socket.user.email}
//       );
//     } catch (error) {
//       console.error("Error in student joining:", error);
//       socket.emit("lecture-error", "Failed to join lecture");
//     }
//   });

//   // Handle Disconnections
//   socket.on("disconnect", async () => {
//     console.log(Socket disconnected: ${socket.id});

//     try {
//       // Handle teacher (admin) disconnection
//       if (socket.admin) {
//         console.log(Admin ${socket.admin.email} disconnected);
//         const lectures = await courseLectureModel.find({
//           teacher: socket.admin._id,
//           status: "live",
//         });

//         for (const lecture of lectures) {
//           console.log(
//             Pausing lecture: ${lecture._id} due to admin disconnection
//           );
//           await courseLectureModel.findByIdAndUpdate(lecture._id, {
//             status: "paused",
//             $push: {
//               connectionHistory: {
//                 action: "disconnect",
//                 timestamp: new Date(),
//               },
//             },
//           });
//           io.to(lecture-${lecture._id}).emit("lecture-update", {
//             status: "paused",
//             message: "Admin disconnected",
//             timestamp: new Date(),
//           });
//         }
//       }

//       // Handle student disconnection
//       if (socket.user) {
//         console.log(Student ${socket.user.email} disconnected);

//         // Use courseLectureModel to update participant leftAt timestamp.
//         await courseLectureModel.updateMany(
//           { "participants.user": socket.user._id },
//           {
//             $set: { "participants.$[elem].leftAt": new Date() },
//           },
//           { arrayFilters: [{ "elem.user": socket.user._id }] }
//         );
//         io.emit("participant-left", {
//           userId: socket.user._id,
//           timestamp: new Date(),
//         });
//       }
//     } catch (error) {
//       console.error("Error during disconnection:", error.message);
//     }
//   });
// });

// httpServer.listen(port, () => {
//   console.log(🚀 Server running on port ${port});
// });