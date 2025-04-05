import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { CheckCircle, Cancel } from "@mui/icons-material";
import axios from "axios";
import Cookies from "js-cookie";
import { useParams } from "react-router-dom";
import styles from "./QuestionDetails.module.css";
import { Delete, Edit } from "@mui/icons-material";
import UpdateTestModal from "./UpdateTestModal";
import CreateTestModal from "./CreateTestModal";

const QuestionDetails = () => {
  const [testDetails, setTestDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [uploadDocModalOpen, setUploadDocModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [update, setUpdate] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [questionId, setQuestionId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = Cookies.get("token");
        const response = await axios.get(
          `https://lmsapp-plvj.onrender.com/admin/directTest/chapter/questions/get/${id}`,
          {
            headers: {
              "x-admin-token": token,
            },
          }
        );
        setTestDetails(response.data.data);
        setLoading(false);
        setUpdate(false);
      } catch (error) {
        console.error("Error fetching test details:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [id, update]);

  // Handle delete confirmation dialog open
  const handleDeleteClick = (id) => {
    setQuestionId(id);
    setOpenDeleteDialog(true);
  };

  // Handle delete teacher
  const handleDelete = async () => {
    try {
      const token = Cookies.get("token"); // Replace with your token key
      await axios.delete(
        `https://lmsapp-plvj.onrender.com/admin/batches/test/subjects/tests/ques/delete/${questionId}`,
        {
          headers: {
            "x-admin-token": token,
          },
        }
      );
      setUpdate(true);
      setOpenDeleteDialog(false);
    } catch (error) {
      console.error("Error deleting teacher:", error);
    }
  };
  const handleOpenCreateModal = () => {
    setCreateModalOpen(true);
  };

  const handleOpenUpdateModal = (question) => {
    setSelectedQuestion(question);
    setUpdateModalOpen(true);
  };

  if (loading) {
    return (
      <Box className={styles.loadingContainer}>
        <CircularProgress />
        <Typography variant="body1" color="primary">
          Loading test details...
        </Typography>
      </Box>
    );
  }

  if (!testDetails) {
    return (
      <Typography variant="body1" color="error" align="center">
        Error loading test details.
      </Typography>
    );
  }

  const { name, description, questions, totalMarks, duration } = testDetails;

  return (
    <Paper className={styles.container}>
      <Typography variant="h4" className={styles.title} gutterBottom>
        Test Details
      </Typography>

      <Divider sx={{ marginBottom: 2 }} />

      <Box className={styles.section}>
        <Typography variant="h5" gutterBottom>
          Questions
        </Typography>
        {questions.map((question, index) => (
          <Paper
            key={question._id}
            className={styles.questionCard}
            elevation={3}
          >
            <Box className={styles.header_box}>
              <Typography className={styles.questionText}>
                {index + 1}. {question.questionText}
              </Typography>
              <div>
                <IconButton
                  color="error"
                  onClick={() => handleDeleteClick(question._id)}
                  className={styles.editButton}
                >
                  <Delete />
                </IconButton>
                <IconButton
                  color="primary"
                  onClick={() => handleOpenUpdateModal(question)}
                  className={styles.editButton}
                >
                  <Edit />
                </IconButton>
              </div>
            </Box>

            <List>
              {question.options.map((option, i) => (
                <ListItem key={i}>
                  <ListItemIcon>
                    {option.isCorrect ? (
                      <CheckCircle color="success" />
                    ) : (
                      <Cancel color="error" />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={`${String.fromCharCode(65 + i)}: ${
                      option.optionText
                    }`}
                  />
                </ListItem>
              ))}
            </List>

            <Typography variant="body2" className={styles.difficultyLevel}>
              Difficulty: {question.difficultyLevel}
            </Typography>

            <Typography variant="body2" className={styles.correctAnswer}>
              Correct Answer: {question.correctAnswer}
            </Typography>

            <Typography variant="body2" className={styles.explanation}>
              Explanation: {question.explanation}
            </Typography>
          </Paper>
        ))}
      </Box>

      <Button
        variant="contained"
        color="primary"
        onClick={handleOpenCreateModal}
        className={styles.addButton}
      >
        Add New Question
      </Button>
      {/* <Button
        variant="contained"
        color="primary"
        onClick={() => setUploadDocModalOpen(true)}
        className={styles.addButton}
      >
        Upload Docx
      </Button> */}

      <UpdateTestModal
        open={updateModalOpen}
        handleClose={() => setUpdateModalOpen(false)}
        setUpdate={setUpdate}
        question={selectedQuestion}
      />
      <CreateTestModal
        open={createModalOpen}
        handleClose={() => setCreateModalOpen(false)}
        setUpdate={setUpdate}
        id={id}
      />

      {/* <UploadDocxModal
        open={uploadDocModalOpen}
        handleClose={() => setUploadDocModalOpen(false)}
        setUpdate={setUpdate}
        id={id}
      /> */}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this question? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenDeleteDialog(false)}
            color="primary"
            variant="outlined"
          >
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default QuestionDetails;
