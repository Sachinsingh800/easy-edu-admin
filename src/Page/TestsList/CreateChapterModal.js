import React, { useState } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import axios from "axios";
import Cookies from "js-cookie";
import { useParams } from "react-router-dom";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

const CreateChapterModal = ({ open, onClose,  update }) => {
  const [chapterName, setChapterName] = useState("");
  const [chapterNo, setChapterNo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { clsId,id } = useParams(); // SubjectTest ID

  const handleSubmit = async () => {
    const token = Cookies.get("token");
    if (!token) {
      setError("Authentication token not found. Please log in.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `https://lmsapp-plvj.onrender.com/admin/directTest/subjects/chapter/create/${clsId}/${id}`,
        { chapterName, chapterNo },
        {
          headers: {
            "x-admin-token": token,
          },
        }
      );

      if (response.data.status) {
        setChapterName(""); // Clear chapterName
        setChapterNo(""); // Clear chapterNo
        onClose(); // Close modal
        update((prev) => !prev); // Trigger update
      } else {
        setError(response.data.message || "Failed to create chapter.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create chapter.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="create-chapter-modal-title"
      aria-describedby="create-chapter-modal-description"
    >
      <Box sx={modalStyle}>
        <Typography id="create-chapter-modal-title" variant="h6" gutterBottom>
          Create New Chapter
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <TextField
          label="Chapter Name"
          value={chapterName}
          onChange={(e) => setChapterName(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Chapter No"
          type="number"
          value={chapterNo}
          onChange={(e) => setChapterNo(e.target.value)}
          fullWidth
          margin="normal"
        />
        <Box display="flex" justifyContent="flex-end" mt={2}>
          <Button onClick={onClose} sx={{ mr: 2 }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Create"}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default CreateChapterModal;
