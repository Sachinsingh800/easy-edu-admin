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
  useMediaQuery,
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
import styles from "./ParticipantsList.module.css";

const ParticipantListItem = ({
  participant,
  mutedStudents,
  handleRemoveParticipant,
  handleUnblockStudent,
  handleBlockStudent,
  isMobile,
}) => {
  const isMuted = mutedStudents.has(participant.user?._id);
  const isActive = participant.user?._id;

  return (
    <Slide in={true} direction="up" timeout={500}>
      <ListItem className={styles.listItem} sx={{ py: 1 }}>
        <ListItemAvatar sx={{ minWidth: isMobile ? "40px" : "56px" }}>
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            variant="dot"
            color={isActive ? "success" : "error"}
            invisible={!participant.user?._id}
          >
            <Avatar
              src={participant.user?.avatar}
              className={`${styles.avatar} ${
                isActive ? styles.activeAvatar : ""
              }`}
              sx={{
                width: isMobile ? 30 : 35,
                height: isMobile ?  30 : 35,
                filter: isActive ? "drop-shadow(0 0 4px #4CAF50)" : "none",
              }}
            >
              {participant.user?.name?.charAt(0) || "U"}
            </Avatar>
          </Badge>
        </ListItemAvatar>
        <ListItemText
          primary={
            <Typography variant="subtitle1" className={styles.userName}>
              <span className={styles.nameText}>
                {participant.user?.name || "Anonymous User"}
              </span>
            </Typography>
          }
          secondary={
            <Typography variant="caption" className={styles.userEmail}>
              {participant.user?.email || "Unknown email"}
            </Typography>
          }
          sx={{
            "& .MuiListItemText-secondary": {
              maxWidth: isMobile ? "120px" : "none",
            },
          }}
        />
        <Box className={styles.actionsContainer}>
          {!isMobile && (
            <Tooltip
              title={isActive ? "Active participant" : "Currently offline"}
              arrow
            >
              <Chip
                label={isActive ? "Active" : "Offline"}
                className={`${styles.statusChip} ${
                  isActive ? styles.activeChip : styles.inactiveChip
                }`}
                size="small"
              />
            </Tooltip>
          )}

          <Tooltip
            title={isMuted ? "Unblock microphone" : "Block microphone"}
            arrow
          >
            <IconButton
              onClick={() =>
                isMuted
                  ? handleUnblockStudent(participant.user?._id)
                  : handleBlockStudent(participant.user?._id)
              }
              className={`${styles.iconButton} ${
                isMuted ? styles.blockedButton : styles.micButton
              }`}
              size={isMobile ? "small" : "medium"}
            >
              {isMuted ? (
                <MicOff className={`${styles.icon} ${styles.neonRed}`} />
              ) : (
                <Mic className={`${styles.icon} ${styles.neonGreen}`} />
              )}
            </IconButton>
          </Tooltip>

          <Tooltip title="Remove participant" arrow>
            <IconButton
              onClick={() => handleRemoveParticipant(participant.user?._id)}
              className={`${styles.iconButton} ${styles.removeButton}`}
              size={isMobile ? "small" : "medium"}
            >
              <PersonOff className={`${styles.icon} ${styles.neonOrange}`} />
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
  const isMobile = useMediaQuery("(max-width:380px)");

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
              {!isMobile && (
                <span className={styles.countBadge}>
                  {participantCount}{" "}
                  {participantCount === 1 ? "Member" : "Members"}
                </span>
              )}
            </Typography>
            <Tooltip
              title={
                isAllBlocked
                  ? "Unblock all microphones"
                  : "Block all microphones"
              }
              arrow
            >
              <Button
                variant="contained"
                className={`${styles.blockAllButton} ${
                  isAllBlocked ? styles.unblockAll : ""
                }`}
                onClick={isAllBlocked ? handleUnblockAll : handleBlockAll}
                startIcon={isAllBlocked ? <LockOpen /> : <Lock />}
                disabled={participants.length === 0}
                size={isMobile ? "small" : "medium"}
              >
                {isMobile
                  ? isAllBlocked
                    ? "Unblock All"
                    : "Block All"
                  : isAllBlocked
                  ? "Unblock All"
                  : "Block All"}
              </Button>
            </Tooltip>
          </Box>

          {isMobile ? (
            <Typography variant="caption" className={styles.mobileCount}>
              {participantCount} {participantCount === 1 ? "member" : "members"}{" "}
              online
            </Typography>
          ) : (
            <Divider className={styles.divider} />
          )}

          <List className={styles.participantsList}>
            {participants.length === 0 ? (
              <Box className={styles.emptyStateContainer}>
                <Person className={styles.emptyStateIcon} />
                <Typography className={styles.emptyStateText}>
                  No active participants
                </Typography>
                {!isMobile && (
                  <Typography
                    variant="caption"
                    className={styles.emptyStateSubtext}
                  >
                    Participants will appear here when they join
                  </Typography>
                )}
              </Box>
            ) : (
              participants.map((participant, index) => (
                <ParticipantListItem
                  key={participant.user?._id}
                  participant={participant}
                  mutedStudents={mutedStudents}
                  handleRemoveParticipant={handleRemoveParticipant}
                  handleUnblockStudent={handleUnblockStudent}
                  handleBlockStudent={handleBlockStudent}
                  isMobile={isMobile}
                />
              ))
            )}
          </List>
        </CardContent>
      </Card>
    </Fade>
  );
};
