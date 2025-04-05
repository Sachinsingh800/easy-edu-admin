import React, { useState, useEffect } from "react";
import {
  Modal,
  Backdrop,
  Fade,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  MenuItem,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import Cookies from "js-cookie";
import axios from "axios";
import styles from "./CreateTestSubjectModal.module.css";
import { useParams } from "react-router-dom";

const CreateTestSubjectModal = ({ open, onClose, setUpdate ,clsId}) => {
  const [subjects, setSubjects] = useState([]); // To store fetched subjects
  const [selectedSubjectId, setSelectedSubjectId] = useState(""); // For selected subject ID
  const [loading, setLoading] = useState(false); // For button loading state
  const [error, setError] = useState(null); // For displaying errors
  const { id } = useParams();

  // Fetch subjects on modal open
  useEffect(() => {
    if (open) {
      fetchSubjects();
    }
  }, [open]);

  const fetchSubjects = async () => {
    const token = Cookies.get("token");
    if (!token) {
      alert("Authentication token not found. Please log in.");
      return;
    }

    try {
      const response = await axios.get(
        `https://lmsapp-plvj.onrender.com/admin/subjects/getAll?clsId=${clsId}`,
        {
          headers: {
            "x-admin-token": token,
          },
        }
      );
      setSubjects(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch subjects.");
    }
  };

  // Handle Create Subject
  const handleAddSubject = async () => {
    const token = Cookies.get("token");
    if (!token) {
      alert("Authentication token not found. Please log in.");
      return;
    }

    if (!selectedSubjectId) {
      alert("Please select a subject.");
      return;
    }

    setLoading(true);
    setError(null); // Clear any previous errors

    try {
      const response = await axios.post(
        `https://lmsapp-plvj.onrender.com/admin/directTest/subjects/create/${id}`,
        {
          subject: selectedSubjectId,
        },
        {
          headers: {
            "x-admin-token": token,
          },
        }
      );
      setUpdate(true);
      onClose(); // Close the modal
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
      }}
    >
      <Fade in={open}>
        <Box className={styles.modal}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h5" gutterBottom>
              Add Subject by ID
            </Typography>
            <IconButton onClick={onClose}>
              <Close />
            </IconButton>
          </Box>

          <TextField
            select
            fullWidth
            margin="normal"
            label="Select Subject"
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
          >
            {subjects.map((subject) => (
              <MenuItem key={subject._id} value={subject._id}>
                {subject.subjectName}
              </MenuItem>
            ))}
          </TextField>

          {error && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}

          <Button
            variant="contained"
            color="primary"
            onClick={handleAddSubject}
            fullWidth
            disabled={loading}
            className={styles.createButton}
          >
            {loading ? "Adding..." : "Add Subject"}
          </Button>
        </Box>
      </Fade>
    </Modal>
  );
};

export default CreateTestSubjectModal;
