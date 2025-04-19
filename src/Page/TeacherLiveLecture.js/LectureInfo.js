// components/LectureInfo.jsx
import { 
  useState, 
  useRef 
} from "react";
import { 
  IconButton, 
  Popover, 
  Typography, 
  Divider, 
  Box, 
  Fade,
  Grow,
  Paper,
  useTheme
} from "@mui/material";
import { InfoOutlined, LiveTv } from "@mui/icons-material";
import styles from './LectureInfo.module.css';

export const LectureInfo = ({ lectureId, channelName, status, participantCount }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const theme = useTheme();
  const buttonRef = useRef(null);

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <div className={styles.container}>
      <Grow in={true} timeout={800}>
        <IconButton
          ref={buttonRef}
          onClick={handleOpen}
          className={styles.infoButton}
          aria-label="lecture information"
        >
          <InfoOutlined className={styles.infoIcon} />
        </IconButton>
      </Grow>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        TransitionComponent={Fade}
        PaperProps={{ className: styles.glassPopover }}
      >
        <Paper elevation={0} className={styles.popoverContent}>
          <Box className={styles.header}>
            <LiveTv className={styles.liveIcon} />
            <Typography variant="h6" className={styles.title}>
              Lecture Details
            </Typography>
          </Box>

          <Divider className={styles.divider} />

          <Box className={styles.detailsContainer}>
            <DetailItem label="Lecture ID" value={lectureId} />
            <DetailItem label="Channel Name" value={channelName || "Not connected"} />
            <DetailItem label="Status" value={status} highlight={status === 'connected'} />
            <DetailItem label="Participants" value={participantCount} />
          </Box>
        </Paper>
      </Popover>
    </div>
  );
};

const DetailItem = ({ label, value, highlight = false }) => (
  <Box className={styles.detailItem}>
    <Typography variant="caption" className={styles.detailLabel}>
      {label}
    </Typography>
    <Typography 
      variant="body2" 
      className={`${styles.detailValue} ${highlight ? styles.highlight : ''}`}
    >
      {value}
    </Typography>
  </Box>
);