import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useParams } from "react-router-dom";
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
  FormControlLabel,
  Checkbox,
  Grid,
  IconButton,
  LinearProgress,
  Snackbar,
  Stack,
  TextField,
  Typography,
  Alert,
} from "@mui/material";
import { Add, Edit, Delete, CloudUpload, PictureAsPdf, PlayCircle } from "@mui/icons-material";

const LectureManagement = () => {
  const { courseId } = useParams();
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingLecture, setEditingLecture] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    part: 1,
    isFreeContent: false,
    duration: "",
    videoUrl: "",
    practiceSetTitle: "",
    practiceSetDescription: "",
    thumbnailImg: null,
    practicePdf: null,
  });

  const { getRootProps: getThumbnailProps, getInputProps: getThumbnailInputProps } = useDropzone({
    accept: { "image/*": [".jpeg", ".jpg", ".png"] },
    multiple: false,
    onDrop: (acceptedFiles) => {
      setFormData(prev => ({ ...prev, thumbnailImg: acceptedFiles[0] }));
    },
  });

  const { getRootProps: getPdfProps, getInputProps: getPdfInputProps } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    multiple: false,
    onDrop: (acceptedFiles) => {
      setFormData(prev => ({ ...prev, practicePdf: acceptedFiles[0] }));
    },
  });

  const fetchLectures = async () => {
    try {
      const token = Cookies.get("token");
      const response = await axios.get(
        `https://lmsapp-plvj.onrender.com/admin/course/lecture/getAll/${courseId}`,
        { headers: { "x-admin-token": token } }
      );
      setLectures(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch lectures");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLectures();
  }, [courseId]);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const token = Cookies.get("token");
      const formDataToSend = new FormData();

      // Append basic fields
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("part", formData.part);
      formDataToSend.append("isFreeContent", formData.isFreeContent);
      formDataToSend.append("duration", formData.duration);
      formDataToSend.append("videoUrl", formData.videoUrl);
      formDataToSend.append("practiceSetTitle", formData.practiceSetTitle);
      formDataToSend.append("practiceSetDescription", formData.practiceSetDescription);

      // Handle files
      if (formData.thumbnailImg instanceof File) {
        formDataToSend.append("thumbnailImg", formData.thumbnailImg);
      }
      if (formData.practicePdf instanceof File) {
        formDataToSend.append("practicePdfUpload", formData.practicePdf);
      }

      const url = editingLecture
        ? `https://lmsapp-plvj.onrender.com/admin/course/lecture/update/${editingLecture._id}`
        : `https://lmsapp-plvj.onrender.com/admin/course/lecture/create/${courseId}`;

      const method = editingLecture ? "put" : "post";

      await axios[method](url, formDataToSend, {
        headers: { 
          "x-admin-token": token,
          "Content-Type": "multipart/form-data"
        }
      });

      await fetchLectures();
      handleCloseDialog();
    } catch (err) {
      setError(err.response?.data?.message || "Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (lectureId) => {
    if (window.confirm("Are you sure you want to delete this lecture?")) {
      try {
        const token = Cookies.get("token");
        await axios.delete(
          `https://lmsapp-plvj.onrender.com/admin/course/lecture/delete/${lectureId}`,
          { headers: { "x-admin-token": token } }
        );
        await fetchLectures();
      } catch (err) {
        setError(err.response?.data?.message || "Failed to delete lecture");
      }
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingLecture(null);
    setFormData({
      title: "",
      description: "",
      part: 1,
      isFreeContent: false,
      duration: "",
      videoUrl: "",
      practiceSetTitle: "",
      practiceSetDescription: "",
      thumbnailImg: null,
      practicePdf: null,
    });
  };

  const handleEditClick = (lecture) => {
    setEditingLecture(lecture);
    setFormData({
      title: lecture.title,
      description: lecture.description || "",
      part: lecture.part,
      isFreeContent: lecture.isFreeContent,
      duration: lecture.duration,
      videoUrl: lecture.videoUrl || "",
      practiceSetTitle: lecture.practiceSet?.title || "",
      practiceSetDescription: lecture.practiceSet?.description || "",
      thumbnailImg: lecture.thumbnailImg?.url,
      practicePdf: lecture.practiceSet?.pdf?.url,
    });
    setOpenDialog(true);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">Lecture Management</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenDialog(true)}
        >
          Add Lecture
        </Button>
      </Box>

      {loading ? (
        <LinearProgress />
      ) : (
        <Grid container spacing={3}>
          {lectures.map((lecture) => (
            <Grid item xs={12} sm={6} md={4} key={lecture._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={lecture.thumbnailImg.url}
                  alt={lecture.title}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Stack direction="row" justifyContent="space-between" mb={2}>
                    <Typography variant="h6">{lecture.title}</Typography>
                    <Chip
                      label={`Part ${lecture.part}`}
                      color="primary"
                      size="small"
                    />
                  </Stack>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {lecture.description}
                  </Typography>
                  <Stack spacing={1} mt={2}>
                    <Typography variant="caption">
                      Duration: {lecture.duration}
                    </Typography>
                    <Chip
                      label={lecture.isFreeContent ? "Free" : "Premium"}
                      color={lecture.isFreeContent ? "success" : "secondary"}
                      size="small"
                    />
                    {lecture.practiceSet?.pdf?.url && (
                      <Button
                        variant="outlined"
                        startIcon={<PictureAsPdf />}
                        href={lecture.practiceSet.pdf.url}
                        target="_blank"
                        size="small"
                      >
                        Practice PDF
                      </Button>
                    )}
                  </Stack>
                </CardContent>
                <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                  <Button
                    variant="contained"
                    href={lecture.videoUrl}
                    target="_blank"
                    startIcon={<PlayCircle />}
                  >
                    Watch
                  </Button>
                  <Stack direction="row" spacing={1}>
                    <IconButton onClick={() => handleEditClick(lecture)}>
                      <Edit color="primary" />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(lecture._id)}>
                      <Delete color="error" />
                    </IconButton>
                  </Stack>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingLecture ? "Edit Lecture" : "Create New Lecture"}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                margin="normal"
                multiline
                rows={3}
              />
              <TextField
                fullWidth
                label="Part Number"
                type="number"
                value={formData.part}
                onChange={(e) => setFormData({ ...formData, part: e.target.value })}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Duration (HH:MM:SS)"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Video URL"
                value={formData.videoUrl}
                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                margin="normal"
                required
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.isFreeContent}
                    onChange={(e) => setFormData({ ...formData, isFreeContent: e.target.checked })}
                  />
                }
                label="Free Content"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <div {...getThumbnailProps()} style={dropzoneStyle}>
                <input {...getThumbnailInputProps()} />
                <CloudUpload fontSize="large" color="action" />
                {formData.thumbnailImg ? (
                  typeof formData.thumbnailImg === "string" ? (
                    <img
                      src={formData.thumbnailImg}
                      alt="Thumbnail"
                      style={{ maxWidth: "100%", maxHeight: 200, marginTop: 10 }}
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

              <Typography variant="h6" sx={{ mt: 2 }}>Practice Set</Typography>
              <TextField
                fullWidth
                label="Practice Set Title"
                value={formData.practiceSetTitle}
                onChange={(e) => setFormData({ ...formData, practiceSetTitle: e.target.value })}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Practice Set Description"
                value={formData.practiceSetDescription}
                onChange={(e) => setFormData({ ...formData, practiceSetDescription: e.target.value })}
                margin="normal"
                multiline
                rows={3}
              />
              
              <div {...getPdfProps()} style={dropzoneStyle}>
                <input {...getPdfInputProps()} />
                <CloudUpload fontSize="large" color="action" />
                {formData.practicePdf ? (
                  typeof formData.practicePdf === "string" ? (
                    <Button
                      startIcon={<PictureAsPdf />}
                      href={formData.practicePdf}
                      target="_blank"
                    >
                      View PDF
                    </Button>
                  ) : (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {formData.practicePdf.name}
                    </Typography>
                  )
                ) : (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Drag & drop PDF or click
                  </Typography>
                )}
              </div>
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
            {isSubmitting ? (editingLecture ? "Saving..." : "Creating...") : "Save"}
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

export default LectureManagement;