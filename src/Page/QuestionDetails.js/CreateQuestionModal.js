import React, { useState } from "react";
import {
  Box,
  Button,
  Modal,
  TextField,
  Typography,
  MenuItem,
} from "@mui/material";
import axios from "axios";
import Cookies from "js-cookie";
import styles from "./CreateQuestionModal.module.css";

const CreateQuestionModal = ({ open, handleClose, setUpdate, id, batchId }) => {
  const [formData, setFormData] = useState({
    questionText: "",
    options: ["", "", "", ""],
    difficultyLevel: "",
    correctAnswer: "",
    explanation: "",
  });
  const [error, setError] = useState("");

  // Handle input change for form fields
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Handle changes to options array
  const handleOptionChange = (index, value) => {
    const updatedOptions = [...formData.options];
    updatedOptions[index] = value;
    setFormData((prev) => ({ ...prev, options: updatedOptions }));
  };

  // Validate form data
  const validateForm = () => {
    if (!formData.questionText.trim()) {
      setError("Question text is required.");
      return false;
    }
    if (formData.options.some((option) => !option.trim())) {
      setError("All options must be filled.");
      return false;
    }
    if (!formData.difficultyLevel) {
      setError("Difficulty level is required.");
      return false;
    }
    if (!formData.correctAnswer.trim()) {
      setError("Correct answer is required.");
      return false;
    }
    if (!formData.options.includes(formData.correctAnswer.split(":")[1].trim())) {
      setError("Correct answer must match one of the option texts.");
      return false;
    }
    setError("");
    return true;
  };

  // Submit the form data
  const handleSubmit = async () => {
    if (!validateForm()) return;

    const token = Cookies.get("token");
    try {
      const payload = {
        questionText: formData.questionText,
        options: formData.options.map(
          (option, idx) => `${String.fromCharCode(65 + idx)}: ${option}`
        ),
        difficultyLevel: formData.difficultyLevel,
        correctAnswer: formData.correctAnswer,
        explanation: formData.explanation,
      };

      await axios.post(
        `https://lmsapp-plvj.onrender.com/admin/batches/test/subjects/tests/ques/create/${batchId}/${id}`,
        payload,
        {
          headers: {
            "x-admin-token": token,
          },
        }
      );

      setUpdate((prev) => !prev);
      handleClose();
    } catch (error) {
      console.error("Error creating question:", error);
      setError("Failed to create the question. Please try again.");
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box className={styles.modalContainer}>
        <Typography variant="h6" className={styles.modalTitle}>
          Create a New Question
        </Typography>

        {error && (
          <Typography color="error" className={styles.errorText}>
            {error}
          </Typography>
        )}

        <TextField
          label="Question Text"
          variant="outlined"
          fullWidth
          className={styles.inputField}
          value={formData.questionText}
          onChange={(e) => handleChange("questionText", e.target.value)}
        />

        {formData.options.map((option, index) => (
          <TextField
            key={index}
            label={`Option ${String.fromCharCode(65 + index)}`}
            variant="outlined"
            fullWidth
            className={styles.inputField}
            value={option}
            onChange={(e) => handleOptionChange(index, e.target.value)}
          />
        ))}

        <TextField
          label="Difficulty Level"
          select
          variant="outlined"
          fullWidth
          className={styles.inputField}
          value={formData.difficultyLevel}
          onChange={(e) => handleChange("difficultyLevel", e.target.value)}
        >
          <MenuItem value="Easy">Easy</MenuItem>
          <MenuItem value="Medium">Medium</MenuItem>
          <MenuItem value="Hard">Hard</MenuItem>
        </TextField>

        <TextField
          label="Correct Answer (e.g., B: 4)"
          variant="outlined"
          fullWidth
          className={styles.inputField}
          value={formData.correctAnswer}
          onChange={(e) => handleChange("correctAnswer", e.target.value)}
        />

        <TextField
          label="Explanation"
          variant="outlined"
          fullWidth
          multiline
          rows={4}
          className={styles.inputField}
          value={formData.explanation}
          onChange={(e) => handleChange("explanation", e.target.value)}
        />

        <Box className={styles.actionButtons}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            className={styles.submitButton}
          >
            Submit
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleClose}
            className={styles.cancelButton}
          >
            Cancel
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default CreateQuestionModal;
