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
  Fade,
  Grow,
  Slide,
} from "@mui/material";
import { LiveTv, FiberManualRecord } from "@mui/icons-material";
import { StatusChip } from "./StatusChip";
import { LectureInfo } from "./LectureInfo";
import { Controls } from "./Controls";
import { ParticipantsList } from "./ParticipantsList";
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
    <Container maxWidth="xl" className={styles.container}>
    <Fade in={true} timeout={800}>
      <Paper elevation={0} className={styles.glassMain}>
        <Box className={styles.header}>
          <Grow in={true}>
            <Typography variant="h3" className={styles.title}>
              Live Lecture Studio
              <FiberManualRecord className={styles.liveDot} />
            </Typography>
          </Grow>
          <StatusChip status={status} className={styles.statusChip} />
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card className={styles.videoGlassCard}>
              <LectureInfo
                lectureId={lectureId}
                channelName={channelName}
                status={status}
                participantCount={participantCount}
                className={styles.infoGlass}
              />
              <div
                ref={videoContainerRef}
                className={styles.videoContainer}
              />
              {status !== "connected" && (
                <Box className={styles.videoPlaceholder}>
                  <Slide in={true} direction="up">
                    <div>
                      <LiveTv className={styles.videoPlaceholderIcon} />
                      <Typography variant="h6" gutterBottom>
                        {status === "ready" && "Broadcast Studio Ready"}
                        {status === "ended" && "Lecture Concluded"}
                        {status === "disconnected" && "Awaiting Connection"}
                      </Typography>
                      {status === "ready" && (
                        <CircularProgress
                          size={48}
                          className={styles.loadingSpinner}
                        />
                      )}
                    </div>
                  </Slide>
                </Box>
              )}
              {/* Positioned Controls */}
              <div className={styles.controlsWrapper}>
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
              </div>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <ParticipantsList
              participants={participants}
              participantCount={participantCount}
              activeUsers={activeUsers}
              mutedStudents={mutedStudents}
              handleRemoveParticipant={handleRemoveParticipant}
              getParticipantStatus={getParticipantStatus}
              handleUnblockStudent={handleUnblockStudent}
              handleBlockStudent={handleBlockStudent}
              handleUnblockAll={handleUnblockAll}
              handleBlockAll={handleBlockAll}
              className={styles.participantsGlass}
            />
          </Grid>
        </Grid>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={() => setSnackbarOpen(false)}
          message={message}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          TransitionComponent={Slide}
          className={styles.snackbar}
        />
      </Paper>
    </Fade>
  </Container>
  );
};

export default TeacherLiveLecture;
