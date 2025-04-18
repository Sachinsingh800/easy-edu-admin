// Controls.jsx
import { 
    IconButton, 
    Button, 
    CircularProgress, 
    Grid 
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
  }) => (
    <Grid container spacing={2} justifyContent="center">
      <Grid item>
        <IconButton
          color={cameraEnabled ? "primary" : "default"}
          onClick={toggleCamera}
          disabled={status !== "connected"}
        >
          {cameraEnabled ? <Videocam /> : <VideocamOff />}
        </IconButton>
      </Grid>
      <Grid item>
        <IconButton
          color={micEnabled ? "primary" : "default"}
          onClick={toggleMic}
          disabled={status !== "connected"}
        >
          {micEnabled ? <Mic /> : <MicOff />}
        </IconButton>
      </Grid>
      <Grid item>
        <IconButton
          color={enableSound ? "primary" : "default"}
          onClick={() => setEnableSound(!enableSound)}
          disabled={status !== "connected"}
        >
          {enableSound ? <VolumeUp /> : <VolumeOff />}
        </IconButton>
      </Grid>
  
      {status === "ready" ? (
        <Grid item xs={12}>
          <Button
            fullWidth
            variant="contained"
            color="secondary"
            onClick={startBroadcast}
            sx={{ height: 48 }}
          >
            Start Broadcast
          </Button>
        </Grid>
      ) : (
        <Grid item xs={12}>
          <Button
            fullWidth
            variant="contained"
            color={status === "connected" ? "error" : "primary"}
            startIcon={status === "connected" ? <StopCircle /> : <LiveTv />}
            onClick={status === "connected" ? stopBroadcast : handleGoLive}
            disabled={loading}
            sx={{ height: 48 }}
          >
            {loading ? <CircularProgress size={24} /> : status === "connected" ? "End Lecture" : "Go Live"}
          </Button>
        </Grid>
      )}
    </Grid>
  );