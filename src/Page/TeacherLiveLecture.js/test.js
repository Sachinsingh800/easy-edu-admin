...   socket.on("mute-student", ({ lectureId, userId }) => {
  console.log(
    [mute-student] Received request: lectureId=${lectureId}, userId=${userId}, admin=${socket.admin}
  );
  try {
    // Check if the socket is authenticated as admin.
    if (!socket.admin) {
      console.error("[mute-student] Unauthorized access attempted");
      throw new Error("Unauthorized access");
    }
    console.log("[mute-student] Authorized admin access confirmed");

    // Emit to the specified user to mute the microphone.
    io.to(userId).emit("audio-control", {
      mute: true,
      lectureId,
      message: "Your microphone has been muted by the admin.",
    });
    console.log(
      [mute-student] Mute command emitted to userId=${userId} for lectureId=${lectureId}
    );
  } catch (error) {
    console.error([mute-student] Error: ${error.message});
    handleError(error, "mute-student");
  }
});

socket.on("unmute-student", ({ lectureId, userId }) => {
  console.log(
    [unmute-student] Received request: lectureId=${lectureId}, userId=${userId}, admin=${socket.admin}
  );
  try {
    // Check if the socket is authenticated as admin.
    if (!socket.admin) {
      console.error("[unmute-student] Unauthorized access attempted");
      throw new Error("Unauthorized access");
    }
    console.log("[unmute-student] Authorized admin access confirmed");

    // Emit to the specified user to unmute the microphone.
    io.to(userId).emit("audio-control", {
      mute: false,
      lectureId,
      message: "Your microphone has been enabled by the admin.",
    });
    console.log(
      [unmute-student] Unmute command emitted to userId=${userId} for lectureId=${lectureId}
    );
  } catch (error) {
    console.error([unmute-student] Error: ${error.message});
    handleError(error, "unmute-student");
  }
});


// strict mute All  // unmute desired

// In Progress ...

// --------------------------
// Block Self-Unmute: If a student attempts to unmute themselves, block it.
// --------------------------
socket.on("student-unmute-request", () => {
  if (socket.user) {
    socket.emit("unmute-blocked", {
      unmuteBlocked: true,
      mute: true,
      message:
        "You are not allowed to unmute yourself. Please wait for admin permission.",
    });
  }
});

// --------------------------
// Admin: Unblock unmute for a specific student
// --------------------------
socket.on("unblock-student", ({ lectureId, userId }) => {
  try {
    if (!socket.admin) throw new Error("Unauthorized access");
    console.log(Admin ${socket.admin._id} unblocking student ${userId});
    io.to(userId).emit("audio-control", {
      unmuteBlocked: false,
      mute: true,
      lectureId,
      message: "Admin has unblocked your unmute. You may now unmute.",
    });
  } catch (error) {
    handleError(error, "unblock-student");
  }
});

// --------------------------
// Admin: Unblock unmute for all students in a lecture
// --------------------------
socket.on("unblock-all", ({ lectureId }) => {
  try {
    if (!socket.admin) throw new Error("Unauthorized access");
    console.log(
      Admin ${socket.admin._id} unblocking unmute for all students in lecture ${lectureId}
    );
    io.to(lecture-${lectureId}).emit("audio-control", {
      unmuteBlocked: false,
      // mute: false,
      lectureId,
      message: "Admin has unblocked unmute for all. You may now unmute.",
    });
  } catch (error) {
    handleError(error, "unblock-all");
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

httpServer.listen(port, () => {
console.log(🚀 Server running on port ${port});
});