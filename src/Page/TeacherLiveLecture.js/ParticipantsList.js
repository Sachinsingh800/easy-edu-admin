// components/ParticipantsList.jsx
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
} from "@mui/material";
import {
  Mic,
  MicOff,
  DeleteOutline,
  LockOpen,
  Lock,
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
    <Grow in={true} timeout={500}>
      <ListItem className={styles.listItem} sx={{ py: 1 }}>
        <ListItemAvatar>
          <Avatar
            src={participant.user?.avatar}
            className={`${styles.avatar} ${isActive ? styles.activeAvatar : ''}`}
          >
            {participant.user?.name?.charAt(0) || "U"}
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={
            <Typography variant="subtitle1" className={styles.userName}>
              {participant.user?.name || "Anonymous User"}
            </Typography>
          }
          secondary={
            <Typography variant="caption" className={styles.userEmail}>
              {participant.user?.email || "Unknown email"}
            </Typography>
          }
        />
        <Box className={styles.actionsContainer}>
          <Chip
            label={isActive ? "Active" : "Offline"}
            className={`${styles.statusChip} ${isActive ? styles.activeChip : styles.inactiveChip}`}
          />
          <IconButton
            onClick={() =>
              isMuted
                ? handleUnblockStudent(participant.user?._id)
                : handleBlockStudent(participant.user?._id)
            }
            className={`${styles.iconButton} ${isMuted ? styles.blockedButton : ''}`}
          >
            {isMuted ? (
              <LockOpen className={styles.icon} />
            ) : (
              <Lock className={styles.icon} />
            )}
          </IconButton>
          <IconButton
            onClick={() => handleRemoveParticipant(participant.user?._id)}
            className={styles.iconButton}
          >
            <DeleteOutline className={styles.icon} />
          </IconButton>
        </Box>
      </ListItem>
    </Grow>
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
              Live Participants
              <span className={styles.countBadge}>{participantCount}</span>
            </Typography>
            <Button
              variant="contained"
              className={`${styles.blockAllButton} ${isAllBlocked ? styles.unblockAll : ''}`}
              onClick={isAllBlocked ? handleUnblockAll : handleBlockAll}
              startIcon={isAllBlocked ? <LockOpen /> : <Lock />}
              disabled={participants.length === 0}
            >
              {isAllBlocked ? "Unblock All" : "Block All"}
            </Button>
          </Box>

          <Divider className={styles.divider} />

          <List className={styles.participantsList}>
            {participants.length === 0 ? (
              <Slide in={true} direction="up">
                <Typography className={styles.emptyState}>
                  No active participants
                </Typography>
              </Slide>
            ) : (
              participants.map((participant) => (
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