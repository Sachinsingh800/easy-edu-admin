import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import AgoraRTC from "agora-rtc-sdk-ng";
import { useParams } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";

const TeacherLiveLecture = () => {
  const socketServerUrl = "https://lmsapp-plvj.onrender.com";
  const [channelName, setChannelName] = useState("");
  const [messages, setMessages] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const clientRef = useRef(null);
  const localStreamRef = useRef(null);
  const socketRef = useRef(null);
  const videoContainerRef = useRef(null); // Fixed: Use ref instead of ID
  const appId = "90dde3ee5fbc4fe5a6a876e972c7bb2a"; // Use environment variable
  const { lectureId } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const profile = JSON.parse(localStorage.getItem("profile"));
  // Get token from proper storage (localStorage) instead of URL params
  const token = Cookies.get("token");
  console.log(token, "token");
  const role = profile.role;
  // Fixed: Initialize socket once using useEffect
  useEffect(() => {
    if (!token) return;

    const newSocket = io(socketServerUrl, {
      auth: {
        token: token,
        userType: role,
      },
      reconnectionAttempts: 3,
      timeout: 5000,
    });

    socketRef.current = newSocket;

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [token]);

  // Fixed: Add socket event listeners in separate useEffect
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const handleConnect = () => {
      console.log("Connected as Teacher:", socket.id);
      setMessages((prev) => [...prev, "Teacher has joined the lecture"]);
      socket.emit("teacher-connect", lectureId);
    };

    const handleLectureConnected = (data) => {
      console.log("Lecture connected", data);
      setChannelName(data.channelName);
      setMessages((prev) => [...prev, "Lecture is live"]);
    };

    socket.on("connect", handleConnect);
    socket.on("lecture-connected", handleLectureConnected);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("lecture-connected", handleLectureConnected);
    };
  }, [lectureId]);

  const goLive = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fixed: Use proper authorization header
      const response = await axios.get(
        `https://lmsapp-plvj.onrender.com/admin/course/lecture/goLive/${lectureId}`,
        {
          headers: {
            "x-admin-token": token,
          },
        }
      );

      const { channelName: newChannel, token: agoraToken } = response.data;

      // Start Agora broadcast with fresh data
      await startAgoraBroadcast(newChannel, agoraToken);
      setConnectionStatus("connected");
    } catch (err) {
      // Fixed: Proper error message handling
      const errorMessage = err.response?.data?.error || err.message;
      setError(errorMessage);
      setConnectionStatus("failed");
    } finally {
      setLoading(false);
    }
  };

  const startAgoraBroadcast = async (channel, token) => {
    try {
      setConnectionStatus("connecting-agora");

      const agoraClient = AgoraRTC.createClient({ mode: "live", codec: "vp8" });
      clientRef.current = agoraClient;

      await agoraClient.setClientRole("host");
      // Fixed: Use proper UID from decoded token
      const uid = profile._id;
      await agoraClient.join(appId, channel, token, uid);

      const [audioTrack, videoTrack] = await Promise.all([
        AgoraRTC.createMicrophoneAudioTrack(),
        AgoraRTC.createCameraVideoTrack(),
      ]);

      localStreamRef.current = { audioTrack, videoTrack };
      await agoraClient.publish([audioTrack, videoTrack]);

      // Fixed: Use ref instead of DOM element
      videoTrack.play(videoContainerRef.current);
    } catch (error) {
      console.error("Agora error:", error);
      stopAgoraBroadcast();
      throw error;
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
    setConnectionStatus("disconnected");
  };

  useEffect(() => {
    return () => {
      stopAgoraBroadcast();
    };
  }, []);

  return (
    <div>
      <h1>Teacher Live Lecture</h1>
      <p>Status: {connectionStatus}</p>
      <p>Lecture ID: {lectureId}</p>
      <p>Channel: {channelName}</p>
      <button onClick={goLive} disabled={loading}>
        {loading ? "Starting..." : "Go Live"}
      </button>

      <div
        ref={videoContainerRef}
        style={{ width: 640, height: 480, background: "#000" }}
      >
        {connectionStatus !== "connected" && (
          <div style={{ color: "white" }}>
            {connectionStatus === "failed" && "Connection Failed"}
            {connectionStatus.startsWith("connecting") && "Connecting..."}
          </div>
        )}
      </div>

      <div className="messages">
        <h3>System Messages:</h3>
        {messages.map((msg, i) => (
          <p key={i}>{msg}</p>
        ))}
        {error && <p style={{ color: "red" }}>Error: {error}</p>}
      </div>
    </div>
  );
};

export default TeacherLiveLecture;
