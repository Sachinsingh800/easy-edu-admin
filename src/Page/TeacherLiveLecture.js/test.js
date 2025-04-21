// Send a new chat message (public vs private)

  // -------------------------------------------------
  socket.on("send-message", async ({ lectureId, message }) => {
    try {
      if (!socket.user && !socket.admin) throw new Error("Unauthorized");

      // fetch lecture flags + teacher
      const lecture = await courseLectureModel
        .findById(lectureId)
        .select("privateChat liveDetails.teacher messagingDisabled")
        .lean();
      if (!lecture) throw new Error("Lecture not found");
      if (lecture.messagingDisabled) {
        return socket.emit("socket-error", {
          event: "send-message",
          message: "Messaging is disabled on this lecture.",
        });
      }

      // persist
      const newMsg = await LiveMessageModel.create({
        lectureId,
        sender: socket.user?._id || socket.admin._id,
        senderModel: socket.user ? "studentAuthModel" : "adminAuthModel",
        message,
        isAdminMessage: !! socket.admin,
      });

      // common payload
      const payload = {
        _id: newMsg._id,
        lectureId: newMsg.lectureId,
        sender: socket.user || socket.admin,
        senderModel: newMsg.senderModel,
        message: newMsg.message,
        isAdminMessage: newMsg.isAdminMessage,
        createdAt: newMsg.createdAt,
      };

      if (!lecture.privateChat) {
        // broadcast to all participants
        io.to(lecture-${lectureId}).emit("new-message", payload);
      } else {
        // private: only to sender + teacher
        socket.emit("new-message", payload);
        io.to(lecture.liveDetails.teacher.toString()).emit(
          "new-message",
          payload
        );
      }
    } catch (err) {
      console.error("send-message error:", err);
      socket.emit("socket-error", {
        event: "send-message",
        message: err.message,
      });
    }
  });

  // --------------------------
  // Client requests full message history
  // --------------------------
  socket.on("request-message-history-admin", async ({ lectureId }) => {
    try {
      if (!socket.user && !socket.admin) throw new Error("Unauthorized");

      // fetch & sort
      const msgs = await LiveMessageModel.find({ lectureId })
        .populate("sender", "name email role")
        .sort({ createdAt: 1 })
        .lean();

      // send back
      socket.emit("message-history", msgs);
    } catch (err) {
      console.error("request-message-history error:", err);
      socket.emit("socket-error", {
        event: "request-message-history",
        message: err.message,
      });
    }
  });

  // --------------------------
  // Admin deletes a message
  // -------------------------------------------------
  socket.on("delete-message", async ({ messageId }) => {
    try {
      if (!socket.admin) throw new Error("Unauthorized");

      const msg = await LiveMessageModel.findByIdAndDelete(messageId);
      if (!msg) throw new Error("Message not found");

      // notify everyone in the lecture (public or private—they'll filter it)
      io.to(lecture-${msg.lectureId}).emit("message-deleted", msg._id);
    } catch (err) {
      console.error("delete-message error:", err);
      socket.emit("socket-error", {
        event: "delete-message",
        message: err.message,
      });
    }
  });

  // Client requests full message history
  // -------------------------------------------------
  socket.on("request-message-history-student", async ({ lectureId }) => {
    try {
      if (!socket.user && !socket.admin) throw new Error("Unauthorized");

      // load lecture to check privateChat
      const lecture = await courseLectureModel
        .findById(lectureId)
        .select("privateChat liveDetails.teacher")
        .lean();
      if (!lecture) throw new Error("Lecture not found");

      // fetch & sort
      let msgs = await LiveMessageModel.find({ lectureId })
        .populate("sender", "name email")
        .sort({ createdAt: 1 })
        .lean();

      if (lecture.privateChat && socket.user) {
        // students only see their own messages
        msgs = msgs.filter(
          (m) =>
            m.senderModel === "adminAuthModel" ||
            m.sender.toString() === socket.user._id.toString()
        );
      }

      socket.emit("message-history", msgs);
    } catch (err) {
      console.error("request-message-history error:", err);
      socket.emit("socket-error", {
        event: "request-message-history",
        message: err.message,
      });
    }
  });

  // admin make PrivateChat or Public Chat
  // -------------------------------------------------
  socket.on("set-private-public-chat", async (data) => {
    try {
      let { lectureId, privateChat, messagingDisabled } = data;

      if (!socket.admin) throw new Error("Unauthorized");

      isPrivate = validateBooleanValue(privateChat);

      messagingDisabled = validateBooleanValue(messagingDisabled);

      if (typeof privateChat !== "boolean")
        throw new Error("Invalid value for privateChat");
      if (typeof messagingDisabled !== "boolean") {
        throw new Error("Invalid value for messagingDisabled");
      }
      if (!isValidObjectId(lectureId)) throw new Error("Invalid lecture ID");

      const lecture = await courseLectureModel.findByIdAndUpdate(
        lectureId,
        { ...data },
        { new: true }
      );
      if (!lecture) throw new Error("Lecture not found");

      // Notify all participants in the lecture room about the change
      io.to(lecture-${lectureId}).emit("private-chat-updated", {
        privateChat: lecture.privateChat,
        messagingDisabled: lecture.messagingDisabled,
        message: `Chat mode changed to ${
          isPrivate ? "private" : "public"
        } and messaging is ${messagingDisabled ? "disabled" : "enabled"}`,
      });
      console.log(
        Private chat mode set to ${isPrivate} for lecture ${lectureId}
      );
    } catch (error) {
      console.error("Error setting private chat:", error.message);
      socket.emit("socket-error", {
        message: error.message,
      });
    }
  });

  //

  // --------------------------
  // Disconnect handler: Update participant status and emit updated list
  // --------------------------
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
        // Update this user's participant records as left (set leftAt).
        await courseLectureModel.updateMany(
          { "liveDetails.participants.user": socket.user._id },
          { $set: { "liveDetails.participants.$[elem].leftAt": new Date() } },
          { arrayFilters: [{ "elem.user": socket.user._id }] }
        );
        // For each lecture room that this socket was in, emit updated participants list.
        const rooms = Array.from(socket.rooms).filter((room) =>
          room.startsWith("lecture-")
        );
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