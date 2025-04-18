// components/LectureInfo.jsx
import { Typography, Divider, Card, CardContent } from "@mui/material";

export const LectureInfo = ({ lectureId, channelName, status, participantCount }) => (
  <Card sx={{ mb: 2 }}>
    <CardContent>
      <Typography variant="h6" gutterBottom>Lecture Information</Typography>
      <Divider sx={{ mb: 2 }} />
      <Typography variant="body2" color="text.secondary">
        Lecture ID: {lectureId}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Channel: {channelName || "N/A"}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Status: {status}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Participants: {participantCount}
      </Typography>
    </CardContent>
  </Card>
);