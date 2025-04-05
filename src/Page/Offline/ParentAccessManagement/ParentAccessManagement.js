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
  TextField,
} from "@mui/material";
import {
  Add,
  Close,
  Delete,
  ClassOutlined,
  SubjectOutlined,
  Schedule,
  Person,
  CalendarToday,
  Group,
  School,
  LocationOn,
} from "@mui/icons-material";
import { useParams } from "react-router-dom";
import Cookies from "js-cookie";

const ParentAccessManagement = () => {
  const { id } = useParams();
  const theme = useTheme();
  const [parentAccess, setParentAccess] = useState(null);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [batches, setBatches] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedBatches, setSelectedBatches] = useState([]);
  const [currentEnrollments, setCurrentEnrollments] = useState([]);
  const [openManageDialog, setOpenManageDialog] = useState(false);
  const [loading, setLoading] = useState({
    parent: true,
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
  const [availableStudents, setAvailableStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [studentIdsInput, setStudentIdsInput] = useState("");

  const token = Cookies.get("token");

  useEffect(() => {
    fetchParentAccess();
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) fetchSubjects(selectedClass);
  }, [selectedClass]);

  useEffect(() => {
    if (selectedSubject) fetchBatches(selectedSubject);
  }, [selectedSubject]);

  useEffect(() => {
    const fetchStudentsForBatches = async () => {
      if (selectedBatches.length === 0) {
        setAvailableStudents([]);
        return;
      }
      try {
        let allStudents = [];
        for (const batchId of selectedBatches) {
          const students = await fetchStudentsByBatch(batchId);
          allStudents = [...allStudents, ...students];
        }
        const uniqueStudents = allStudents.filter(
          (student, index, self) =>
            index === self.findIndex((s) => s._id === student._id)
        );
        setAvailableStudents(uniqueStudents);
      } catch (error) {
        showSnackbar("Failed to fetch students", "error");
      }
    };
    fetchStudentsForBatches();
  }, [selectedBatches]);

  const fetchParentAccess = async () => {
    try {
      const response = await axios.get(
        `https://lmsapp-plvj.onrender.com/admin/offline/parent/access/get/${id}`,
        { headers: { "x-admin-token": token } }
      );
      setParentAccess(response.data.data);
      setCurrentEnrollments(response.data.data.studentBatchEnrollment || []);
    } catch (error) {
      showSnackbar("Failed to fetch parent access", "error");
    } finally {
      setLoading((prev) => ({ ...prev, parent: false }));
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

  const fetchStudentsByBatch = async (batchId) => {
    try {
      const response = await axios.get(
        `https://lmsapp-plvj.onrender.com/admin/offline/class-subject-year-student/enrollStudent/getAll/${batchId}`,
        { headers: { "x-admin-token": token } }
      );
      return response.data.data;
    } catch (error) {
      showSnackbar("Failed to fetch students", "error");
      return [];
    }
  };

  const handleAddBatches = async () => {
    if (selectedStudents.length === 0) return;

    setLoading((prev) => ({ ...prev, updating: true }));

    try {
      const newStudents = availableStudents.filter((student) =>
        selectedStudents.includes(student._id)
      );

      const existingStudentIds = new Set(currentEnrollments.map((s) => s._id));
      const uniqueNewStudents = newStudents.filter(
        (student) => !existingStudentIds.has(student._id)
      );

      setCurrentEnrollments((prev) => [...prev, ...uniqueNewStudents]);
      setSelectedBatches([]);
      setSelectedClass("");
      setSelectedSubject("");
      setAvailableStudents([]);
      setSelectedStudents([]);
      showSnackbar(`${uniqueNewStudents.length} students added`, "success");
    } catch (error) {
      showSnackbar("Failed to add students", "error");
    } finally {
      setLoading((prev) => ({ ...prev, updating: false }));
    }
  };

  const handleAddByStudentIds = async () => {
    const studentIds = studentIdsInput
      .split(",")
      .map((id) => id.trim())
      .filter((id) => id);

    if (studentIds.length === 0) {
      showSnackbar("Please enter valid student IDs", "error");
      return;
    }

    setLoading((prev) => ({ ...prev, updating: true }));

    try {
      const newStudents = [];
      const invalidIds = [];

      for (const studentId of studentIds) {
        try {
          const response = await axios.get(
            `https://lmsapp-plvj.onrender.com/admin/offline/students/get/${studentId}`,
            { headers: { "x-admin-token": token } }
          );
          if (response.data.data) {
            newStudents.push(response.data.data);
          } else {
            invalidIds.push(studentId);
          }
        } catch (error) {
          invalidIds.push(studentId);
        }
      }

      const existingIds = new Set(currentEnrollments.map((s) => s._id));
      const uniqueNewStudents = newStudents.filter(
        (student) => !existingIds.has(student._id)
      );

      if (uniqueNewStudents.length > 0) {
        setCurrentEnrollments((prev) => [...prev, ...uniqueNewStudents]);
        showSnackbar(`Added ${uniqueNewStudents.length} student(s)`, "success");
      }

      if (invalidIds.length > 0) {
        showSnackbar(`Invalid student IDs: ${invalidIds.join(", ")}`, "error");
      }

      setStudentIdsInput("");
    } catch (error) {
      showSnackbar("Error adding students by ID", "error");
    } finally {
      setLoading((prev) => ({ ...prev, updating: false }));
    }
  };

  const handleRemoveAccess = (studentId) => {
    setCurrentEnrollments((prev) =>
      prev.filter((enrollment) => enrollment._id !== studentId)
    );
  };

  const handleUpdateAccess = async () => {
    setLoading((prev) => ({ ...prev, updating: true }));
    try {
      const enrollmentData = {
        studentBatchEnrollment: currentEnrollments.map(
          (student) => student._id
        ),
      };

      await axios.put(
        `https://lmsapp-plvj.onrender.com/admin/offline/parent/access/update/${id}`,
        enrollmentData,
        { headers: { "x-admin-token": token } }
      );

      showSnackbar("Access updated successfully", "success");
      fetchParentAccess();
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

  const handleCloseDialog = () => {
    setOpenManageDialog(false);
    setSelectedClass("");
    setSelectedSubject("");
    setSelectedBatches([]);
    setAvailableStudents([]);
    setSelectedStudents([]);
    setStudentIdsInput("");
  };

  // Reusable DetailSection component
  const DetailSection = ({ icon, title, items, children, sx }) => (
    <Box sx={{ ...sx }}>
      <Typography
        variant="subtitle2"
        sx={{
          mb: 1,
          display: "flex",
          alignItems: "center",
          gap: 1,
          color: "text.secondary",
          textTransform: "uppercase",
          letterSpacing: 0.5,
        }}
      >
        {icon} {title}
      </Typography>
      {children || (
        <Box
          component="ul"
          sx={{
            m: 0,
            pl: 2,
            "& > *:not(:last-child)": { mb: 1 },
          }}
        >
          {items.map((item, i) => (
            <Typography
              key={i}
              component="li"
              variant="body2"
              sx={{ lineHeight: 1.4 }}
            >
              {item}
            </Typography>
          ))}
        </Box>
      )}
    </Box>
  );

  // Phone number formatting helper
  const formatPhoneNumber = (num) =>
    num?.replace(/(\d{3})(\d{3})(\d{4})/, "$1 $2 $3") || "N/A";

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
        }}
      >
        <Typography variant="h4">Parent Access Management</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenManageDialog(true)}
        >
          Manage Access
        </Button>
      </Box>

      {loading.parent ? (
        <Skeleton variant="rectangular" height={200} />
      ) : parentAccess ? (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
              <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                <Person />
              </Avatar>
              <Box>
                <Typography variant="h5">
                  {parentAccess.parentId.parentName}
                </Typography>
                <Typography>Email: {parentAccess.parentId.email}</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Typography>No parent data found</Typography>
      )}

      <Grid container spacing={3}>
        {currentEnrollments?.map((enrollment) => (
          <Grid item xs={12} md={6} lg={4} key={enrollment._id}>
            <Card
              sx={{
                height: "100%",
                transition: "transform 0.3s, box-shadow 0.3s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 3,
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                {/* Student Profile Section */}
                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    mb: 3,
                    alignItems: "center",
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    pb: 2,
                  }}
                >
                  <Avatar
                    src={enrollment.profilePic?.url}
                    sx={{
                      width: 64,
                      height: 64,
                      border: "2px solid",
                      borderColor: "primary.main",
                      bgcolor: "primary.light",
                    }}
                  >
                    {enrollment.studentName[0]}
                  </Avatar>
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        color: "text.primary",
                      }}
                    >
                      {enrollment.studentName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <CalendarToday
                        fontSize="inherit"
                        sx={{
                          fontSize: 14,
                          mr: 0.5,
                          verticalAlign: "middle",
                        }}
                      />
                      {new Date(enrollment.dob).toLocaleDateString()}
                    </Typography>
                    <Chip
                      label={enrollment.gender}
                      size="small"
                      sx={{
                        mt: 0.5,
                        textTransform: "capitalize",
                        bgcolor:
                          enrollment.gender.toLowerCase() === "male"
                            ? "primary.light"
                            : "secondary.light",
                      }}
                    />
                  </Box>
                </Box>

                {/* Details Sections */}
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                    gap: 2,
                  }}
                >
                  {/* Family Details */}
                  <DetailSection
                    icon={<Group fontSize="small" />}
                    title="Family"
                    items={[
                      `Father: ${enrollment.fathersName}`,
                      `Mother: ${enrollment.mothersName}`,
                      `Contact: ${formatPhoneNumber(enrollment.contactNo)}`,
                      `Father's Contact: ${formatPhoneNumber(
                        enrollment.fatherMbNo
                      )}`,
                    ]}
                  />

                  {/* School Information */}
                  <DetailSection
                    icon={<School fontSize="small" />}
                    title="Education"
                    items={[
                      enrollment.schoolName,
                      `Course: ${enrollment.course}`,
                      `Class: ${enrollment.clsId?.className}`,
                      `Subject: ${enrollment.subjectId?.subjectName}`,
                    ]}
                  />
                </Box>

                {/* Address Section */}
                <DetailSection
                  icon={<LocationOn fontSize="small" />}
                  title="Address"
                  sx={{ mt: 2 }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: "monospace",
                      p: 1,
                      bgcolor: "action.hover",
                      borderRadius: 1,
                    }}
                  >
                    {enrollment.address}
                  </Typography>
                </DetailSection>

                {/* Enrollment Footer */}
                <Box
                  sx={{
                    mt: 2,
                    pt: 2,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderTop: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Chip
                    label={`Batch ${enrollment.batchYearId?.batchYear}`}
                    color="primary"
                    size="small"
                  />
                  <Typography
                    variant="caption"
                    color="text.disabled"
                    sx={{ fontStyle: "italic" }}
                  >
                    Enrolled{" "}
                    {new Date(enrollment.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog
        open={openManageDialog}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Manage Student Enrollments</DialogTitle>
        <DialogContent>
          <Box sx={{ my: 2 }}>
            <Typography variant="h6">Current Enrollments</Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, my: 2 }}>
              {currentEnrollments.map((enrollment) => (
                <Chip
                  key={enrollment._id}
                  label={`${enrollment.studentName}`}
                  onDelete={() => handleRemoveAccess(enrollment._id)}
                />
              ))}
            </Box>
          </Box>

          <Divider />

          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Add New Enrollments
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Class</InputLabel>
                  <Select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    label="Class"
                  >
                    {classes.map((cls) => (
                      <MenuItem key={cls?._id} value={cls?._id}>
                        {cls?.className}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Subject</InputLabel>
                  <Select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    label="Subject"
                    disabled={!selectedClass}
                  >
                    {subjects.map((subject) => (
                      <MenuItem key={subject._id} value={subject._id}>
                        {subject.subjectName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Batches</InputLabel>
                  <Select
                    multiple
                    value={selectedBatches}
                    onChange={(e) => setSelectedBatches(e.target.value)}
                    renderValue={(selected) => (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {selected.map((batchId) => {
                          const batch = batches.find((b) => b._id === batchId);
                          return (
                            <Chip key={batchId} label={batch?.batchYear} />
                          );
                        })}
                      </Box>
                    )}
                    disabled={!selectedSubject}
                  >
                    {batches.map((batch) => (
                      <MenuItem key={batch._id} value={batch._id}>
                        <Checkbox
                          checked={selectedBatches.includes(batch._id)}
                        />
                        <ListItemText primary={batch.batchYear} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {availableStudents.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1">Select Students</Typography>
                <FormControl fullWidth>
                  <Select
                    multiple
                    value={selectedStudents}
                    onChange={(e) => setSelectedStudents(e.target.value)}
                    renderValue={(selected) => (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {selected.map((studentId) => {
                          const student = availableStudents.find(
                            (s) => s._id === studentId
                          );
                          return (
                            <Chip
                              key={studentId}
                              label={`${student?.studentName}`}
                            />
                          );
                        })}
                      </Box>
                    )}
                  >
                    {availableStudents.map((student) => (
                      <MenuItem key={student?._id} value={student?._id}>
                        <Checkbox
                          checked={selectedStudents.includes(student?._id)}
                        />
                        <ListItemText
                          primary={student?.studentName}
                          secondary={student?.clsId?.className}
                        />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleAddBatches}
            disabled={loading.updating || selectedStudents.length === 0}
          >
            {loading.updating ? <CircularProgress size={24} /> : "Add Students"}
          </Button>
          <Button
            onClick={handleUpdateAccess}
            variant="contained"
            disabled={loading.updating}
          >
            {loading.updating ? <CircularProgress size={24} /> : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          severity={snackbar.severity}
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

export default ParentAccessManagement;
