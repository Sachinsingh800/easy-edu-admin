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
} from "@mui/material";
import { Send, Delete } from "@mui/icons-material";
import styles from "./ChatSection.module.css";

const ChatSection = ({
  messages,
  onSendMessage,
  onDeleteMessage,
  status,
  isPrivateChat,
  isAdmin,
}) => {
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!newMessage.trim()) return;
    onSendMessage(newMessage.trim());
    setNewMessage("");
  };

  const getSenderName = (sender) => {
    return sender.name || sender.email.split('@')[0];
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card className={styles.glassCard} elevation={0}>
      <div className={styles.header}>
        <Typography variant="h6" className={styles.sectionTitle}>
          {`Live Chat · ${isPrivateChat ? "Private" : "Public"}`}
          <span className={styles.statusIndicator} data-status={status.toLowerCase()} />
        </Typography>
        <div className={styles.metaInfo}>
          <span className={styles.messageCount}>{messages.length} messages</span>
          <span className={styles.connectionStatus}>{status.toUpperCase()}</span>
        </div>
      </div>
      
      <List className={styles.messageList}>
        {messages.map((msg) => (
          <React.Fragment key={msg._id}>
            <ListItem alignItems="flex-start" className={styles.messageItem}>
              <Avatar 
                className={styles.avatar}
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: msg.isAdminMessage ? '#6200ee' : '#2196f3',
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                }}
              >
                {getSenderName(msg.sender)[0].toUpperCase()}
              </Avatar>
              <div className={styles.messageContent}>
                <div className={styles.messageHeader}>
                  <div className={styles.senderInfo}>
                    <span className={styles.senderName}>
                      {getSenderName(msg.sender)}
                      {msg.isAdminMessage && (
                        <span className={styles.adminBadge}>TEACHER</span>
                      )}
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
          </React.Fragment>
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
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          disabled={status !== "connected"}
          className={styles.messageInput}
          InputProps={{
            sx: {
              borderRadius: '28px',
              backgroundColor: 'rgba(255,255,255,0.08)',
              '& fieldset': { borderColor: 'rgba(255,255,255,0.12)' },
              '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2))' },
              '&.Mui-focused fieldset': { borderColor: 'rgba(255,255,255,0.3))' },
            }
          }}
        />
        <Button
          variant="contained"
          onClick={handleSend}
          disabled={!newMessage.trim() || status !== "connected"}
          className={styles.sendButton}
          sx={{
            minWidth: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: 'rgba(98, 0, 238, 0.9)',
            '&:hover': {
              backgroundColor: 'rgba(98, 0, 238, 1)',
              transform: 'translateY(-1px)'
            }
          }}
        >
          <Send sx={{ fontSize: '20px', color: '#ffffff' }} />
        </Button>
      </div>
    </Card>
  );
};

export default ChatSection;