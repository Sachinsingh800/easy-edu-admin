// TeacherLiveLecture.jsx
import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import AgoraRTC from "agora-rtc-sdk-ng";
import Cookies from "js-cookie";
import {
  Box,
  Container,
  Paper,
  Typography,
  Snackbar,
  Grid,
  Card,
  CircularProgress,
} from "@mui/material";
import { LiveTv } from "@mui/icons-material";
import { StatusChip } from "./StatusChip";
import { LectureInfo } from "./LectureInfo";
import { Controls } from "./Controls";
import { ParticipantsList } from "./ParticipantsList";

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

  const localStreamRef = useRef(null);
  const clientRef = useRef(null);
  const socketRef = useRef(null);
  const videoContainerRef = useRef(null);
  const audioTracksRef = useRef(new Map());
  const muteSoundRef = useRef(null);
  const unmuteSoundRef = useRef(null);
  const profile = JSON.parse(localStorage.getItem("profile"));
  const token = Cookies.get("token");



  // Audio control handlers
  const handleBlockAll = () => {
    socketRef.current.emit("block-all", { lectureId });
    setMutedStudents(new Set([...mutedStudents, ...participants.map(p => p.user?._id)]));
  };

  const handleUnblockStudent = (userId) => {
    socketRef.current.emit("unblock-student", { lectureId, userId });
    setMutedStudents(prev => new Set([...prev].filter(id => id !== userId)));
  };

  const handleUnblockAll = () => {
    socketRef.current.emit("unblock-all", { lectureId });
    setMutedStudents(new Set());
  };


  // Handle sound control for all audio tracks
  useEffect(() => {
    
    const updateAllAudioTracks = () => {
      audioTracksRef.current.forEach(track => {
        try {
          track.setVolume(enableSound ? 100 : 0);
        } catch (error) {
          console.error("Error setting audio volume:", error);
        }
      });
    };
    updateAllAudioTracks();
  }, [enableSound]);

  const handleToggleMute = (userId) => {
    if (!userId) return;
    const isMuted = mutedStudents.has(userId);

    setMutedStudents((prev) => {
      const newSet = new Set(prev);
      isMuted ? newSet.delete(userId) : newSet.add(userId);
      return newSet;
    });

    socketRef.current.emit(isMuted ? "unmute-student" : "mute-student", {
      lectureId,
      userId,
    });
  };

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

    setActiveUsers((prev) =>
      new Map(prev.set(user.uid, {
        uid: user.uid,
        hasAudio: user.hasAudio,
        hasVideo: user.hasVideo,
      }))
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

  // Socket.io useEffect remains the same as original
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

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
            Live Lecture Controller
          </Typography>
          <StatusChip status={status} />
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
            <LectureInfo
              lectureId={lectureId}
              channelName={channelName}
              status={status}
              participantCount={participantCount}
            />

            <Paper sx={{ p: 2, borderRadius: 2 }}>
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
            </Paper>

            <ParticipantsList
              participants={participants}
              participantCount={participantCount}
              activeUsers={activeUsers}
              mutedStudents={mutedStudents}
              handleToggleMute={handleToggleMute}
              handleRemoveParticipant={handleRemoveParticipant}
              getParticipantStatus={getParticipantStatus}
              handleUnblockStudent={handleUnblockStudent}
              handleUnblockAll={handleUnblockAll}
              handleBlockAll={handleBlockAll}
            />
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
