import React, { useState } from "react";
import {
  Modal,
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";
import Cookies from "js-cookie";
import { useParams } from "react-router-dom";

const CreateTestModal = ({ open, handleClose, setUpdate }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    totalMarks: "",
    duration: "",
    wrongAnswerDeduction: "",
    unattemptedDeduction: "",
    testCount: "",
    numberOfTests: "",
    file: null,
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const token = Cookies.get("token");
  const { chapterId } = useParams();

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "file" ? files[0] : value,
    }));
  };

  const validateFile = (file) => {
    if (!file) return "Please upload a file.";
    const allowedTypes = ["application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!allowedTypes.includes(file.type)) return "Only DOC or DOCX files are allowed.";
    if (file.size > 5 * 1024 * 1024) return "File size must be less than 5MB.";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    // Validations
    const fileError = validateFile(formData.file);
    if (fileError) {
      setError(fileError);
      setIsSubmitting(false);
      return;
    }

    const numericValidations = [
      { field: "testCount", name: "Test count", min: 1, integer: true },
      { field: "numberOfTests", name: "Number of tests", min: 1, integer: true },
      { field: "totalMarks", name: "Total marks", min: 0 },
      { field: "duration", name: "Duration", min: 1 },
      { field: "wrongAnswerDeduction", name: "Wrong answer deduction", min: 0, optional: true },
      { field: "unattemptedDeduction", name: "Unattempted deduction", min: 0, optional: true },
    ];

    for (const validation of numericValidations) {
      const value = formData[validation.field];
      if (!validation.optional && value === "") {
        setError(`${validation.name} is required`);
        setIsSubmitting(false);
        return;
      }

      const numValue = Number(value);
      if (isNaN(numValue)) {
        setError(`${validation.name} must be a valid number`);
        setIsSubmitting(false);
        return;
      }

      if (validation.integer && !Number.isInteger(numValue)) {
        setError(`${validation.name} must be an integer`);
        setIsSubmitting(false);
        return;
      }

      if (numValue < validation.min) {
        setError(`${validation.name} must be at least ${validation.min}`);
        setIsSubmitting(false);
        return;
      }
    }

    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("totalMarks", formData.totalMarks);
    formDataToSend.append("duration", formData.duration);
    formDataToSend.append("wrongAnswerDeduction", formData.wrongAnswerDeduction || 0);
    formDataToSend.append("unattemptedDeduction", formData.unattemptedDeduction || 0);
    formDataToSend.append("testCount", formData.testCount);
    formDataToSend.append("numberOfTests", formData.numberOfTests);
    formDataToSend.append("file", formData.file);

    try {
      await axios.post(
        `https://lmsapp-plvj.onrender.com/admin/directTest/chapter/questions/create/${chapterId}`,
        formDataToSend,
        {
          headers: {
            "x-admin-token": token,
            "Content-Type": "multipart/form-data",
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
    <Modal open={open} onClose={handleClose}>
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
        >
          <CloseIcon />
        </IconButton>

        <Typography variant="h5" component="h2" mb={2} sx={{ fontWeight: "bold" }}>
          Create Test
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
            inputProps={{ min: 0 }}
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
            inputProps={{ min: 1 }}
          />

          <TextField
            fullWidth
            label="Wrong Answer Deduction"
            name="wrongAnswerDeduction"
            type="number"
            value={formData.wrongAnswerDeduction}
            onChange={handleChange}
            margin="normal"
            inputProps={{ min: 0 }}
          />

          <TextField
            fullWidth
            label="Unattempted Deduction"
            name="unattemptedDeduction"
            type="number"
            value={formData.unattemptedDeduction}
            onChange={handleChange}
            margin="normal"
            inputProps={{ min: 0 }}
          />

          <TextField
            fullWidth
            label="Test Count"
            name="testCount"
            type="number"
            value={formData.testCount}
            onChange={handleChange}
            margin="normal"
            required
            inputProps={{ min: 1, step: 1 }}
          />

          <TextField
            fullWidth
            label="Number of Tests"
            name="numberOfTests"
            type="number"
            value={formData.numberOfTests}
            onChange={handleChange}
            margin="normal"
            required
            inputProps={{ min: 1, step: 1 }}
          />

          <Typography variant="body1" mt={2} mb={1}>
            Upload DOC/DOCX (Max size: 5MB):
          </Typography>
          <input
            type="file"
            name="file"
            accept=".doc,.docx"
            onChange={handleChange}
            required
          />

          {error && (
            <Typography variant="body2" color="error" mt={2}>
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
            {isSubmitting ? "Creating..." : "Create Test"}
          </Button>
        </form>
      </Box>
    </Modal>
  );
};

export default CreateTestModal;