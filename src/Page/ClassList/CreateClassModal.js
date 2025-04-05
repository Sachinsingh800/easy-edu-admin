import React, { useState } from "react";
import { Modal, Box, Typography, TextField, Button, Snackbar, Alert } from "@mui/material";
import styles from "./CreateClassModal.module.css"; // Module-level CSS
import Cookies from "js-cookie";
import axios from "axios";

const CreateClassModal = ({ open, handleClose ,setUpdate }) => {
  const [formData, setFormData] = useState({
    clsName: "",
    clsNum: "",
  });
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");


  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = Cookies.get("token");

    if (!token) {
      setSnackbarMessage("Authentication token is missing. Please log in again.");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
      return;
    }

    if (!formData.clsName || !formData.clsNum) {
      setSnackbarMessage("Please fill out all fields before submitting.");
      setSnackbarSeverity("warning");
      setOpenSnackbar(true);
      return;
    }

    try {
      // Use axios.post to make the API request
      const response = await axios.post(
        "https://lmsapp-plvj.onrender.com/admin/classes/create",
        formData,
        {
          headers: {
            "x-admin-token": token,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status) {
        setSnackbarMessage("Class created successfully!");
        setSnackbarSeverity("success");
        setOpenSnackbar(true);
        setUpdate(true)
        handleClose(); // Close modal on success
        setFormData({ clsName: "", clsNum: "" }); // Clear the form
      } 
    } catch (error) {
      console.error("Error:", error);
      setSnackbarMessage("An unexpected error occurred. Please try again later.");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    }
  };

  return (
    <>
      <Modal open={open} onClose={handleClose}>
        <Box className={styles.modalBox}>
          <Typography variant="h5" className={styles.title}>
            Create a New Class
          </Typography>
          <form onSubmit={handleSubmit}>
            {/* Class Name */}
            <TextField
              label="Class Name"
              name="clsName"
              value={formData.clsName}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />

            {/* Class Number */}
            <TextField
              label="Class Number"
              name="clsNum"
              type="number"
              value={formData.clsNum}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />

            {/* Submit Button */}
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              className={styles.submitButton}
            >
              Create Class
            </Button>
          </form>
        </Box>
      </Modal>

      {/* Snackbar for Notifications */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert onClose={() => setOpenSnackbar(false)} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default CreateClassModal;
