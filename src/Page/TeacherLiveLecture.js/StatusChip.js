// components/StatusChip.jsx
import { Chip, CircularProgress } from "@mui/material";
import { CheckCircle, ErrorOutline } from "@mui/icons-material";

export const StatusChip = ({ status }) => {
  const getStatusIcon = () => {
    switch (status) {
      case "connected": return <CheckCircle fontSize="small" />;
      case "ready": return <CircularProgress size={20} />;
      case "ended": return <ErrorOutline fontSize="small" />;
      default: return <ErrorOutline fontSize="small" />;
    }
  };

  return (
    <Chip
      label={status.toUpperCase()}
      color={status === "connected" ? "success" : status === "ready" ? "warning" : "error"}
      icon={getStatusIcon()}
      sx={{ ml: 2 }}
    />
  );
};