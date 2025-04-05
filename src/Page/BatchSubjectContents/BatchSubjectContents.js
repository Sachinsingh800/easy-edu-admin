import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useParams } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import {
  LinearProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Checkbox,
  Snackbar,
  Alert,
  Typography,
  CircularProgress,
  Link,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Chip,
  IconButton,
  Stack,
} from "@mui/material";
import { Add, Edit, CloudUpload, PlayCircle, PictureAsPdf } from "@mui/icons-material";

const BatchSubjectContents = () => {
  const { batchId, subjectId } = useParams();
  const [contents, setContents] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingContent, setEditingContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    part: 1,
    duration: "",
    videoUrl: "",
    isFreeContent: false,
    thumbnailImg: null,
    practiceSetTitle: "",
    practiceSetDescription: "",
    practicePdf: null,
  });

  const fetchContents = async () => {
    try {
      const token = Cookies.get("token");
      const response = await axios.get(
        `https://lmsapp-plvj.onrender.com/admin/batch/subjects/contents/getAll/${subjectId}`,
        { headers: { "x-admin-token": token } }
      );
      setContents(response.data.data);
    } catch (err) {
      setError("Failed to fetch contents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContents();
  }, [batchId, subjectId]);

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "image/*": [".jpeg", ".jpg", ".png"] },
    multiple: false,
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        setFormData(prev => ({ ...prev, thumbnailImg: file }));
      }
    },
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, practicePdf: file }));
    }
  };

  const handleSubmit = async () => {
    try {
      setIsUploading(true);
      const token = Cookies.get("token");
      const formDataToSend = new FormData();

      // Append basic fields
      formDataToSend.append("title", formData.title);
      formDataToSend.append("part", formData.part);
      formDataToSend.append("duration", formData.duration);
      formDataToSend.append("videoUrl", formData.videoUrl);
      formDataToSend.append("isFreeContent", formData.isFreeContent);
      formDataToSend.append("practiceSetTitle", formData.practiceSetTitle);
      formDataToSend.append("practiceSetDescription", formData.practiceSetDescription);

      // Handle files
      if (formData.thumbnailImg instanceof File) {
        formDataToSend.append("thumbnailImg", formData.thumbnailImg);
      }
      if (formData.practicePdf instanceof File) {
        formDataToSend.append("practicePdfUpload", formData.practicePdf);
      }

      const url = editingContent
        ? `https://lmsapp-plvj.onrender.com/admin/batch/subjects/contents/update/${editingContent._id}`
        : `https://lmsapp-plvj.onrender.com/admin/batch/subjects/contents/create/${batchId}/${subjectId}`;

      const method = editingContent ? "put" : "post";

      await axios[method](url, formDataToSend, {
        headers: { 
          "x-admin-token": token,
          "Content-Type": "multipart/form-data"
        }
      });

      await fetchContents();
      handleCloseDialog();
    } catch (err) {
      setError(err.response?.data?.message || "Operation failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingContent(null);
    setFormData({
      title: "",
      part: 1,
      duration: "",
      videoUrl: "",
      isFreeContent: false,
      thumbnailImg: null,
      practiceSetTitle: "",
      practiceSetDescription: "",
      practicePdf: null,
    });
  };

  const ContentCard = ({ content }) => (
    <Card sx={{ height: '100%', width:"100%", display: 'flex', flexDirection: 'column', boxShadow: 3 }}>
      <CardMedia
        component="img"
        height="200"
        image={content.thumbnailImg.url}
        alt={content.title}
        sx={{ objectFit: 'cover' }}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" component="div">
            {content.title}
          </Typography>
          <Chip 
            label={`Part ${content.part}`} 
            color="primary" 
            size="small"
          />
        </Stack>
        
        <Stack spacing={1} mb={2}>
          <Typography variant="body2" color="text.secondary">
            Duration: {content.duration}
          </Typography>
          <Chip
            label={content.isFreeContent ? "Free Content" : "Premium Content"}
            color={content.isFreeContent ? "success" : "secondary"}
            size="small"
          />
        </Stack>

        {content.practiceSet && (
          <div>
            <Typography variant="subtitle2" gutterBottom>
              Practice Set:
            </Typography>
            <Typography variant="body2" gutterBottom>
              {content.practiceSet.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {content.practiceSet.description}
            </Typography>
            {content.practiceSet.pdf?.url && (
              <Button
                variant="outlined"
                startIcon={<PictureAsPdf />}
                component="a"
                href={content.practiceSet.pdf.url}
                target="_blank"
                size="small"
              >
                Download PDF
              </Button>
            )}
          </div>
        )}
      </CardContent>
      <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
        <Button
          variant="contained"
          startIcon={<PlayCircle />}
          component="a"
          href={content.videoUrl}
          target="_blank"
          size="small"
        >
          Watch Video
        </Button>
        <IconButton 
          aria-label="edit"
          onClick={() => {
            setEditingContent(content);
            setFormData({
              title: content.title,
              part: content.part,
              duration: content.duration,
              videoUrl: content.videoUrl,
              isFreeContent: content.isFreeContent,
              thumbnailImg: content.thumbnailImg?.url,
              practiceSetTitle: content.practiceSet?.title,
              practiceSetDescription: content.practiceSet?.description,
              practicePdf: content.practiceSet?.pdf?.url,
            });
            setOpenDialog(true);
          }}
        >
          <Edit />
        </IconButton>
      </CardActions>
    </Card>
  );

  return (
    <div style={{ padding: 20 }}>
      <Button
        variant="contained"
        startIcon={<Add />}
        onClick={() => setOpenDialog(true)}
        sx={{ mb: 3 }}
      >
        Add Content
      </Button>

      {loading ? (
        <LinearProgress />
      ) : (
        <Grid container spacing={3}>
          {contents.map((content) => (
            <Grid item key={content._id} xs={12} sm={6} md={4} lg={3}>
              <ContentCard content={content} />
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ borderBottom: '1px solid #eee', pb: 2 }}>
          {editingContent ? "Edit Content" : "Create New Content"}
        </DialogTitle>
        <DialogContent dividers sx={{ pt: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Title"
                fullWidth
                margin="normal"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
              
              <TextField
                label="Part"
                type="number"
                fullWidth
                margin="normal"
                value={formData.part}
                onChange={(e) => setFormData({ ...formData, part: e.target.value })}
              />

              <TextField
                label="Duration (HH:MM:SS)"
                fullWidth
                margin="normal"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              />

              <TextField
                label="Video URL"
                fullWidth
                margin="normal"
                value={formData.videoUrl}
                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.isFreeContent}
                    onChange={(e) => setFormData({ ...formData, isFreeContent: e.target.checked })}
                  />
                }
                label="Free Content"
                sx={{ mt: 1 }}
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

              <TextField
                label="Practice Set Title"
                fullWidth
                margin="normal"
                value={formData.practiceSetTitle}
                onChange={(e) => setFormData({ ...formData, practiceSetTitle: e.target.value })}
              />

              <TextField
                label="Practice Set Description"
                fullWidth
                margin="normal"
                multiline
                rows={3}
                value={formData.practiceSetDescription}
                onChange={(e) => setFormData({ ...formData, practiceSetDescription: e.target.value })}
              />

              <div style={{ margin: "16px 0" }}>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  id="pdf-upload"
                  style={{ display: "none" }}
                />
                <label htmlFor="pdf-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<PictureAsPdf />}
                    fullWidth
                  >
                    Upload Practice PDF
                  </Button>
                </label>
                {formData.practicePdf && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {typeof formData.practicePdf === "string" ? (
                      <Link href={formData.practicePdf} target="_blank" rel="noopener">
                        View existing PDF
                      </Link>
                    ) : (
                      `Selected PDF: ${formData.practicePdf.name}`
                    )}
                  </Typography>
                )}
              </div>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid #eee', p: 2 }}>
          <Button onClick={handleCloseDialog} variant="outlined">Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            disabled={isUploading}
            startIcon={isUploading ? <CircularProgress size={20} /> : null}
          >
            {editingContent ? "Update Content" : "Create Content"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="error" sx={{ width: '100%' }}>{error}</Alert>
      </Snackbar>
    </div>
  );
};

const dropzoneStyle = {
  border: "2px dashed #ddd",
  borderRadius: 2,
  padding: 3,
  textAlign: "center",
  margin: "16px 0",
  cursor: "pointer",
  transition: 'border-color 0.3s',
  '&:hover': {
    borderColor: '#1976d2',
  }
};

export default BatchSubjectContents;