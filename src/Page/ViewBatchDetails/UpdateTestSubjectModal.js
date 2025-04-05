import React, { useState, useEffect } from "react";
import {
  Modal,
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  MenuItem,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";
import Cookies from "js-cookie";
import styles from "./UpdateSubjectModal.module.css"; // Module-level CSS

const UpdateTestSubjectModal = ({
  open,
  handleClose,
  selectedSubject,
  setUpdate,
}) => {
  const [formData, setFormData] = useState({
    subject: "",
  });
  const [subjectList, setSubjectList] = useState([]);
  const token = Cookies.get("token");
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      fetchAllSubjects();
      if (selectedSubject) {
        setFormData({
          subject: selectedSubject.subjectId || "",
        });
      }
    }
  }, [open, selectedSubject]);

  const fetchAllSubjects = async () => {
    try {
      const response = await axios.get(
        "https://lmsapp-plvj.onrender.com/admin/subjects/getAll",
        {
          headers: {
            "x-admin-token": token,
          },
        }
      );
      setSubjectList(response.data.data || []);
    } catch (err) {
      console.error("Error fetching all subjects:", error);
      setError(err.response?.data?.message || "Something went wrong.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `https://lmsapp-plvj.onrender.com/admin/batches/test/subjects/update/${selectedSubject._id}`,
        formData,
        {
          headers: {
            "x-admin-token": token,
          },
        }
      );
      setUpdate(true);
      handleClose();
    } catch (err) {
      console.error("Error updating subject:", error);
      setError(err.response?.data?.message || "Something went wrong.");
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box className={styles.modal }>
        <IconButton onClick={handleClose} className={styles.closeButton}>
          <CloseIcon />
        </IconButton>

        <Typography variant="h6" component="h2" mb={2} className={styles.title}>
          Update Subject
        </Typography>

        <form onSubmit={handleSubmit} className={styles.form}>
          <TextField
            select
            fullWidth
            label="Select Subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            margin="normal"
            required
          >
            {subjectList.map((subject) => (
              <MenuItem key={subject._id} value={subject._id}>
                {subject.subjectName}
              </MenuItem>
            ))}
          </TextField>
          {error && (
            <Typography variant="body2" color="error" mb={2}>
              {error}
            </Typography>
          )}

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            className={styles.submitButton}
          >
            Update Subject
          </Button>
        </form>
      </Box>
    </Modal>
  );
};

export default UpdateTestSubjectModal;
