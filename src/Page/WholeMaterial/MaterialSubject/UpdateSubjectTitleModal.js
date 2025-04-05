import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Modal,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import axios from "axios";
import Cookies from "js-cookie";

const UpdateSubjectModal = ({ open, handleClose, setUpdate, selectedSubject }) => {
  const [subject, setSubject] = useState("");
  const [medium, setMedium] = useState("");
  const [loading, setLoading] = useState(false);
  const token = Cookies.get("token");

  // Prefill the fields when selectedSubject changes
  useEffect(() => {
    if (selectedSubject) {
      setSubject(selectedSubject.subject || "");
      setMedium(selectedSubject.medium || "");
    }
  }, [selectedSubject]);

  const handleUpdateSubject = async () => {
    if (!subject.trim() || !medium.trim()) {
      alert("Both fields are required!");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.put(
        `https://lmsapp-plvj.onrender.com/admin/materials/title/subjects/content/updateSub/${selectedSubject._id}`,
        { subject, medium },
        {
          headers: { "x-admin-token": token },
        }
      );

      if (response.data.status) {
        setUpdate((prev) => !prev); // Trigger a refresh
        handleClose(); // Close the modal
      } else {
        alert(`Error: ${response.data.message}`);
      }
    } catch (error) {
      console.error("Error updating subject:", error);
      alert("An error occurred while updating the subject. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="update-subject-modal"
      aria-describedby="update-subject-modal-description"
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
        }}
      >
        <Typography id="update-subject-modal" variant="h6" gutterBottom>
          Update Subject
        </Typography>
        <TextField
          fullWidth
          label="Subject"
          variant="outlined"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          sx={{ mb: 2 }}
        />
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="medium-select-label">Medium</InputLabel>
          <Select
            labelId="medium-select-label"
            value={medium}
            onChange={(e) => setMedium(e.target.value)}
            label="Medium"
          >
            <MenuItem value="English">English</MenuItem>
            <MenuItem value="Hindi">Hindi</MenuItem>
          </Select>
        </FormControl>
        <Box display="flex" justifyContent="flex-end" gap={2}>
          <Button onClick={handleClose} variant="outlined" color="secondary" disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleUpdateSubject}
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Update"}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default UpdateSubjectModal;
