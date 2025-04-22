// TeacherLiveLecture.jsx
import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import AgoraRTC from "agora-rtc-sdk-ng";
import Cookies from "js-cookie";
import {
  Box,
  Container,
  Typography,
  Snackbar,
  CircularProgress,
  Fade,
  Slide,
  IconButton,
  Drawer,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  PeopleOutline,
  ChatBubbleOutline,
  Close,
  Videocam,
  VideocamOff,
  Mic,
  MicOff,
  VolumeUp,
  VolumeOff,
} from "@mui/icons-material";
import { LiveTv, FiberManualRecord } from "@mui/icons-material";
import { StatusChip } from "./StatusChip";
import { LectureInfo } from "./LectureInfo";
import { Controls } from "./Controls";
import { ParticipantsList } from "./ParticipantsList";
import ChatSection from "./ChatSection";
import styles from "./TeacherLiveLecture.module.css";

const TeacherLiveLecture = () => {
  const { lectureId } = useParams();
  const [status, setStatus] = useState("disconnected");
  const [channelName, setChannelName] = useState("");
  const [agoraToken, setAgoraToken] = useState("");
  const [message, setMessage] = useState("");
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [participantCount, setParticipantCount] = useState(0);
  const [activeUsers, setActiveUsers] = useState(new Map());
  const [mutedStudents, setMutedStudents] = useState(new Set());
  const [enableSound, setEnableSound] = useState(true);
  const [messages, setMessages] = useState([]);
  const [isPrivateChat, setIsPrivateChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Modified panel handlers for mobile
  const handleToggleParticipants = () => {
    if (isMobile) setShowChat(false);
    setShowParticipants(!showParticipants);
  };

  const handleToggleChat = () => {
    if (isMobile) setShowParticipants(false);
    setShowChat(!showChat);
  };

  const localStreamRef = useRef(null);
  const clientRef = useRef(null);
  const socketRef = useRef(null);
  const videoContainerRef = useRef(null);
  const audioTracksRef = useRef(new Map());
  const muteSoundRef = useRef(null);
  const unmuteSoundRef = useRef(null);
  const profile = JSON.parse(localStorage.getItem("profile"));
  const token = Cookies.get("token");

  // Message handlers
  const handleSendMessage = (messageText) => {
    if (!messageText.trim()) return;
    socketRef.current.emit("send-message", {
      lectureId,
      message: messageText,
    });
  };

  const handleDeleteMessage = (messageId) => {
    socketRef.current.emit("delete-message", { messageId });
  };

  // Request message history when connected
  useEffect(() => {
    if (socketRef.current && status === "connected") {
      socketRef.current.emit("request-message-history-admin", { lectureId });
    }
  }, [status, lectureId]);

  // Audio control handlers
  const handleBlockAll = () => {
    socketRef.current.emit("student-unmute-request", { lectureId });
    setMutedStudents(new Set([...participants.map((p) => p.user?._id)]));
  };

  const handleUnblockStudent = (userId) => {
    socketRef.current.emit("unblock-student", { lectureId, userId });
    setMutedStudents(
      (prev) => new Set([...prev].filter((id) => id !== userId))
    );
  };

  const handleBlockStudent = (userId) => {
    socketRef.current.emit("block-student", { lectureId, userId });
    setMutedStudents((prev) => new Set([...prev, userId]));
  };

  const handleUnblockAll = () => {
    socketRef.current.emit("unblock-all", { lectureId });
    setMutedStudents(new Set());
  };

  // Handle sound control for all audio tracks
  useEffect(() => {
    const updateAllAudioTracks = () => {
      audioTracksRef.current.forEach((track) => {
        try {
          track.setVolume(enableSound ? 100 : 0);
        } catch (error) {
          console.error("Error setting audio volume:", error);
        }
      });
    };
    updateAllAudioTracks();
  }, [enableSound]);

  const initializeAgora = async () => {
    const client = AgoraRTC.createClient({ mode: "live", codec: "vp8" });
    clientRef.current = client;
    await client.setClientRole("host");
    return client;
  };

  const handleUserPublished = async (user, mediaType) => {
    await clientRef.current.subscribe(user, mediaType);

    if (mediaType === "video") {
      const remotePlayerContainer = document.createElement("div");
      remotePlayerContainer.id = user.uid;
      remotePlayerContainer.style.width = "320px";
      remotePlayerContainer.style.height = "240px";
      remotePlayerContainer.style.margin = "10px";
      videoContainerRef.current.appendChild(remotePlayerContainer);
      user.videoTrack.play(remotePlayerContainer);
    }

    if (mediaType === "audio") {
      audioTracksRef.current.set(user.uid, user.audioTrack);
      user.audioTrack.play();
      user.audioTrack.setVolume(enableSound ? 100 : 0);
    }

    setActiveUsers(
      (prev) =>
        new Map(
          prev.set(user.uid, {
            uid: user.uid,
            hasAudio: user.hasAudio,
            hasVideo: user.hasVideo,
          })
        )
    );
  };

  const handleUserUnpublished = (user) => {
    setActiveUsers((prev) => {
      const newMap = new Map(prev);
      newMap.delete(user.uid);
      return newMap;
    });
    const element = document.getElementById(user.uid);
    if (element) element.remove();
    audioTracksRef.current.delete(user.uid);
  };

  const startBroadcast = async () => {
    setLoading(true);
    try {
      const client = await initializeAgora();
      const uid = profile._id;

      client.on("user-published", handleUserPublished);
      client.on("user-unpublished", handleUserUnpublished);
      client.on("user-mute-audio", (user, muted) => {
        setMutedStudents((prev) => {
          const newSet = new Set(prev);
          muted ? newSet.add(user.uid) : newSet.delete(user.uid);
          return newSet;
        });
      });

      await client.join(
        "90dde3ee5fbc4fe5a6a876e972c7bb2a",
        channelName,
        agoraToken,
        uid
      );

      const [audioTrack, videoTrack] = await Promise.all([
        AgoraRTC.createMicrophoneAudioTrack(),
        AgoraRTC.createCameraVideoTrack(),
      ]);

      localStreamRef.current = { audioTrack, videoTrack };
      await client.publish([audioTrack, videoTrack]);
      videoTrack.play(videoContainerRef.current);

      setStatus("connected");
      socketRef.current.emit("admin-connect", lectureId);
    } catch (error) {
      console.error("Broadcast Error:", error);
      setMessage(`Broadcast Error: ${error.message}`);
      stopBroadcast();
    } finally {
      setLoading(false);
    }
  };

  const stopBroadcast = async () => {
    setLoading(true);
    try {
      if (clientRef.current) {
        clientRef.current.off("user-published", handleUserPublished);
        clientRef.current.off("user-unpublished", handleUserUnpublished);
        clientRef.current.off("user-mute-audio");
        await clientRef.current.leave();
        clientRef.current = null;
      }
      if (localStreamRef.current) {
        localStreamRef.current.audioTrack?.close();
        localStreamRef.current.videoTrack?.close();
        localStreamRef.current = null;
      }
      setActiveUsers(new Map());
      setMutedStudents(new Set());
      setStatus("disconnected");
      socketRef.current.emit("end-lecture", lectureId);
    } catch (error) {
      console.error("Error stopping broadcast:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCamera = () => {
    if (localStreamRef.current?.videoTrack) {
      const newState = !cameraEnabled;
      localStreamRef.current.videoTrack.setEnabled(newState);
      setCameraEnabled(newState);
    }
  };

  const toggleMic = () => {
    if (localStreamRef.current?.audioTrack) {
      const newState = !micEnabled;
      localStreamRef.current.audioTrack.setEnabled(newState);
      setMicEnabled(newState);
    }
  };

  const handleGoLive = () => {
    socketRef.current.emit("go-live", { lectureId, isResume: false });
  };

  const handleRemoveParticipant = (userId) => {
    if (!userId) return;
    socketRef.current.emit("remove-participant", { lectureId, userId });
  };

  const getParticipantStatus = (userId) =>
    Array.from(activeUsers.values()).some((u) => u.uid === userId?.toString());

  useEffect(() => {
    muteSoundRef.current = new Audio("/sounds/mute-sound.mp3");
    unmuteSoundRef.current = new Audio("/sounds/unmute-sound.mp3");

    const newSocket = io("https://lmsapp-plvj.onrender.com", {
      auth: { token, userType: "admin" },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 3000,
    });

    socketRef.current = newSocket;

    const handleConnect = () => {
      if (lectureId) newSocket.emit("request-participants", lectureId);
    };

    const handleParticipantsUpdate = (data) => {
      setParticipants(data.participants);
      setParticipantCount(data.count);
    };

    const handleGoLiveSuccess = (data) => {
      setAgoraToken(data.token);
      setChannelName(data.channelName);
      setStatus("ready");
      setMessage("Lecture is live! Start your broadcast");
      setSnackbarOpen(true);
    };

    const handleLectureUpdate = (data) => {
      if (data.status === "connected") setStatus("connected");
      setMessage(data.message);
    };

    const handleLectureEnded = (data) => {
      setStatus("ended");
      stopBroadcast();
      setMessage("Lecture has ended");
    };

    const handleErrors = (error) => {
      setMessage(error);
      setSnackbarOpen(true);
      setLoading(false);
    };

    const handleNewMessage = (message) => {
      setMessages((prev) => [...prev, message]);
    };

    const handleMessageDeleted = (messageId) => {
      setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
    };

    const handleMessageHistory = (msgs) => {
      setMessages(msgs);
    };

    const handleSocketError = (error) => {
      setMessage(error.message);
      setSnackbarOpen(true);
    };

    const handleChatUpdate = (data) => {
      setIsPrivateChat(data.privateChat);
    };

    newSocket.on("connect", handleConnect);
    newSocket.on("participants-update", handleParticipantsUpdate);
    newSocket.on("go-live-success", handleGoLiveSuccess);
    newSocket.on("lecture-update", handleLectureUpdate);
    newSocket.on("lecture-ended", handleLectureEnded);
    newSocket.on("go-live-error", handleErrors);
    newSocket.on("end-lecture-error", handleErrors);
    newSocket.on("lecture-error", handleErrors);
    newSocket.on("new-message", handleNewMessage);
    newSocket.on("message-deleted", handleMessageDeleted);
    newSocket.on("message-history", handleMessageHistory);
    newSocket.on("socket-error", handleSocketError);
    newSocket.on("private-chat-updated", handleChatUpdate);

    return () => {
      newSocket.disconnect();
      newSocket.off("connect", handleConnect);
      newSocket.off("participants-update", handleParticipantsUpdate);
      newSocket.off("go-live-success", handleGoLiveSuccess);
      newSocket.off("lecture-update", handleLectureUpdate);
      newSocket.off("lecture-ended", handleLectureEnded);
      newSocket.off("go-live-error", handleErrors);
      newSocket.off("end-lecture-error", handleErrors);
      newSocket.off("lecture-error", handleErrors);
      newSocket.off("new-message", handleNewMessage);
      newSocket.off("message-deleted", handleMessageDeleted);
      newSocket.off("message-history", handleMessageHistory);
      newSocket.off("socket-error", handleSocketError);
      newSocket.off("private-chat-updated", handleChatUpdate);
      stopBroadcast();
    };
  }, [lectureId, token]);

  return (
    <Box
      sx={{
        height: "100vh",
        overflow: "hidden",
        position: "relative",
        background:
          "radial-gradient(circle at 10% 20%, #1a1a2e 0%, #16213e 100%)",
      }}
    >
      <Fade in={true} timeout={800}>
        <Box
          sx={{
            height: "100%",
            display: "flex",
            transition: "margin 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            marginLeft: showChat ? "380px" : 0,
            marginRight: showParticipants ? "380px" : 0,
          }}
        >
          {/* Chat Panel */}
          <Box
            sx={{
              position: "fixed",
              left: 0,
              top: 0,
              bottom: 0,
              width: isMobile ? "100%" : "380px",
              maxWidth: "95vw",
              transform: showChat ? "translateX(0)" : "translateX(-100%)",
              transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              zIndex: 1200,
              background: "rgba(25, 25, 40, 0.95)",
              backdropFilter: "blur(12px)",
              borderRight: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "16px 0 32px rgba(0,0,0,0.3)",
            }}
          >
            <Box sx={{ p: 1, height: "100%", color: "#fff" }}>
              <ChatSection
                messages={messages}
                onSendMessage={handleSendMessage}
                onDeleteMessage={handleDeleteMessage}
                status={status}
                isPrivateChat={isPrivateChat}
                isAdmin={true}
                setShowChat={setShowChat}
                sx={{ height: "calc(100% - 64px)" }}
              />
            </Box>
          </Box>

          {/* Participants Panel */}
          <Box
            sx={{
              position: "fixed",
              right: 0,
              top: 0,
              bottom: 0,
              width: isMobile ? "100%" : "380px",
              maxWidth: "95vw",
              transform: showParticipants
                ? "translateX(0)"
                : "translateX(100%)",
              transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              zIndex: 1200,
              background: "rgba(25, 25, 40, 0.95)",
              backdropFilter: "blur(12px)",
              borderLeft: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "-16px 0 32px rgba(0,0,0,0.3)",
            }}
          >
            <Box sx={{ p: 1, height: "100%", color: "#fff" }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Participants ({participantCount})
                </Typography>
                <IconButton
                  onClick={() => setShowParticipants(false)}
                  sx={{
                    color: "#fff",
                    background: "rgba(255,255,255,0.1)",
                    "&:hover": { background: "rgba(255,255,255,0.2)" },
                  }}
                >
                  <Close />
                </IconButton>
              </Box>
              <ParticipantsList
                participants={participants}
                activeUsers={activeUsers}
                mutedStudents={mutedStudents}
                handleRemoveParticipant={handleRemoveParticipant}
                getParticipantStatus={getParticipantStatus}
                handleUnblockStudent={handleUnblockStudent}
                handleBlockStudent={handleBlockStudent}
                handleUnblockAll={handleUnblockAll}
                handleBlockAll={handleBlockAll}
                sx={{ height: "calc(100% - 64px)" }}
              />
            </Box>
          </Box>

          {/* Main Content Area */}
          <Box
            sx={{
              flex: 1,
              position: "relative",
              transition: "all 0.3s ease",
              overflow: "hidden",
            }}
          >
            {/* Status Bar */}
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                display: "flex",
                alignItems: "center",
                p: 2,
                zIndex: 1000,
                background: "transparent",
              }}
            >
              <FiberManualRecord
                sx={{
                  color: status === "connected" ? "#00ff88" : "#ff3860",
                  fontSize: 14,
                  mr: 1.5,
                  filter: "drop-shadow(0 0 8px rgba(0,255,136,0.5))",
                }}
              />
              <StatusChip status={status} />
              <Box sx={{ flexGrow: 1 }} />
              <IconButton
                onClick={handleToggleParticipants}
                sx={{
                  color: "#fff",
                  mr: 2,
                  "&:hover": { background: "rgba(255,255,255,0.1)" },
                }}
              >
                <PeopleOutline />
              </IconButton>
              <IconButton
                onClick={handleToggleChat}
                sx={{
                  color: "#fff",
                  "&:hover": { background: "rgba(255,255,255,0.1)" },
                }}
              >
                <ChatBubbleOutline />
              </IconButton>
              <LectureInfo
                lectureId={lectureId}
                channelName={channelName}
                status={status}
                participantCount={participantCount}
                sx={{ ml: 3, color: "#fff" }}
              />
            </Box>

            {/* Video Container */}
            <Box
              ref={videoContainerRef}
              sx={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                alignItems: "center",
                gap: 2,
                background:
                  "radial-gradient(circle at center, #1a1a2e 0%, #16213e 100%)",
              }}
            />

            {/* Connection Status Overlay */}
            {status !== "connected" && (
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  background: "rgba(0, 0, 0, 0.8)",
                  zIndex: 999,
                }}
              >
                <Slide in={true} direction="up">
                  <Box sx={{ textAlign: "center" }}>
                    <LiveTv
                      sx={{
                        fontSize: 80,
                        mb: 3,
                        color: "#00ff88",
                        filter: "drop-shadow(0 0 16px rgba(0,255,136,0.5))",
                      }}
                    />
                    <Typography
                      variant="h3"
                      gutterBottom
                      sx={{
                        color: "#fff",
                        fontWeight: 700,
                        letterSpacing: "1.5px",
                        mb: 4,
                      }}
                    >
                      {status === "ready" && "BROADCAST READY"}
                      {status === "ended" && "SESSION ENDED"}
                      {status === "disconnected" && "AWAITING CONNECTION"}
                    </Typography>
                    {status === "ready" && (
                      <CircularProgress
                        size={64}
                        thickness={4}
                        sx={{ color: "#00ff88" }}
                      />
                    )}
                  </Box>
                </Slide>
              </Box>
            )}

            {/* Controls Bar */}
            <Box
              sx={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                display: "flex",
                alignItems: "center",
                padding: 1.5,
                background: "transparent",
                zIndex: 1000,
                justifyContent: "center",
              }}
            >
              <Controls
                status={status}
                loading={loading}
                cameraEnabled={cameraEnabled}
                micEnabled={micEnabled}
                enableSound={enableSound}
                startBroadcast={startBroadcast}
                stopBroadcast={stopBroadcast}
                handleGoLive={handleGoLive}
                toggleCamera={toggleCamera}
                toggleMic={toggleMic}
                setEnableSound={setEnableSound}
              />
            </Box>
          </Box>

          <Snackbar
            open={snackbarOpen}
            autoHideDuration={6000}
            onClose={() => setSnackbarOpen(false)}
            message={message}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            TransitionComponent={Slide}
            sx={{
              "& .MuiSnackbarContent-root": {
                background: "rgba(0, 0, 0, 0.9)",
                color: "#fff",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
              },
            }}
          />
        </Box>
      </Fade>
    </Box>
  );
};

export default TeacherLiveLecture;
