import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import Cookies from "js-cookie";

// Change SERVER_URL to match your backend server URL
const SERVER_URL = "https://lmsapp-plvj.onrender.com";

const LiveParticipants = () => {
  const [participants, setParticipants] = useState([]);
  const [participantCount, setParticipantCount] = useState(0);
  const [message, setMessage] = useState("");
  const socketRef = useRef(null);

  // Initialize Socket.IO connection and listeners
  useEffect(() => {
    // Set token and userType from localStorage if available (adapt if necessary)
    const userType = "admin";
    const token = Cookies.get("token");

    // Create and connect socket
    socketRef.current = io(SERVER_URL, {
      autoConnect: false,
      auth: { token, userType },
    });

    // Connect the socket
    socketRef.current.connect();

    // Listen for connection event
    socketRef.current.on("connect", () => {
      console.log("Socket connected:", socketRef.current.id);
      setMessage("Socket connected.");
    });

    // Listen for participants-update events
    socketRef.current.on("participants-update", (data) => {
      console.log("Received participants update:", data);
      if (
        data &&
        typeof data.count !== "undefined" &&
        Array.isArray(data.participants)
      ) {
        setParticipantCount(data.count);
        setParticipants(data.participants);
      }
    });

    // Listen for any errors from the socket
    socketRef.current.on("socket-error", (error) => {
      console.error("Socket error:", error);
      setMessage(`Socket error: ${error.message}`);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Active Lecture Participants</h1>

      <p className="mb-2">
        Total Active Participants:{" "}
        <span className="font-semibold">{participantCount}</span>
      </p>

      {message && <p className="text-red-500 mb-4">{message}</p>}

      {participants.length > 0 ? (
        <ul className="list-disc ml-6">
          {participants.map((p) => (
            <li key={p.user._id}>{p.user.name ? p.user.name : p.user.email}</li>
          ))}
        </ul>
      ) : (
        <p>No active participants.</p>
      )}
    </div>
  );
};

export default LiveParticipants;
