import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import AgoraRTC from "agora-rtc-sdk-ng";
import Cookies from "js-cookie";
import {
  Box,
  Button,
  Container,
  Paper,
  Typography,
  IconButton,
  Chip,
  Snackbar,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from "@mui/material";
import {
  Videocam,
  VideocamOff,
  Mic,
  MicOff,
  LiveTv,
  StopCircle,
  CheckCircle,
  ErrorOutline,
} from "@mui/icons-material";

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
console.log(participants,"participant")
  const localStreamRef = useRef(null);
  const clientRef = useRef(null);
  const socketRef = useRef(null);
  const videoContainerRef = useRef(null);

  const profile = JSON.parse(localStorage.getItem("profile"));
  const token = Cookies.get("token");

  useEffect(() => {
    const newSocket = io("https://lmsapp-plvj.onrender.com", {
      auth: {
        token: token,
        userType: "admin",
      },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 3000,
    });

    socketRef.current = newSocket;

    const handleConnect = () => {
      console.log("Connected to socket:", newSocket.id);
      if (lectureId) {
        newSocket.emit("request-participants", lectureId);
      }
    };

    const handleParticipantsUpdate = (data) => {
      console.log("Received participants:", data);
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
      setStatus(data.status);
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

    newSocket.on("connect", handleConnect);
    newSocket.on("participants-update", handleParticipantsUpdate);
    newSocket.on("go-live-success", handleGoLiveSuccess);
    newSocket.on("lecture-update", handleLectureUpdate);
    newSocket.on("lecture-ended", handleLectureEnded);
    newSocket.on("go-live-error", handleErrors);
    newSocket.on("end-lecture-error", handleErrors);
    newSocket.on("lecture-error", handleErrors);

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
      stopBroadcast();
    };
  }, [lectureId, token]);

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

    setActiveUsers((prev) => {
      const newMap = new Map(prev);
      newMap.set(user.uid, {
        uid: user.uid,
        hasAudio: user.hasAudio,
        hasVideo: user.hasVideo,
      });
      return newMap;
    });
  };

  const handleUserUnpublished = (user) => {
    setActiveUsers((prev) => {
      const newMap = new Map(prev);
      newMap.delete(user.uid);
      return newMap;
    });
    const element = document.getElementById(user.uid);
    if (element) element.remove();
  };

  const startBroadcast = async () => {
    setLoading(true);
    try {
      const client = await initializeAgora();
      const uid = profile._id;

      client.on("user-published", handleUserPublished);
      client.on("user-unpublished", handleUserUnpublished);

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
        await clientRef.current.leave();
        clientRef.current = null;
      }
      if (localStreamRef.current) {
        localStreamRef.current.audioTrack?.close();
        localStreamRef.current.videoTrack?.close();
        localStreamRef.current = null;
      }
      setActiveUsers(new Map());
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

  const getStatusIcon = () => {
    switch (status) {
      case "connected":
        return <CheckCircle fontSize="small" />;
      case "ready":
        return <CircularProgress size={20} />;
      case "ended":
        return <ErrorOutline fontSize="small" />;
      default:
        return <ErrorOutline fontSize="small" />;
    }
  };

  const getParticipantStatus = (userId) => {
    return Array.from(activeUsers.values()).some(
      (u) => u.uid === userId.toString()
    );
  };

  const mergedParticipants = participants.map((p) => ({
    ...p,
    isOnline: getParticipantStatus(p.userId),
  }));

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
            Live Lecture Controller
          </Typography>
          <Chip
            label={status.toUpperCase()}
            color={
              status === "connected"
                ? "success"
                : status === "ready"
                ? "warning"
                : "error"
            }
            icon={getStatusIcon()}
            sx={{ ml: 2 }}
          />
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card sx={{ height: 500, bgcolor: "background.default" }}>
              <div
                ref={videoContainerRef}
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  alignItems: "center",
                  padding: "10px",
                }}
              />
              {status !== "connected" && (
                <Box
                  position="absolute"
                  top="50%"
                  left="50%"
                  sx={{
                    transform: "translate(-50%, -50%)",
                    textAlign: "center",
                    color: "text.secondary",
                  }}
                >
                  <LiveTv sx={{ fontSize: 80, mb: 2 }} />
                  <Typography variant="h6">
                    {status === "ready" && "Ready to start broadcast"}
                    {status === "ended" && "Lecture session ended"}
                    {status === "disconnected" && "Not connected"}
                  </Typography>
                </Box>
              )}
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Lecture Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  Lecture ID: {lectureId}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Channel: {channelName || "N/A"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Status: {status}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Participants: {participantCount}
                </Typography>
              </CardContent>
            </Card>

            <Paper sx={{ p: 2, borderRadius: 2 }}>
              <Grid container spacing={2} justifyContent="center">
                <Grid item>
                  <IconButton
                    color={cameraEnabled ? "primary" : "default"}
                    onClick={toggleCamera}
                    disabled={status !== "connected"}
                  >
                    {cameraEnabled ? <Videocam /> : <VideocamOff />}
                  </IconButton>
                </Grid>
                <Grid item>
                  <IconButton
                    color={micEnabled ? "primary" : "default"}
                    onClick={toggleMic}
                    disabled={status !== "connected"}
                  >
                    {micEnabled ? <Mic /> : <MicOff />}
                  </IconButton>
                </Grid>

                {status === "ready" ? (
                  <Grid item xs={12}>
                    <Button
                      fullWidth
                      variant="contained"
                      color="secondary"
                      onClick={startBroadcast}
                      sx={{ height: 48 }}
                    >
                      Start Broadcast
                    </Button>
                  </Grid>
                ) : (
                  <Grid item xs={12}>
                    <Button
                      fullWidth
                      variant="contained"
                      color={status === "connected" ? "error" : "primary"}
                      startIcon={
                        status === "connected" ? <StopCircle /> : <LiveTv />
                      }
                      onClick={
                        status === "connected" ? stopBroadcast : handleGoLive
                      }
                      disabled={loading}
                      sx={{ height: 48 }}
                    >
                      {loading ? (
                        <CircularProgress size={24} />
                      ) : status === "connected" ? (
                        "End Lecture"
                      ) : (
                        "Go Live"
                      )}
                    </Button>
                  </Grid>
                )}
              </Grid>
            </Paper>

            <Card sx={{ mt: 2, height: 400 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Participants ({participantCount})
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <List
                  sx={{
                    height: 300,
                    overflow: "auto",
                    "&::-webkit-scrollbar": { width: "6px" },
                    "&::-webkit-scrollbar-thumb": { backgroundColor: "#888" },
                  }}
                >
                  {mergedParticipants.length === 0 ? (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ p: 2 }}
                    >
                      No participants yet
                    </Typography>
                  ) : (
                    mergedParticipants.map((participant) => (
                      <ListItem key={participant._id} sx={{ py: 1 }}>
                        <ListItemAvatar>
                          <Avatar
                            src={participant.user?.avatar}
                            sx={{
                              bgcolor: participant.isOnline
                                ? "success.main"
                                : "grey.500",
                            }}
                          >
                            {participant.user?.name?.charAt(0)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={participant.user?.name}
                          secondary={participant.user?.email}
                        />
                        <Chip
                          label={participant.isOnline ? "Online" : "Offline"}
                          color={participant.isOnline ? "success" : "default"}
                          size="small"
                        />
                      </ListItem>
                    ))
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={() => setSnackbarOpen(false)}
          message={message}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        />
      </Paper>
    </Container>
  );
};

export default TeacherLiveLecture;
