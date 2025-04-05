import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  Container,
  Typography,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Chip,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Snackbar,
  MenuItem,
  IconButton,
  Grid,
} from "@mui/material";
import { Search, Add, Edit, Delete, Close } from "@mui/icons-material";
import styles from "./StudentEnrollment.module.css";
import Cookies from "js-cookie";

const StudentEnrollment = () => {
  const { id } = useParams();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [formData, setFormData] = useState({
    studentName: "",
    fathersName: "",
    mothersName: "",
    dob: "",
    gender: "Male",
    address: "",
    contactNo: "",
    fatherMbNo: "",
    schoolName: "",
    course: "",
    profilePic: null,
  });

 const token = Cookies.get("token");
  useEffect(() => {
    fetchStudents();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    if (!formData.studentName.trim()) {
      newErrors.studentName = "Student Name is required";
      isValid = false;
    }
    if (!formData.fathersName.trim()) {
      newErrors.fathersName = "Father's Name is required";
      isValid = false;
    }
    if (!formData.mothersName.trim()) {
      newErrors.mothersName = "Mother's Name is required";
      isValid = false;
    }
    if (!formData.dob) {
      newErrors.dob = "Date of Birth is required";
      isValid = false;
    } else {
      const dobDate = new Date(formData.dob);
      const today = new Date();
      if (dobDate >= today) {
        newErrors.dob = "Date of Birth must be in the past";
        isValid = false;
      }
    }

    if (formData.contactNo && !/^\d{10}$/.test(formData.contactNo)) {
      newErrors.contactNo = "Invalid contact number (10 digits required)";
      isValid = false;
    }

    if (formData.fatherMbNo && !/^\d{10}$/.test(formData.fatherMbNo)) {
      newErrors.fatherMbNo = "Invalid mobile number (10 digits required)";
      isValid = false;
    }

    if (!selectedStudent && !formData.profilePic) {
      newErrors.profilePic = "Profile picture is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value) data.append(key, value);
    });

    try {
      if (selectedStudent) {
        await axios.put(
          `https://lmsapp-plvj.onrender.com/admin/offline/class-subject-year-student/enrollStudent/update/${selectedStudent._id}`,
          data,
          {
            headers: {
              "x-admin-token": token,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        showSnackbar("Student updated successfully", "success");
      } else {
        await axios.post(
          `https://lmsapp-plvj.onrender.com/admin/offline/class-subject-year-student/enrollStudent/create/${id}`,
          data,
          {
            headers: {
              "x-admin-token": token,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        showSnackbar("Student created successfully", "success");
      }
      handleCloseDialog();
      fetchStudents();
    } catch (error) {
      handleError(selectedStudent ? "Update failed" : "Creation failed");
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://lmsapp-plvj.onrender.com/admin/offline/class-subject-year-student/enrollStudent/getAll/${id}`,
        { headers: { "x-admin-token": token } }
      );
      setStudents(response.data.data || []);
    } catch (error) {
      handleError("Failed to fetch students");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };


  
  const handleEditClick = async (student) => {
    setSelectedStudent(student);
    setLoading(true);
    try {
      const response = await axios.get(
        `https://lmsapp-plvj.onrender.com/admin/offline/class-subject-year-student/enrollStudent/get/${student._id}`,
        { headers: { "x-admin-token": token } }
      );
      // Correctly set form data for editing
      setFormData({
        studentName: response.data.data.studentName,
        fathersName: response.data.data.fathersName,
        mothersName: response.data.data.mothersName,
        dob: response.data.data.dob.split("T")[0],
        gender: response.data.data.gender,
        address: response.data.data.address || "",
        contactNo: response.data.data.contactNo || "",
        fatherMbNo: response.data.data.fatherMbNo || "",
        schoolName: response.data.data.schoolName || "",
        course: response.data.data.course || "",
        profilePic: null,
      });
      setOpenDialog(true);
    } catch (error) {
      handleError("Failed to fetch student details");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleDelete = async () => {
    try {
      await axios.delete(
        `https://lmsapp-plvj.onrender.com/admin/offline/class-subject-year-student/enrollStudent/delete/${selectedStudent._id}`,
        { headers: { "x-admin-token": token } }
      );
      setOpenDeleteDialog(false);
      showSnackbar("Student deleted successfully", "success");
      fetchStudents();
    } catch (error) {
      handleError("Delete failed");
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedStudent(null);
    setFormData({
      studentName: "",
      fathersName: "",
      mothersName: "",
      dob: "",
      gender: "Male",
      address: "",
      contactNo: "",
      fatherMbNo: "",
      schoolName: "",
      course: "",
      profilePic: null,
    });
    setErrors({});
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleError = (message) => {
    setLoading(false);
    showSnackbar(message, "error");
  };

  const filteredStudents = students.filter((student) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      student.studentName?.toLowerCase().includes(searchLower) ||
      student.fathersName?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <Container maxWidth="xl" className={styles.container}>
      <div className={styles.header}>
        <Typography variant="h4" component="h1" className={styles.title}>
          Student Enrollment Management
        </Typography>
        <div className={styles.actions}>
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search students..."
            InputProps={{
              startAdornment: <Search fontSize="small" sx={{ mr: 1 }} />,
            }}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpenDialog(true)}
          >
            New Student
          </Button>
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>
          <CircularProgress />
        </div>
      ) : (
        <TableContainer component={Paper} className={styles.tableContainer}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Profile</TableCell>
                <TableCell>Student Name</TableCell>
                <TableCell>Father's Name</TableCell>
                <TableCell>Mother's Name</TableCell>
                <TableCell>Date of Birth</TableCell>
                <TableCell>Gender</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student._id}>
                  <TableCell>
                    <Avatar
                      src={student.profilePic?.url}
                      sx={{ width: 40, height: 40 }}
                    />
                  </TableCell>
                  <TableCell>{student.studentName}</TableCell>
                  <TableCell>{student.fathersName}</TableCell>
                  <TableCell>{student.mothersName}</TableCell>
                  <TableCell>
                    {new Date(student.dob).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={student.gender}
                      color={
                        student.gender === "Male" ? "primary" : "secondary"
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEditClick(student)}>
                      <Edit color="primary" />
                    </IconButton>
                    {/* <IconButton
                      onClick={() => {
                        setSelectedStudent(student);
                        setOpenDeleteDialog(true);
                      }}
                    >
                      <Delete color="error" />
                    </IconButton> */}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedStudent ? "Edit Student" : "New Student"}
        </DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit} className={styles.form}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Student Name"
                  name="studentName"
                  value={formData.studentName}
                  onChange={handleInputChange}
                  error={!!errors.studentName}
                  helperText={errors.studentName}
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Date of Birth"
                  name="dob"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={formData.dob}
                  onChange={handleInputChange}
                  error={!!errors.dob}
                  helperText={errors.dob}
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Father's Name"
                  name="fathersName"
                  value={formData.fathersName}
                  onChange={handleInputChange}
                  error={!!errors.fathersName}
                  helperText={errors.fathersName}
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Mother's Name"
                  name="mothersName"
                  value={formData.mothersName}
                  onChange={handleInputChange}
                  error={!!errors.mothersName}
                  helperText={errors.mothersName}
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  label="Gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  required
                >
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Contact Number"
                  name="contactNo"
                  value={formData.contactNo}
                  onChange={handleInputChange}
                  error={!!errors.contactNo}
                  helperText={errors.contactNo}
                  inputProps={{ pattern: "[0-9]{10}" }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Father's Mobile"
                  name="fatherMbNo"
                  value={formData.fatherMbNo}
                  onChange={handleInputChange}
                  error={!!errors.fatherMbNo}
                  helperText={errors.fatherMbNo}
                  inputProps={{ pattern: "[0-9]{10}" }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  multiline
                  rows={3}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="School Name"
                  name="schoolName"
                  value={formData.schoolName}
                  onChange={handleInputChange}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Course"
                  name="course"
                  value={formData.course}
                  onChange={handleInputChange}
                />
              </Grid>

              <Grid item xs={12}>
                {selectedStudent?.profilePic?.url && (
                  <Avatar
                    src={selectedStudent.profilePic.url}
                    sx={{ width: 64, height: 64, mb: 2 }}
                  />
                )}
                <input
                  accept="image/*"
                  style={{ display: "none" }}
                  id="profile-upload"
                  type="file"
                  name="profilePic"
                  onChange={handleInputChange}
                />
                <label htmlFor="profile-upload">
                  <Button variant="outlined" component="span">
                    Upload Profile Picture
                  </Button>
                </label>
                {formData.profilePic?.name && (
                  <Typography variant="body2" sx={{ ml: 2 }}>
                    {formData.profilePic.name}
                  </Typography>
                )}
                {errors.profilePic && (
                  <Typography color="error" variant="body2">
                    {errors.profilePic}
                  </Typography>
                )}
              </Grid>
            </Grid>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedStudent ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete {selectedStudent?.studentName}?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        message={snackbar.message}
        action={
          <IconButton
            size="small"
            color="inherit"
            onClick={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          >
            <Close fontSize="small" />
          </IconButton>
        }
        sx={{
          backgroundColor:
            snackbar.severity === "error" ? "error.main" : "success.main",
          color: "white",
        }}
      />
    </Container>
  );
};

export default StudentEnrollment;
