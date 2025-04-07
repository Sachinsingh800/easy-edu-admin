import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate, useParams } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import {
  Box,
  Button,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  LinearProgress,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  TextField,
  Typography,
  Alert,
  Checkbox,
} from "@mui/material";
import { Add, Edit, Delete, CloudUpload } from "@mui/icons-material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { styled } from "@mui/material/styles";

const CourseManagement = () => {
  const { catId } = useParams();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [prerequisites, setPrerequisites] = useState([""]);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    courseCode: "",
    language: "",
    isFree: false,
    price: 0,
    mrp: 0,
    status: "draft",
    thumbnailImg: null,
  });

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "image/*": [".jpeg", ".jpg", ".png"] },
    multiple: false,
    onDrop: (acceptedFiles) => {
      setFormData((prev) => ({ ...prev, thumbnailImg: acceptedFiles[0] }));
    },
  });

  const fetchCourses = async () => {
    try {
      const token = Cookies.get("token");
      const response = await axios.get(
        `https://lmsapp-plvj.onrender.com/admin/course/getAll?catId=${catId}`,
        { headers: { "x-admin-token": token } }
      );
      setCourses(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [catId]);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const token = Cookies.get("token");
      const formDataToSend = new FormData();

      // Append basic fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== "thumbnailImg") formDataToSend.append(key, value);
      });

      // Append array fields
      prerequisites.forEach((preq, index) => {
        formDataToSend.append(`prerequisites[${index}]`, preq);
      });

      // Append files
      if (formData.thumbnailImg instanceof File) {
        formDataToSend.append("thumbnailImg", formData.thumbnailImg);
      }

      const url = editingCourse
        ? `https://lmsapp-plvj.onrender.com/admin/course/update/${editingCourse._id}`
        : `https://lmsapp-plvj.onrender.com/admin/course/create/${catId}`;

      const method = editingCourse ? "put" : "post";

      await axios[method](url, formDataToSend, {
        headers: {
          "x-admin-token": token,
          "Content-Type": "multipart/form-data",
        },
      });

      await fetchCourses();
      handleCloseDialog();
    } catch (err) {
      setError(err.response?.data?.message || "Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (courseId) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      try {
        const token = Cookies.get("token");
        await axios.delete(
          `https://lmsapp-plvj.onrender.com/admin/course/delete/${courseId}`,
          { headers: { "x-admin-token": token } }
        );
        await fetchCourses();
      } catch (err) {
        setError(err.response?.data?.message || "Failed to delete course");
      }
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCourse(null);
    setFormData({
      title: "",
      description: "",
      courseCode: "",
      language: "",
      isFree: false,
      price: 0,
      mrp: 0,
      status: "draft",
      thumbnailImg: null,
    });
    setPrerequisites([""]);
  };

  const handleEditClick = (course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      description: course.description,
      courseCode: course.courseCode,
      language: course.language,
      isFree: course.isFree,
      price: course.price || 0,
      mrp: course.mrp || 0,
      status: course.status,
      thumbnailImg: course.thumbnailImg?.url,
    });
    setPrerequisites(course.prerequisites || [""]);
    setOpenDialog(true);
  };

  const addPrerequisite = () => {
    setPrerequisites([...prerequisites, ""]);
  };

  const updatePrerequisite = (index, value) => {
    const newPreqs = [...prerequisites];
    newPreqs[index] = value;
    setPrerequisites(newPreqs);
  };

  const BackButton = styled(IconButton)(({ theme }) => ({
    marginRight: theme.spacing(2),
    color: theme.palette.primary.main,
  }));

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <BackButton aria-label="back" onClick={() => navigate(-1)}>
          <ArrowBackIcon />
        </BackButton>
        <Typography variant="h4">Course Management</Typography>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenDialog(true)}
        >
          Add Course
        </Button>
      </Box>

      {loading ? (
        <LinearProgress />
      ) : (
        <Grid container spacing={3}>
          {courses.map((course) => (
            <Grid item xs={12} sm={6} md={4} key={course._id}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  cursor:"pointer"
                }}
                onClick={() => {
                    navigate(`/dashboard/lecture-management/${course._id}`);
                  }}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={course.thumbnailImg.url}
                  alt={course.title}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Stack direction="row" justifyContent="space-between" mb={2}>
                    <Typography variant="h6">{course.title}</Typography>
                    <Chip
                      label={course.isFree ? "FREE" : `₹${course.price}`}
                      color={course.isFree ? "success" : "primary"}
                    />
                  </Stack>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    {course.description}
                  </Typography>
                  <Stack spacing={1} mt={2}>
                    <Typography variant="caption">
                      Code: {course.courseCode}
                    </Typography>
                    <Typography variant="caption">
                      Language: {course.language}
                    </Typography>
                    <Typography variant="caption">
                      Status: {course.status}
                    </Typography>
                  </Stack>
                </CardContent>
                <CardActions sx={{ justifyContent: "space-between", p: 2 }}>
                  <Stack direction="row" spacing={1}>
                    <IconButton onClick={() => handleEditClick(course)}>
                      <Edit color="primary" />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(course._id)}>
                      <Delete color="error" />
                    </IconButton>
                  </Stack>
                  <Chip
                    label={`${course.discount}% off`}
                    color="secondary"
                    size="small"
                  />
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingCourse ? "Edit Course" : "Create New Course"}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Title"
                name="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                margin="normal"
                multiline
                rows={4}
                required
              />
              <TextField
                fullWidth
                label="Course Code"
                name="courseCode"
                value={formData.courseCode}
                onChange={(e) =>
                  setFormData({ ...formData, courseCode: e.target.value })
                }
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Language"
                name="language"
                value={formData.language}
                onChange={(e) =>
                  setFormData({ ...formData, language: e.target.value })
                }
                margin="normal"
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <div {...getRootProps()} style={dropzoneStyle}>
                <input {...getInputProps()} />
                <CloudUpload fontSize="large" color="action" />
                {formData.thumbnailImg ? (
                  typeof formData.thumbnailImg === "string" ? (
                    <img
                      src={formData.thumbnailImg}
                      alt="Thumbnail"
                      style={{
                        maxWidth: "100%",
                        maxHeight: 200,
                        marginTop: 10,
                      }}
                    />
                  ) : (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {formData.thumbnailImg.name}
                    </Typography>
                  )
                ) : (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Drag & drop thumbnail or click
                  </Typography>
                )}
              </div>

              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.isFree}
                    onChange={(e) =>
                      setFormData({ ...formData, isFree: e.target.checked })
                    }
                  />
                }
                label="Free Course"
                sx={{ mt: 2 }}
              />

              {!formData.isFree && (
                <>
                  <TextField
                    fullWidth
                    label="Price"
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    margin="normal"
                  />
                  <TextField
                    fullWidth
                    label="MRP"
                    type="number"
                    name="mrp"
                    value={formData.mrp}
                    onChange={(e) =>
                      setFormData({ ...formData, mrp: e.target.value })
                    }
                    margin="normal"
                  />
                </>
              )}

              <FormControl fullWidth margin="normal">
                <Select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                >
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="published">Published</MenuItem>
                </Select>
              </FormControl>

              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2">Prerequisites</Typography>
                {prerequisites.map((preq, index) => (
                  <TextField
                    key={index}
                    fullWidth
                    value={preq}
                    onChange={(e) => updatePrerequisite(index, e.target.value)}
                    margin="normal"
                    label={`Prerequisite ${index + 1}`}
                  />
                ))}
                <Button onClick={addPrerequisite} sx={{ mt: 1 }}>
                  Add Prerequisite
                </Button>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={isSubmitting}
            startIcon={isSubmitting && <CircularProgress size={20} />}
          >
            {isSubmitting
              ? editingCourse
                ? "Saving..."
                : "Creating..."
              : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="error">{error}</Alert>
      </Snackbar>
    </Box>
  );
};

const dropzoneStyle = {
  border: "2px dashed #ddd",
  borderRadius: 2,
  padding: 3,
  textAlign: "center",
  margin: "16px 0",
  cursor: "pointer",
  transition: "border-color 0.3s",
  "&:hover": {
    borderColor: "#1976d2",
  },
};

export default CourseManagement;
