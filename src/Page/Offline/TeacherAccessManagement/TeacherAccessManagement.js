import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Checkbox,
  ListItemText,
  CircularProgress,
  Box,
  Snackbar,
  IconButton,
  Avatar,
  Divider,
  Skeleton,
  Alert,
  useTheme,
} from "@mui/material";
import {
  Add,
  Close,
  Delete,
  ClassOutlined,
  SubjectOutlined,
  Schedule,
  Person,
} from "@mui/icons-material";
import { useParams } from "react-router-dom";
import Cookies from "js-cookie";

const TeacherAccessManagement = () => {
  const { id } = useParams();
  const theme = useTheme();
  const [teacherAccess, setTeacherAccess] = useState(null);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [batches, setBatches] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedBatches, setSelectedBatches] = useState([]);
  const [currentAccesses, setCurrentAccesses] = useState([]);
  const [openManageDialog, setOpenManageDialog] = useState(false);
  const [loading, setLoading] = useState({
    teacher: true,
    classes: false,
    subjects: false,
    batches: false,
    updating: false,
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const token = Cookies.get("token");

  useEffect(() => {
    fetchTeacherAccess();
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) fetchSubjects(selectedClass);
  }, [selectedClass]);

  useEffect(() => {
    if (selectedSubject) fetchBatches(selectedSubject);
  }, [selectedSubject]);

  const fetchTeacherAccess = async () => {
    try {
      const response = await axios.get(
        `https://lmsapp-plvj.onrender.com/admin/offline/teacher/access/get/${id}`,
        { headers: { "x-admin-token": token } }
      );
      setTeacherAccess(response.data.data);
      setCurrentAccesses(response.data.data.access || []);
    } catch (error) {
    } finally {
      setLoading((prev) => ({ ...prev, teacher: false }));
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await axios.get(
        "https://lmsapp-plvj.onrender.com/admin/offline/class-subject-year-student/class/getAll",
        { headers: { "x-admin-token": token } }
      );
      setClasses(response.data.data || []);
    } catch (error) {
      showSnackbar("Failed to fetch classes", "error");
    }
  };

  const fetchSubjects = async (classId) => {
    setLoading((prev) => ({ ...prev, subjects: true }));
    try {
      const response = await axios.get(
        `https://lmsapp-plvj.onrender.com/admin/offline/class-subject-year-student/subject/getAll/${classId}`,
        { headers: { "x-admin-token": token } }
      );
      setSubjects(response.data.data || []);
    } catch (error) {
      showSnackbar("Failed to fetch subjects", "error");
    } finally {
      setLoading((prev) => ({ ...prev, subjects: false }));
    }
  };

  const fetchBatches = async (subjectId) => {
    setLoading((prev) => ({ ...prev, batches: true }));
    try {
      const response = await axios.get(
        `https://lmsapp-plvj.onrender.com/admin/offline/class-subject-year-student/batchYear/getAll/${subjectId}`,
        { headers: { "x-admin-token": token } }
      );
      setBatches(response.data.data || []);
    } catch (error) {
      showSnackbar("Failed to fetch batches", "error");
    } finally {
      setLoading((prev) => ({ ...prev, batches: false }));
    }
  };

  const handleAddBatches = () => {
    if (!selectedClass || !selectedSubject || selectedBatches.length === 0)
      return;

    const classObj = classes.find((c) => c._id === selectedClass);
    const subjectObj = subjects.find((s) => s._id === selectedSubject);
    const newAccesses = selectedBatches.map((batchId) => {
      const batch = batches.find((b) => b._id === batchId);
      return {
        class: {
          id: selectedClass,
          className: classObj?.className || "Unknown Class",
        },
        subject: {
          id: selectedSubject,
          subjectName: subjectObj?.subjectName || "Unknown Subject",
        },
        batch: {
          id: batchId,
          batchYear: batch?.batchYear || "Unknown Batch",
        },
      };
    });

    setCurrentAccesses((prev) => [...prev, ...newAccesses]);
    setSelectedBatches([]);
    setSelectedClass("");
    setSelectedSubject("");
  };

  const handleRemoveAccess = (batchId) => {
    setCurrentAccesses((prev) =>
      prev.filter((access) => access.batch.id !== batchId)
    );
  };

  const handleUpdateAccess = async () => {
    setLoading((prev) => ({ ...prev, updating: true }));
    try {
      const accessData = {
        access: {
          batchYear: currentAccesses.map((access) => access.batch.id),
        },
      };

      await axios.put(
        `https://lmsapp-plvj.onrender.com/admin/offline/teacher/access/update/${id}`,
        accessData,
        { headers: { "x-admin-token": token } }
      );

      showSnackbar("Access updated successfully", "success");
      fetchTeacherAccess();
      setOpenManageDialog(false);
    } catch (error) {
      showSnackbar("Failed to update access", "error");
    } finally {
      setLoading((prev) => ({ ...prev, updating: false }));
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  return (
    <Container
      maxWidth="xl"
      sx={{ py: 4, background: theme.palette.background.default }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
          p: 3,
          borderRadius: 2,
          background: theme.palette.background.paper,
          boxShadow: theme.shadows[1],
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: theme.palette.text.primary,
            letterSpacing: "-0.5px",
          }}
        >
          Teacher Access Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenManageDialog(true)}
          sx={{
            textTransform: "none",
            py: 1.5,
            px: 3,
            borderRadius: 2,
            boxShadow: "none",
            "&:hover": { boxShadow: "none" },
          }}
        >
          Manage Access
        </Button>
      </Box>

      {loading.teacher ? (
        <Skeleton
          variant="rectangular"
          width="100%"
          height={200}
          sx={{ borderRadius: 2 }}
        />
      ) : teacherAccess ? (
        <>
          <Card
            sx={{
              mb: 4,
              background: theme.palette.background.paper,
              borderLeft: `4px solid ${theme.palette.primary.main}`,
            }}
          >
            <CardContent>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 3, mb: 2 }}
              >
                <Avatar
                  sx={{
                    width: 56,
                    height: 56,
                    background: theme.palette.primary.main,
                  }}
                >
                  <Person fontSize="large" />
                </Avatar>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    {teacherAccess?.teacher?.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Teacher ID: {teacherAccess?.teacher?.teacherId}
                  </Typography>
                </Box>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                <Chip
                  icon={<ClassOutlined />}
                  label={`Class Access: ${teacherAccess?.access?.length || 0}`}
                  variant="outlined"
                  sx={{ borderRadius: 1 }}
                />
                <Chip
                  icon={<SubjectOutlined />}
                  label={`Expertise: ${teacherAccess?.teacher?.expertise}`}
                  variant="outlined"
                  sx={{ borderRadius: 1 }}
                />
              </Box>
            </CardContent>
          </Card>

          <Grid container spacing={3}>
            {teacherAccess?.access?.map((access, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card
                  sx={{
                    height: "100%",
                    transition: "0.3s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: theme.shadows[4],
                    },
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                      <Avatar
                        sx={{
                          background: theme.palette.secondary.main,
                          width: 40,
                          height: 40,
                        }}
                      >
                        {access.class.className[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {access.class.className}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {access.subject.subjectName}
                        </Typography>
                      </Box>
                    </Box>
                    <Divider sx={{ my: 1.5 }} />
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mt: 1.5,
                      }}
                    >
                      <Schedule fontSize="small" color="action" />
                      <Typography variant="body2">
                        Batch: {access.batch.batchYear}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      ) : (
        <Box
          sx={{
            textAlign: "center",
            py: 8,
            background: theme.palette.background.paper,
            borderRadius: 2,
            boxShadow: theme.shadows[1],
          }}
        >
          <Typography variant="h6" sx={{ mb: 3 }}>
            No any access found. Add access first.
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpenManageDialog(true)}
            sx={{
              textTransform: "none",
              py: 1.5,
              px: 4,
              borderRadius: 2,
            }}
          >
            Add Access
          </Button>
        </Box>
      )}

      <Dialog
        open={openManageDialog}
        onClose={() => setOpenManageDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle
          sx={{
            bgcolor: theme.palette.background.paper,
            borderBottom: `1px solid ${theme.palette.divider}`,
            py: 2,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Manage Access Permissions
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ py: 3 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
              Current Access ({currentAccesses.length})
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 1,
                minHeight: 80,
                p: 1.5,
                borderRadius: 1.5,
                border: `1px solid ${theme.palette.divider}`,
                background: theme.palette.background.default,
              }}
            >
              {currentAccesses.length > 0 ? (
                currentAccesses.map((access, index) => (
                  <Chip
                    key={index}
                    label={`${access.class.className} | ${access.subject.subjectName} | ${access.batch.batchYear}`}
                    onDelete={() => handleRemoveAccess(access.batch.id)}
                    deleteIcon={<Delete fontSize="small" />}
                    variant="outlined"
                    sx={{
                      borderRadius: 1,
                      "& .MuiChip-deleteIcon": {
                        color: theme.palette.error.main,
                      },
                    }}
                  />
                ))
              ) : (
                <Typography variant="body2" color="textSecondary" sx={{ m: 2 }}>
                  No access permissions added yet
                </Typography>
              )}
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography variant="subtitle1" sx={{ mb: 3, fontWeight: 600 }}>
            Add New Batches
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth variant="filled">
                <InputLabel>Select Class</InputLabel>
                <Select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  label="Class"
                  MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }}
                >
                  {classes.map((cls) => (
                    <MenuItem key={cls._id} value={cls._id}>
                      <ListItemText primary={cls.className} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth variant="filled">
                <InputLabel>Select Subject</InputLabel>
                <Select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  label="Subject"
                  disabled={!selectedClass || loading.subjects}
                >
                  {loading.subjects ? (
                    <MenuItem disabled>
                      <CircularProgress size={20} sx={{ mr: 2 }} />
                      Loading subjects...
                    </MenuItem>
                  ) : (
                    subjects.map((subject) => (
                      <MenuItem key={subject._id} value={subject._id}>
                        <ListItemText primary={subject.subjectName} />
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth variant="filled">
                <InputLabel>Select Batches</InputLabel>
                <Select
                  multiple
                  value={selectedBatches}
                  onChange={(e) => setSelectedBatches(e.target.value)}
                  label="Batches"
                  disabled={!selectedSubject || loading.batches}
                  renderValue={(selected) => (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {selected.map((batchId) => {
                        const batch = batches.find((b) => b._id === batchId);
                        return (
                          <Chip
                            key={batchId}
                            label={batch?.batchYear || "Unknown"}
                            size="small"
                            sx={{ borderRadius: 1 }}
                          />
                        );
                      })}
                    </Box>
                  )}
                  MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }}
                >
                  {loading.batches ? (
                    <MenuItem disabled>
                      <CircularProgress size={20} sx={{ mr: 2 }} />
                      Loading batches...
                    </MenuItem>
                  ) : (
                    batches.map((batch) => (
                      <MenuItem key={batch._id} value={batch._id}>
                        <Checkbox
                          checked={selectedBatches.includes(batch._id)}
                        />
                        <ListItemText primary={batch.batchYear} />
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            py: 2,
            borderTop: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Button
            onClick={() => setOpenManageDialog(false)}
            sx={{ color: theme.palette.text.secondary }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddBatches}
            variant="outlined"
            disabled={!selectedSubject || selectedBatches.length === 0}
            sx={{ borderRadius: 2 }}
          >
            Add Selected
          </Button>
          <Button
            onClick={handleUpdateAccess}
            variant="contained"
            disabled={loading.updating}
            sx={{
              borderRadius: 2,
              px: 4,
              "&.Mui-disabled": {
                background: theme.palette.action.disabledBackground,
              },
            }}
          >
            {loading.updating ? (
              <CircularProgress size={24} sx={{ color: "white" }} />
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          severity={snackbar.severity}
          sx={{
            width: "100%",
            borderRadius: 2,
            boxShadow: theme.shadows[3],
            alignItems: "center",
          }}
          action={
            <IconButton
              size="small"
              color="inherit"
              onClick={() => setSnackbar({ ...snackbar, open: false })}
            >
              <Close fontSize="small" />
            </IconButton>
          }
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default TeacherAccessManagement;
