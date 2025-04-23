import React, { useState, useRef, useEffect } from "react";
import {
  Card,
  Typography,
  List,
  ListItem,
  ListItemText,
  TextField,
  Button,
  IconButton,
  Avatar,
  Divider,
  Slide,
  Grow,
  Fade,
} from "@mui/material";
import { Send, Delete, Close } from "@mui/icons-material";
import styles from "./ChatSection.module.css";
import happypop3 from "../../components/Audio/happy-pop-3-185288.mp3" 

const ChatSection = ({
  messages,
  onSendMessage,
  onDeleteMessage,
  status,
  isPrivateChat,
  isAdmin,
  setShowChat,
}) => {
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);
  const [animateMessage, setAnimateMessage] = useState(false);
  const prevMessagesLength = useRef(messages.length);
  const receiveAudioRef = useRef(null);

  // Initialize audio elements
  useEffect(() => {
    receiveAudioRef.current = new Audio(happypop3);
    receiveAudioRef.current.volume = 0.2;
  }, []);

  useEffect(() => {
    // Play receive sound when new message arrives (excluding initial load)
    if (messages.length > prevMessagesLength.current) {
      if (prevMessagesLength.current > 0) {
        receiveAudioRef.current.play();
      }
      prevMessagesLength.current = messages.length;
    } else {
      prevMessagesLength.current = messages.length;
    }

    // Scroll to bottom and trigger animation
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setAnimateMessage(true);
    const timer = setTimeout(() => setAnimateMessage(false), 500);
    return () => clearTimeout(timer);
  }, [messages]);

  const handleSend = () => {
    if (!newMessage.trim()) return;
    onSendMessage(newMessage.trim());
    setNewMessage("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getSenderName = (sender) => {
    return sender.email?.split("@")[0] || "Anonymous";
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <Card className={styles.glassCard} elevation={0}>
      <div className={styles.header}>
        <Typography variant="h6" className={styles.sectionTitle}>
          {`Live Chat · ${isPrivateChat ? "Private" : "Public"}`}
          <span className={styles.messageCount}>
            <span
              className={styles.statusIndicator}
              data-status={status.toLowerCase()}
            />
            {messages.length} messages
          </span>
        </Typography>
        <IconButton
          onClick={() => setShowChat(false)}
          className={styles.closeButton}
        >
          <Close />
        </IconButton>
      </div>

      <List className={styles.messageList}>
        {messages.map((msg, index) => (
          <Slide
            key={msg._id}
            in={true}
            direction="up"
            timeout={Math.min(index * 50, 500)}
          >
            <div>
              <ListItem
                alignItems="flex-start"
                className={`${styles.messageItem} ${
                  animateMessage ? styles.messageEnter : ""
                }`}
              >
                <Avatar
                  className={styles.avatar}
                  sx={{
                    bgcolor:
                      msg.sender.role === "admin" ? "#6200ee" : "#2196f3",
                  }}
                >
                  {getSenderName(msg.sender)[0]?.toUpperCase()}
                </Avatar>
                <div className={styles.messageContent}>
                  <div className={styles.messageHeader}>
                    <div className={styles.senderInfo}>
                      <span className={styles.senderName}>
                        {getSenderName(msg.sender)}
                        <span
                          className={`${styles.roleBadge} ${
                            msg.sender.role === "admin"
                              ? styles.adminBadge
                              : styles.userBadge
                          }`}
                        >
                          {msg.sender.role === "admin" ? "TEACHER" : "STUDENT"}
                        </span>
                      </span>
                      <span className={styles.messageTime}>
                        {formatTime(msg.createdAt)}
                      </span>
                    </div>
                    {isAdmin && (
                      <IconButton
                        size="small"
                        onClick={() => onDeleteMessage(msg._id)}
                        className={styles.deleteButton}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    )}
                  </div>
                  <Typography variant="body2" className={styles.messageText}>
                    {msg.message}
                  </Typography>
                </div>
              </ListItem>
              <Divider className={styles.messageDivider} />
            </div>
          </Slide>
        ))}
        <div ref={messagesEndRef} />
      </List>

      <div className={styles.inputContainer}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={status !== "connected"}
          multiline
          maxRows={3}
          InputProps={{
            className: styles.messageInput,
            style: {
              color: "white",
            },
            sx: {
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "white",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "white",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "white",
              },
              "&::placeholder": {
                color: "white",
                opacity: 1,
              },
            },
          }}
          InputLabelProps={{
            style: {
              color: "white",
            },
          }}
        />
        <Fade in={newMessage.trim().length > 0}>
          <Button
            variant="contained"
            onClick={handleSend}
            disabled={!newMessage.trim() || status !== "connected"}
            className={styles.sendButton}
          >
            <Send />
          </Button>
        </Fade>
      </div>
    </Card>
  );
};

export default ChatSection;