import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  CircularProgress,
  Divider,
} from "@mui/material";
import { CheckCircle, Cancel } from "@mui/icons-material";
import axios from "axios";
import Cookies from "js-cookie";
import { useParams } from "react-router-dom";
import styles from "./QuestionList.module.css";

const QuestionList = () => {
  const [testDetails, setTestDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const [update, setUpdate] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = Cookies.get("token");
        const response = await axios.get(
          `https://lmsapp-plvj.onrender.com/admin/directTest/get/${id}`,
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
        Questions
      </Typography>
      <Divider sx={{ marginBottom: 2 }} />
      <Box className={styles.section}>
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
    </Paper>
  );
};

export default QuestionList;
