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
  DeleteOutline,
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

  const localStreamRef = useRef(null);
  const clientRef = useRef(null);
  const socketRef = useRef(null);
  const videoContainerRef = useRef(null);

  const profile = JSON.parse(localStorage.getItem("profile"));
  const token = Cookies.get("token");

  // Filter participants who haven't left (online participants)
  const filteredParticipants = participants.filter(
    (participant) => !participant.leftAt
  );

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
      if (lectureId) {
        newSocket.emit("request-participants", lectureId);
      }
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
      if (data.status === "connected") {
        setStatus("connected");
      }
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

  // Rest of the code remains the same until the return statement...

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        {/* Header remains same */}

        <Grid container spacing={3}>
          {/* Video column remains same */}

          <Grid item xs={12} md={4}>
            {/* Lecture info card remains same */}

            {/* Controls remain same */}

            <Card sx={{ mt: 2, height: 400 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Participants ({filteredParticipants.length})
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
                  {filteredParticipants.length === 0 ? (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ p: 2 }}
                    >
                      No active participants
                    </Typography>
                  ) : (
                    filteredParticipants.map((participant) => {
                      const isOnline = getParticipantStatus(participant.user?._id);
                      return (
                        <ListItem key={participant._id} sx={{ py: 1 }}>
                          <ListItemAvatar>
                            <Avatar
                              src={participant.user?.avatar}
                              sx={{
                                bgcolor: isOnline ? "success.main" : "grey.500",
                              }}
                            >
                              {participant.user?.name?.charAt(0) || "U"}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={participant.user?.name || "Anonymous User"}
                            secondary={
                              <>
                                {participant.user?.email && (
                                  <Typography
                                    variant="body2"
                                    component="span"
                                    display="block"
                                  >
                                    {participant.user.email}
                                  </Typography>
                                )}
                                <Typography
                                  variant="caption"
                                  component="span"
                                  display="block"
                                >
                                  Joined: {new Date(participant.joinedAt).toLocaleTimeString()}
                                </Typography>
                              </>
                            }
                          />
                          <Box display="flex" alignItems="center" gap={1}>
                            <Chip
                              label={isOnline ? "Online" : "Offline"}
                              color={isOnline ? "success" : "default"}
                              size="small"
                            />
                            <IconButton
                              onClick={() =>
                                handleRemoveParticipant(participant.user?._id)
                              }
                              size="small"
                              color="error"
                            >
                              <DeleteOutline fontSize="small" />
                            </IconButton>
                          </Box>
                        </ListItem>
                      );
                    })
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