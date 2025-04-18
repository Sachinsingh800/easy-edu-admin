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
  } from "@mui/material";
  import {
    Mic,
    MicOff,
    DeleteOutline,
    LockOpen,
    Lock,
  } from "@mui/icons-material";
  
  const ParticipantListItem = ({
    participant,
    getParticipantStatus,
    mutedStudents,
    handleToggleMute,
    handleRemoveParticipant,
    handleUnblockStudent,
    isAllBlocked,
  }) => (
    <ListItem key={participant.user?._id} sx={{ py: 1 }}>
      <ListItemAvatar>
        <Avatar
          src={participant.user?.avatar}
          sx={{
            bgcolor: getParticipantStatus(participant.user?._id)
              ? "success.main"
              : "grey.500",
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
              <Typography variant="body2" component="span" display="block">
                {participant.user.email}
              </Typography>
            )}
            <Typography variant="caption" component="span" display="block">
              ID: {participant.user?._id}
            </Typography>
          </>
        }
      />
      <Box display="flex" alignItems="center" gap={1}>
        <Chip
          label={participant.user?._id ? "Online" : "Offline"}
          color={participant.user?._id ? "success" : "default"}
          size="small"
        />
  
        {isAllBlocked ? (
          <IconButton
            onClick={() => handleUnblockStudent(participant.user?._id)}
            size="small"
            color="primary"
          >
            <LockOpen fontSize="small" />
          </IconButton>
        ) : (
          <IconButton
            onClick={() => handleToggleMute(participant.user?._id)}
            size="small"
            color={mutedStudents.has(participant.user?._id) ? "error" : "default"}
          >
            {mutedStudents.has(participant.user?._id) ? (
              <MicOff fontSize="small" />
            ) : (
              <Mic fontSize="small" />
            )}
          </IconButton>
        )}
        <IconButton
          onClick={() => handleRemoveParticipant(participant.user?._id)}
          size="small"
          color="error"
        >
          <DeleteOutline fontSize="small" />
        </IconButton>
      </Box>
    </ListItem>
  );
  
  export const ParticipantsList = ({
    participants,
    participantCount,
    activeUsers,
    mutedStudents,
    handleToggleMute,
    handleRemoveParticipant,
    handleUnblockStudent,
    handleUnblockAll,
    handleBlockAll,
    isAllBlocked,
  }) => {
    const getParticipantStatus = (userId) =>
      Array.from(activeUsers.values()).some((u) => u.uid === userId?.toString());
  
    return (
      <Card sx={{ mt: 2, height: 400 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Participants ({participantCount})
          </Typography>
  
          <Divider sx={{ mb: 2 }} />
  
          <Box sx={{ mb: 2, display: "flex", justifyContent: "center" }}>
            <Button
              variant="contained"
              color={isAllBlocked ? "success" : "error"}
              onClick={isAllBlocked ? handleUnblockAll : handleBlockAll}
              startIcon={isAllBlocked ? <LockOpen /> : <Lock />}
              size="small"
            >
              {isAllBlocked ? "Unblock All Participants" : "Block All Participants"}
            </Button>
          </Box>
  
          <List sx={{ height: 300, overflow: "auto" }}>
            {participants.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                No participants yet
              </Typography>
            ) : (
              participants.map((participant) => (
                <ParticipantListItem
                  key={participant.user?._id}
                  participant={participant}
                  getParticipantStatus={getParticipantStatus}
                  mutedStudents={mutedStudents}
                  handleToggleMute={handleToggleMute}
                  handleRemoveParticipant={handleRemoveParticipant}
                  handleUnblockStudent={handleUnblockStudent}
                  isAllBlocked={isAllBlocked}
                />
              ))
            )}
          </List>
        </CardContent>
      </Card>
    );
  };