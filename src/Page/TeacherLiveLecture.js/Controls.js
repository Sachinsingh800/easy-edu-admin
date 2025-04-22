// Controls.jsx
import { 
  IconButton, 
  Button, 
  CircularProgress, 
  Grow,
  Fade,
  Zoom
} from "@mui/material";
import { 
  Videocam, 
  VideocamOff, 
  Mic, 
  MicOff, 
  LiveTv, 
  StopCircle,
  VolumeUp,
  VolumeOff
} from "@mui/icons-material";
import styles from './Controls.module.css';

export const Controls = ({
  status,
  loading,
  cameraEnabled,
  micEnabled,
  enableSound,
  startBroadcast,
  stopBroadcast,
  handleGoLive,
  toggleCamera,
  toggleMic,
  setEnableSound
}) => {
  const isConnected = status === "connected";

  return (
    <div className={styles.controlsContainer}>
      <div className={styles.controlsGroup}>
        <Grow in={true} timeout={300}>
          <IconButton
            className={`${styles.controlButton} ${cameraEnabled ? styles.active : ''}`}
            onClick={toggleCamera}
            disabled={!isConnected}
          >
            {cameraEnabled ? (
              <Videocam className={styles.icon} />
            ) : (
              <VideocamOff className={styles.icon} />
            )}
          </IconButton>
        </Grow>

        <Grow in={true} timeout={400}>
          <IconButton
            className={`${styles.controlButton} ${micEnabled ? styles.active : ''}`}
            onClick={toggleMic}
            disabled={!isConnected}
          >
            {micEnabled ? (
              <Mic className={styles.icon} />
            ) : (
              <MicOff className={styles.icon} />
            )}
          </IconButton>
        </Grow>

        <Fade in={true} timeout={600}>
          <Button
            className={`${styles.mainButton} ${
              isConnected ? styles.endButton : styles.startButton
            }`}
            onClick={isConnected ? stopBroadcast : status === "ready" ? startBroadcast : handleGoLive}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress className={styles.loader} />
            ) : (
              <>
                {isConnected ? (
                  <StopCircle className={styles.mainIcon} />
                ) : (
                  <LiveTv className={styles.mainIcon} />
                )}
              </>
            )}
          </Button>
        </Fade>

        <Grow in={true} timeout={500}>
          <IconButton
            className={`${styles.controlButton} ${enableSound ? styles.active : ''}`}
            onClick={() => setEnableSound(!enableSound)}
            disabled={!isConnected}
          >
            {enableSound ? (
              <VolumeUp className={styles.icon} />
            ) : (
              <VolumeOff className={styles.icon} />
            )}
          </IconButton>
        </Grow>
      </div>
    </div>
  );
};