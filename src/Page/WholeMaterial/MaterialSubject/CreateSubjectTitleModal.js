import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Modal,
  MenuItem,
} from "@mui/material";
import axios from "axios";
import Cookies from "js-cookie";
import { useParams } from "react-router-dom";

const CreateSubjectTitleModal = ({ open, handleClose, setUpdate }) => {
  const [subject, setSubject] = useState("");
  const [medium, setMedium] = useState("English"); // Default to English
  const [loading, setLoading] = useState(false);
  const token = Cookies.get("token");
  const { id } = useParams();

  const handleCreateSubject = async () => {
    if (!subject.trim() || !medium.trim()) {
      alert("Both Subject and Medium fields are required!");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `https://lmsapp-plvj.onrender.com/admin/materials/title/subjects/content/createSub/${id}`,
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
      console.error("Error creating subject:", error);
      alert("An error occurred while creating the subject. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="create-subject-modal"
      aria-describedby="create-subject-modal-description"
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
        <Typography id="create-subject-modal" variant="h6" gutterBottom>
          Create New Subject
        </Typography>
        <TextField
          fullWidth
          label="Subject"
          variant="outlined"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          select
          label="Medium"
          variant="outlined"
          value={medium}
          onChange={(e) => setMedium(e.target.value)}
          sx={{ mb: 2 }}
        >
          <MenuItem value="English">English</MenuItem>
          <MenuItem value="Hindi">Hindi</MenuItem>
          {/* Add more mediums as required */}
        </TextField>
        <Box display="flex" justifyContent="flex-end" gap={2}>
          <Button onClick={handleClose} variant="outlined" color="secondary">
            Cancel
          </Button>
          <Button
            onClick={handleCreateSubject}
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create"}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default CreateSubjectTitleModal;
