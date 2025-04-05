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
import Cookies from "js-cookie"; // For managing cookies
import axios from "axios"; // For API requests
import styles from "./CreateTeacherModal.module.css"; // Optional module CSS for styling

const CreateTeacherModal = ({ open, onClose, setUpdate }) => {
  const [newTeacher, setNewTeacher] = useState({
    teacherName: "",
    expertise: "",
    yearOfEx: "",
  });
  const [picFile, setPicFile] = useState(null); // For storing the selected file
  const [loading, setLoading] = useState(false); // For button loading state
  const [error, setError] = useState(null); // For displaying errors (optional)
  const [subjectsList, setSubjectsList] = useState([]); // For fetched subjects

  // Fetch subjects from API
  useEffect(() => {
    const fetchSubjects = async () => {
      const token = Cookies.get("token");
      try {
        const response = await axios.get(
          "https://lmsapp-plvj.onrender.com/admin/subjects/getAll",
          {
            headers: {
              "x-admin-token": token,
            },
          }
        );
        setSubjectsList(response.data.data || []); // Set subjects list
      } catch (error) {
        console.error("Error fetching subjects:", error);
      }
    };
    fetchSubjects();
  }, []);

  // Handle input change for text fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTeacher({ ...newTeacher, [name]: value });
  };

  // Handle file selection
  const handleFileChange = (e) => {
    setPicFile(e.target.files[0]);
  };

  // Handle Create Teacher
  const handleCreateTeacher = async () => {
    const token = Cookies.get("token"); // Retrieve token from cookies
    if (!token) {
      alert("Authentication token not found. Please log in.");
      return;
    }

    if (
      !newTeacher.teacherName ||
      !newTeacher.expertise ||
      !newTeacher.yearOfEx ||
      !picFile
    ) {
      alert("Please fill in all fields and upload a picture.");
      return;
    }

    const formData = new FormData();
    formData.append("teacherName", newTeacher.teacherName);
    formData.append("expertise", newTeacher.expertise);
    formData.append("yearOfEx", newTeacher.yearOfEx);
    formData.append("pic", picFile); // Add the selected file to FormData

    setLoading(true);
    setError(null); // Clear any previous errors

    try {
      const response = await axios.post(
        "https://lmsapp-plvj.onrender.com/admin/teachers/create", // API endpoint
        formData,
        {
          headers: {
            "x-admin-token": token,
            "Content-Type": "multipart/form-data", // Set content type for file upload
          },
        }
      );
      setNewTeacher({ teacherName: "", expertise: "", yearOfEx: "" }); // Reset form
      setPicFile(null); // Clear the file input
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
              Create New Teacher
            </Typography>
            <IconButton onClick={onClose}>
              <Close />
            </IconButton>
          </Box>
          <TextField
            fullWidth
            margin="normal"
            label="Teacher Name"
            name="teacherName"
            value={newTeacher.teacherName}
            onChange={handleInputChange}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Expertise"
            name="expertise"
            select
            value={newTeacher.expertise}
            onChange={handleInputChange}
          >
            {subjectsList.map((subject) => (
              <MenuItem key={subject._id} value={subject.subjectName}>
                <img
                  src={subject.icon.url}
                  alt={subject.subjectName}
                  style={{ width: 20, height: 20, marginRight: 8 }}
                />
                {subject.subjectName}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            margin="normal"
            label="Years of Experience"
            name="yearOfEx"
            type="number"
            value={newTeacher.yearOfEx}
            onChange={handleInputChange}
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ margin: "16px 0" }}
          />
          {error && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreateTeacher}
            fullWidth
            disabled={loading}
            className={styles.createButton}
          >
            {loading ? "Creating..." : "Create Teacher"}
          </Button>
        </Box>
      </Fade>
    </Modal>
  );
};

export default CreateTeacherModal;
