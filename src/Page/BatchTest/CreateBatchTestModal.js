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

const CreateTestModal = ({
  open,
  handleClose,
  setUpdate,
  batchId,
  subjectId,
}) => {
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

  const token = Cookies.get("token");

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
      await axios.post(
        `https://lmsapp-plvj.onrender.com/admin/batches/test/subjects/tests/create/${batchId}/${subjectId}`,
        {
          ...formData,
          totalMarks: Number(formData.totalMarks),
          duration: Number(formData.duration),
          wrongAnswerDeduction: Number(formData.wrongAnswerDeduction),
          unattemptedDeduction: Number(formData.unattemptedDeduction),
        },
        {
          headers: {
            "x-admin-token": token,
            "Content-Type": "application/json",
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

        <Typography
          variant="h5"
          component="h2"
          mb={2}
          sx={{ fontWeight: "bold" }}
        >
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

          <Typography variant="body1" mt={2}>
            Is this a Free Test?
          </Typography>
          <input
            type="checkbox"
            name="isFreeTest"
            checked={formData.isFreeTest}
            onChange={handleChange}
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
