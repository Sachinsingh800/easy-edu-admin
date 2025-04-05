import React, { useState, useEffect } from "react";
import {
  Modal,
  Box,
  TextField,
  Button,
  Typography,
  Checkbox,
  FormControlLabel,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";
import Cookies from "js-cookie";

const UpdateTestModal = ({ open, handleClose, selectedTest, setUpdate }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    totalMarks: "",
    duration: "",
    wrongAnswerDeduction: "",
    unattemptedDeduction: "",
    isFreeTest: false,
  });

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Retrieve token once to avoid unnecessary re-fetching
  const token = Cookies.get("token");

  useEffect(() => {
    if (selectedTest) {
      setFormData({
        name: selectedTest.name || "",
        description: selectedTest.description || "",
        totalMarks: selectedTest.totalMarks || "",
        duration: selectedTest.duration || "",
        wrongAnswerDeduction: selectedTest.wrongAnswerDeduction || "",
        unattemptedDeduction: selectedTest.unattemptedDeduction || "",
        isFreeTest: selectedTest.isFreeTest || false,
      });
    }
  }, [selectedTest]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await axios.put(
        `https://lmsapp-plvj.onrender.com/admin/batches/test/subjects/tests/update/${selectedTest._id}`,
        formData,
        {
          headers: {
            "x-admin-token": token,
            "Content-Type": "application/json", // Ensure Content-Type is JSON
          },
        }
      );
      setUpdate(true);
      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="update-test-modal"
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "90%",
          maxWidth: 800,
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
          overflowY: "auto",
          maxHeight: "90vh",
        }}
      >
        <IconButton
          onClick={handleClose}
          sx={{ position: "absolute", top: 8, right: 8 }}
          aria-label="close"
        >
          <CloseIcon />
        </IconButton>

        <Typography
          variant="h5"
          component="h2"
          mb={2}
          sx={{ fontWeight: "bold" }}
          id="update-test-modal"
        >
          Update Test
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Test Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label="Total Marks"
            name="totalMarks"
            type="number"
            value={formData.totalMarks}
            onChange={handleChange}
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label="Duration (minutes)"
            name="duration"
            type="number"
            value={formData.duration}
            onChange={handleChange}
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label="Wrong Answer Deduction"
            name="wrongAnswerDeduction"
            type="number"
            value={formData.wrongAnswerDeduction}
            onChange={handleChange}
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label="Unattempted Deduction"
            name="unattemptedDeduction"
            type="number"
            value={formData.unattemptedDeduction}
            onChange={handleChange}
            margin="normal"
            required
          />

          <FormControlLabel
            control={
              <Checkbox
                name="isFreeTest"
                checked={formData.isFreeTest}
                onChange={handleChange}
              />
            }
            label="Is Free Test"
          />

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
            sx={{ mt: 3 }}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Updating..." : "Update Test"}
          </Button>
        </form>
      </Box>
    </Modal>
  );
};

export default UpdateTestModal;
