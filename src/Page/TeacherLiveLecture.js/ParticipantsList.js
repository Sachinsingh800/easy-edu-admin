import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Box,
  IconButton,
  Chip,
  Button,
  Fade,
  Grow,
  Slide,
  Tooltip,
  Badge,
} from "@mui/material";
import {
  Mic,
  MicOff,
  DeleteOutline,
  LockOpen,
  Lock,
  Person,
  PersonOff,
} from "@mui/icons-material";
import styles from './ParticipantsList.module.css';

const ParticipantListItem = ({
  participant,
  getParticipantStatus,
  mutedStudents,
  handleRemoveParticipant,
  handleUnblockStudent,
  handleBlockStudent,
}) => {
  const isMuted = mutedStudents.has(participant.user?._id);
  const isActive = getParticipantStatus(participant.user?._id);

  return (
    <Slide in={true} direction="up" timeout={500}>
      <ListItem className={styles.listItem} sx={{ py: 1 }}>
        <ListItemAvatar>
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            variant="dot"
            color={isActive ? "success" : "error"}
            invisible={!participant.user?._id}
          >
            <Avatar
              src={participant.user?.avatar}
              className={`${styles.avatar} ${isActive ? styles.activeAvatar : ''}`}
            >
              {participant.user?.name?.charAt(0) || "U"}
            </Avatar>
          </Badge>
        </ListItemAvatar>
        <ListItemText
          primary={
            <Typography variant="subtitle1" className={styles.userName}>
              {participant.user?.name || "Anonymous User"}
              {isMuted && (
                <MicOff className={styles.mutedIcon} />
              )}
            </Typography>
          }
          secondary={
            <Typography variant="caption" className={styles.userEmail}>
              {participant.user?.email || "Unknown email"}
            </Typography>
          }
        />
        <Box className={styles.actionsContainer}>
          <Tooltip title={isActive ? "Active participant" : "Currently offline"} arrow>
            <Chip
              label={isActive ? "Active" : "Offline"}
              className={`${styles.statusChip} ${isActive ? styles.activeChip : styles.inactiveChip}`}
              size="small"
            />
          </Tooltip>
          
          <Tooltip title={isMuted ? "Unblock microphone" : "Block microphone"} arrow>
            <IconButton
              onClick={() =>
                isMuted
                  ? handleUnblockStudent(participant.user?._id)
                  : handleBlockStudent(participant.user?._id)
              }
              className={`${styles.iconButton} ${isMuted ? styles.blockedButton : ''}`}
            >
              {isMuted ? (
                <MicOff className={styles.icon} />
              ) : (
                <Mic className={styles.icon} />
              )}
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Remove participant" arrow>
            <IconButton
              onClick={() => handleRemoveParticipant(participant.user?._id)}
              className={styles.iconButton}
            >
              <PersonOff className={styles.icon} />
            </IconButton>
          </Tooltip>
        </Box>
      </ListItem>
    </Slide>
  );
};

export const ParticipantsList = ({
  participants,
  participantCount,
  activeUsers,
  mutedStudents,
  handleRemoveParticipant,
  handleUnblockStudent,
  handleBlockStudent,
  handleUnblockAll,
  handleBlockAll,
}) => {
  const getParticipantStatus = (userId) =>
    Array.from(activeUsers.values()).some((u) => u.uid === userId?.toString());

  const isAllBlocked =
    participants.length > 0 &&
    participants.every((participant) =>
      mutedStudents.has(participant.user?._id)
    );

  return (
    <Fade in={true} timeout={800}>
      <Card className={styles.glassCard}>
        <CardContent className={styles.cardContent}>
          <Box className={styles.header}>
            <Typography variant="h6" className={styles.title}>
              <span className={styles.titleText}>Live Participants</span>
              <span className={styles.countBadge}>
                {participantCount} {participantCount === 1 ? 'Member' : 'Members'}
              </span>
            </Typography>
            <Tooltip 
              title={isAllBlocked ? "Unblock all microphones" : "Block all microphones"} 
              arrow
            >
              <Button
                variant="contained"
                className={`${styles.blockAllButton} ${isAllBlocked ? styles.unblockAll : ''}`}
                onClick={isAllBlocked ? handleUnblockAll : handleBlockAll}
                startIcon={isAllBlocked ? <LockOpen /> : <Lock />}
                disabled={participants.length === 0}
              >
                {isAllBlocked ? "Unblock All" : "Block All"}
              </Button>
            </Tooltip>
          </Box>

          <Divider className={styles.divider} />

          <List className={styles.participantsList}>
            {participants.length === 0 ? (
              <Box className={styles.emptyStateContainer}>
                <Person className={styles.emptyStateIcon} />
                <Typography className={styles.emptyStateText}>
                  No active participants
                </Typography>
                <Typography variant="caption" className={styles.emptyStateSubtext}>
                  Participants will appear here when they join
                </Typography>
              </Box>
            ) : (
              participants.map((participant, index) => (
                <ParticipantListItem
                  key={participant.user?._id}
                  participant={participant}
                  getParticipantStatus={getParticipantStatus}
                  mutedStudents={mutedStudents}
                  handleRemoveParticipant={handleRemoveParticipant}
                  handleUnblockStudent={handleUnblockStudent}
                  handleBlockStudent={handleBlockStudent}
                />
              ))
            )}
          </List>
        </CardContent>
      </Card>
    </Fade>
  );
};