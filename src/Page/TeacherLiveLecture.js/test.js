import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import AgoraRTC from "agora-rtc-sdk-ng";
import axios from "axios";
import Cookies from "js-cookie";
import {
  Box,
  Button,
  Grid,
  Paper,
  Typography,
  IconButton,
  CircularProgress,
  Chip,
  Snackbar,
  Tooltip,
  Card,
  CardContent,
  Divider,
  TextField,
} from "@mui/material";
import {
  Videocam,
  VideocamOff,
  Mic,
  MicOff,
  StopCircle,
  ErrorOutline,
  CheckCircle,
  WarningAmber,
  LiveTv,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";

const StyledVideoContainer = styled(Card)(({ theme }) => ({
  width: "100%",
  height: 480,
  backgroundColor: theme.palette.grey[900],
  position: "relative",
  overflow: "hidden",
  borderRadius: theme.shape.borderRadius,
}));

const ControlBar = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginTop: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
}));

const StatusChip = styled(Chip)(({ theme, status }) => ({
  marginLeft: theme.spacing(2),
  backgroundColor: status === "connected" 
    ? theme.palette.success.light
    : status === "connecting" 
    ? theme.palette.warning.light
    : theme.palette.error.light,
  color: theme.palette.getContrastText(
    status === "connected" 
      ? theme.palette.success.light
      : status === "connecting" 
      ? theme.palette.warning.light
      : theme.palette.error.light
  ),
}));

const TeacherLiveLecture = () => {
  const { lectureId } = useParams();
  const socketServerUrl = "https://lmsapp-plvj.onrender.com";
  const appId = "90dde3ee5fbc4fe5a6a876e972c7bb2a";
  
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  const [channelName, setChannelName] = useState("");
  const [agoraToken, setAgoraToken] = useState("");
  const [message, setMessage] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const clientRef = useRef(null);
  const localStreamRef = useRef(null);
  const socketRef = useRef(null);
  const videoContainerRef = useRef(null);
  
  const profile = JSON.parse(localStorage.getItem("profile"));
  const token = Cookies.get("token");
  const role = profile?.role;

  useEffect(() => {
    if (!token) return;

    const newSocket = io(socketServerUrl, {
      auth: { token, userType: role },
      reconnectionAttempts: 3,
      timeout: 5000,
    });

    socketRef.current = newSocket;

    // Socket event listeners
    const handleSocketEvents = {
      'go-live-success': (data) => {
        setAgoraToken(data.token);
        setChannelName(data.channelName);
        setConnectionStatus(data.status);
        setMessage("Lecture is live!");
      },
      'go-live-error': (err) => setMessage(`Go Live Error: ${err}`),
      'lecture-update': (data) => {
        setConnectionStatus(data.status);
        setMessage(data.message);
      },
      'lecture-connected': (data) => {
        setChannelName(data.channelName);
        setMessage("Lecture connected successfully.");
      },
      'lecture-ended': (data) => {
        setConnectionStatus(data.status);
        setMessage("Lecture has ended.");
        stopAgoraBroadcast();
      },
      'end-lecture-success': () => setMessage("Lecture ended successfully"),
      'end-lecture-error': (err) => setMessage(`End Lecture Error: ${err}`),
    };

    Object.entries(handleSocketEvents).forEach(([event, handler]) => {
      newSocket.on(event, handler);
    });

    return () => {
      newSocket.disconnect();
      Object.entries(handleSocketEvents).forEach(([event, handler]) => {
        newSocket.off(event, handler);
      });
      stopAgoraBroadcast();
    };
  }, [token, role]);

  const handleGoLive = () => {
    socketRef.current.emit("go-live", { lectureId, isResume: false });
  };

  const handleEndLecture = () => {
    socketRef.current.emit("end-lecture", lectureId);
  };

  const toggleCamera = async () => {
    try {
      if (localStreamRef.current?.videoTrack) {
        await localStreamRef.current.videoTrack.setEnabled(!cameraEnabled);
        setCameraEnabled(!cameraEnabled);
      }
    } catch (error) {
      setMessage("Failed to toggle camera");
      console.error("Camera toggle error:", error);
    }
  };

  const toggleMic = async () => {
    try {
      if (localStreamRef.current?.audioTrack) {
        await localStreamRef.current.audioTrack.setEnabled(!micEnabled);
        setMicEnabled(!micEnabled);
      }
    } catch (error) {
      setMessage("Failed to toggle microphone");
      console.error("Mic toggle error:", error);
    }
  };

  const startAgoraBroadcast = async () => {
    try {
      setLoading(true);
      setConnectionStatus("connecting");
      
      const agoraClient = AgoraRTC.createClient({ mode: "live", codec: "vp8" });
      clientRef.current = agoraClient;

      await agoraClient.setClientRole("host");
      await agoraClient.join(appId, channelName, agoraToken, profile._id);

      const [audioTrack, videoTrack] = await Promise.all([
        AgoraRTC.createMicrophoneAudioTrack(),
        AgoraRTC.createCameraVideoTrack(),
      ]);

      localStreamRef.current = { audioTrack, videoTrack };
      await agoraClient.publish([audioTrack, videoTrack]);
      videoTrack.play(videoContainerRef.current);
      
      setConnectionStatus("connected");
    } catch (error) {
      console.error("Agora error:", error);
      setMessage("Failed to start broadcast");
      stopAgoraBroadcast();
    } finally {
      setLoading(false);
    }
  };

  const stopAgoraBroadcast = async () => {
    if (clientRef.current) {
      await clientRef.current.leave();
      clientRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.audioTrack?.close();
      localStreamRef.current.videoTrack?.close();
      localStreamRef.current = null;
    }
    setCameraEnabled(true);
    setMicEnabled(true);
    setConnectionStatus("disconnected");
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case "connected":
        return <CheckCircle fontSize="small" />;
      case "connecting":
        return <CircularProgress size={20} />;
      case "ended":
        return <WarningAmber fontSize="small" />;
      default:
        return <ErrorOutline fontSize="small" />;
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: "0 auto" }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }} elevation={3}>
            <Box display="flex" alignItems="center" mb={2}>
              <Typography variant="h4" component="h1">
                Live Lecture Control Panel
              </Typography>
              <StatusChip
                label={connectionStatus.toUpperCase()}
                status={connectionStatus}
                icon={getStatusIcon()}
              />
            </Box>
            
            <Divider sx={{ my: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={12} md={8}>
                <StyledVideoContainer ref={videoContainerRef}>
                  {connectionStatus !== "connected" && (
                    <Box
                      position="absolute"
                      top="50%"
                      left="50%"
                      sx={{ transform: "translate(-50%, -50%)" }}
                      color="common.white"
                      textAlign="center"
                    >
                      {connectionStatus === "failed" && (
                        <ErrorOutline fontSize="large" />
                      )}
                      <Typography variant="h6">
                        {connectionStatus === "failed" && "Connection Failed"}
                        {connectionStatus === "connecting" && "Initializing Broadcast..."}
                        {connectionStatus === "ended" && "Lecture Has Ended"}
                      </Typography>
                    </Box>
                  )}
                </StyledVideoContainer>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Lecture Information
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Lecture ID: {lectureId}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Channel: {channelName || "Not connected"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Agora Token: {agoraToken ? "Configured" : "Not available"}
                    </Typography>
                  </CardContent>
                </Card>

                <ControlBar elevation={1}>
                  <Grid container spacing={1} justifyContent="center">
                    <Grid item>
                      <Tooltip title={cameraEnabled ? "Disable Camera" : "Enable Camera"}>
                        <IconButton
                          color={cameraEnabled ? "primary" : "default"}
                          onClick={toggleCamera}
                          disabled={connectionStatus !== "connected"}
                        >
                          {cameraEnabled ? <Videocam /> : <VideocamOff />}
                        </IconButton>
                      </Tooltip>
                    </Grid>

                    <Grid item>
                      <Tooltip title={micEnabled ? "Mute Microphone" : "Unmute Microphone"}>
                        <IconButton
                          color={micEnabled ? "primary" : "default"}
                          onClick={toggleMic}
                          disabled={connectionStatus !== "connected"}
                        >
                          {micEnabled ? <Mic /> : <MicOff />}
                        </IconButton>
                      </Tooltip>
                    </Grid>

                    <Grid item>
                      <Button
                        variant="contained"
                        color={connectionStatus === "connected" ? "error" : "primary"}
                        startIcon={connectionStatus === "connected" ? <StopCircle /> : <LiveTv />}
                        onClick={connectionStatus === "connected" ? handleEndLecture : handleGoLive}
                        disabled={loading || !channelName}
                        sx={{ minWidth: 140 }}
                      >
                        {loading ? (
                          <CircularProgress size={24} />
                        ) : connectionStatus === "connected" ? (
                          "End Lecture"
                        ) : (
                          "Go Live"
                        )}
                      </Button>
                    </Grid>
                  </Grid>
                </ControlBar>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      <Snackbar
        open={!!message}
        autoHideDuration={6000}
        onClose={() => setMessage("")}
        message={message}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      />

      {agoraToken && connectionStatus === "connecting" && (
        <Button
          variant="contained"
          color="secondary"
          onClick={startAgoraBroadcast}
          sx={{ mt: 2, display: "block", mx: "auto" }}
        >
          Start Broadcast
        </Button>
      )}
    </Box>
  );
};

export default TeacherLiveLecture;