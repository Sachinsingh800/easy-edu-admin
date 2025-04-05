import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Grid,
  Paper,
  CircularProgress,
  Typography,
  Container,
  IconButton,
  Box,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import VisibilityIcon from '@mui/icons-material/Visibility';
import styles from "./ClassAdmin.module.css";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

const ClassAdmin = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [currentClass, setCurrentClass] = useState(null);
  const [editedClassName, setEditedClassName] = useState("");
  const [newClassName, setNewClassName] = useState("");
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const navigate = useNavigate();
  const token = Cookies.get("token");

  const fetchNestedData = async (url) => {
    try {
      const response = await axios.get(url, {
        headers: { "x-admin-token": token },
      });
      return response.data.data || [];
    } catch (error) {
      console.error("Error fetching data:", error);
      return [];
    }
  };

  const fetchClassData = async (cls) => {
    try {
      const subjects = await fetchNestedData(
        `https://lmsapp-plvj.onrender.com/admin/offline/class-subject-year-student/subject/getAll/${cls._id}`
      );

      const batchYearsPromises = subjects.map((subject) =>
        fetchNestedData(
          `https://lmsapp-plvj.onrender.com/admin/offline/class-subject-year-student/batchYear/getAll/${subject._id}`
        )
      );
      const batchYearsResults = await Promise.all(batchYearsPromises);
      const batchYears = batchYearsResults.flat();

      const studentsPromises = batchYears.map((batchYear) =>
        fetchNestedData(
          `https://lmsapp-plvj.onrender.com/admin/offline/class-subject-year-student/enrollStudent/getAll/${batchYear._id}`
        )
      );
      const studentsResults = await Promise.all(studentsPromises);

      return {
        ...cls,
        subjectsCount: subjects.length,
        batchYearsCount: batchYears.length,
        studentsCount: studentsResults.flat().length,
      };
    } catch (error) {
      console.error(`Error processing class ${cls._id}:`, error);
      return { ...cls, subjectsCount: 0, batchYearsCount: 0, studentsCount: 0 };
    }
  };

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "https://lmsapp-plvj.onrender.com/admin/offline/class-subject-year-student/class/getAll",
        { headers: { "x-admin-token": token } }
      );

      if (response.data?.data) {
        const classesWithData = await Promise.all(
          response.data.data.map(fetchClassData)
        );
        setClasses(classesWithData);
      }
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch classes. Please try again.");
      setLoading(false);
      console.error("Error fetching classes:", err);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  // Edit functionality
  const handleEditOpen = (cls) => {
    setCurrentClass(cls);
    setEditedClassName(cls.className);
    setEditOpen(true);
  };

  const handleEditClose = () => {
    setEditOpen(false);
    setCurrentClass(null);
    setEditedClassName("");
  };

  const handleUpdateClass = async () => {
    try {
      await axios.put(
        `https://lmsapp-plvj.onrender.com/admin/offline/class-subject-year-student/class/update/${currentClass._id}`,
        { className: editedClassName },
        { headers: { "x-admin-token": token } }
      );

      await fetchClasses();
      setNotification({
        open: true,
        message: "Class updated successfully!",
        severity: "success",
      });
      handleEditClose();
    } catch (err) {
      setNotification({
        open: true,
        message: "Failed to update class. Please try again.",
        severity: "error",
      });
      console.error("Error updating class:", err);
    }
  };

  // Create functionality
  const handleCreateOpen = () => setCreateOpen(true);
  const handleCreateClose = () => {
    setCreateOpen(false);
    setNewClassName("");
  };

  const handleCreateClass = async () => {
    try {
      if (!newClassName.trim()) {
        setNotification({
          open: true,
          message: "Class name cannot be empty!",
          severity: "error",
        });
        return;
      }

      await axios.post(
        "https://lmsapp-plvj.onrender.com/admin/offline/class-subject-year-student/class/create",
        { className: newClassName },
        { headers: { "x-admin-token": token } }
      );

      await fetchClasses();
      setNotification({
        open: true,
        message: "Class created successfully!",
        severity: "success",
      });
      handleCreateClose();
    } catch (err) {
      setNotification({
        open: true,
        message: err.response?.data?.message || "Failed to create class",
        severity: "error",
      });
      console.error("Error creating class:", err);
    }
  };

  return (
<Container maxWidth="xl" className={styles.container}>
      <Box className={styles.header}>
        <Box className={styles.headerContent}>
          <Typography variant="h4" component="h1" className={styles.title}>
            Class Management
            <Chip
              label={`${classes.length} Classes`}
              className={styles.totalChip}
              variant="outlined"
              size="small"
            />
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleCreateOpen}
            className={styles.createButton}
            sx={{
              boxShadow: 3,
              '&:hover': {
                boxShadow: 5,
                transform: 'translateY(-1px)'
              }
            }}
          >
            New Class
          </Button>
        </Box>
      </Box>

      {loading ? (
        <Box className={styles.loadingContainer}>
          <CircularProgress size={60} thickness={4} className={styles.loadingSpinner} />
        </Box>
      ) : error ? (
        <Paper elevation={3} className={styles.errorPaper}>
          <Typography variant="h6" color="error">
            {error}
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3} className={styles.gridContainer}>
          {classes.map((cls) => (
            <Grid item key={cls._id} xs={12} sm={6} md={4} lg={3}>
              <Paper 
                className={styles.classCard}
                elevation={3}
                sx={{
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6
                  }
                }}
              >
                <Box className={styles.cardHeader}>
                  <Typography variant="h6" className={styles.className}>
                    {cls.className}
                  </Typography>
                  <Box className={styles.cardActions}>
                    <IconButton
                      className={styles.editButton}
                      onClick={() => handleEditOpen(cls)}
                      size="small"
                    >
                      <EditIcon fontSize="inherit" />
                    </IconButton>
                    <IconButton
                      className={styles.viewButton}
                      onClick={() => navigate(`/dashboard/subject-management/${cls._id}`)}
                      size="small"
                    >
                      <VisibilityIcon fontSize="inherit" />
                    </IconButton>
                  </Box>
                </Box>

                <Box className={styles.metricsContainer}>
                  <MetricBadge label="Subjects" value={cls.subjectsCount} icon="📚" />
                  <MetricBadge label="Students" value={cls.studentsCount} icon="👥" />
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Edit Dialog */}
      <Dialog 
        open={editOpen} 
        onClose={handleEditClose}
        PaperProps={{ className: styles.dialogPaper }}
      >
        <DialogTitle className={styles.dialogTitle}>
          Edit Class Name
          <IconButton onClick={handleEditClose} className={styles.closeButton}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Class Name"
            fullWidth
            variant="outlined"
            value={editedClassName}
            onChange={(e) => setEditedClassName(e.target.value)}
            className={styles.editField}
            InputProps={{
              sx: { borderRadius: 2 }
            }}
          />
        </DialogContent>
        <DialogActions className={styles.dialogActions}>
          <Button 
            onClick={handleEditClose} 
            className={styles.cancelButton}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdateClass}
            className={styles.saveButton}
            variant="contained"
            startIcon={<SaveIcon />}
          >
            Update Class
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Dialog */}
      <Dialog 
        open={createOpen} 
        onClose={handleCreateClose}
        PaperProps={{ className: styles.dialogPaper }}
      >
        <DialogTitle className={styles.dialogTitle}>
          Create New Class
          <IconButton onClick={handleCreateClose} className={styles.closeButton}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Class Name"
            fullWidth
            variant="outlined"
            value={newClassName}
            onChange={(e) => setNewClassName(e.target.value)}
            className={styles.createField}
            InputProps={{
              sx: { borderRadius: 2 }
            }}
            placeholder="Enter class name..."
          />
        </DialogContent>
        <DialogActions className={styles.dialogActions}>
          <Button 
            onClick={handleCreateClose} 
            className={styles.cancelButton}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateClass}
            className={styles.createButton}
            variant="contained"
            startIcon={<AddIcon />}
          >
            Create Class
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          severity={notification.severity}
          className={styles.notificationAlert}
          icon={false}
          sx={{
            boxShadow: 3,
            borderRadius: 2
          }}
        >
          <Typography variant="body2" fontWeight="medium">
            {notification.message}
          </Typography>
        </Alert>
      </Snackbar>
    </Container>
  );
};

const MetricBadge = ({ label, value, icon }) => (
  <Box className={styles.metricItem}>
    <Typography variant="subtitle2" className={styles.metricLabel}>
      {icon} {label}
    </Typography>
    <Typography variant="h6" className={styles.metricValue}>
      {value}
    </Typography>
  </Box>
);

export default ClassAdmin;