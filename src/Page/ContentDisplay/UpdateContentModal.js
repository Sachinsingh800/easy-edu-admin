import React, { useState, useEffect } from "react";
import {
  Modal,
  Box,
  TextField,
  Button,
  Typography,
  Checkbox,
  FormControlLabel,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Cookies from "js-cookie";
import axios from "axios";

const UpdateContentModal = ({ open, handleClose, content }) => {
  const [formData, setFormData] = useState({
    title: "",
    duration: "",
    part: "",
    videoUrl: "",
    isFreeContent: false,
    contentType: "",
    thumbnailImg: null,
    pdf: null,
  });

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const token = Cookies.get("token");

  useEffect(() => {
    setFormData({
      title: content?.title || "",
      duration: content?.duration || "",
      part: content?.part || "",
      videoUrl: content?.videoUrl || "",
      isFreeContent: content?.isFreeContent || false,
      contentType: content?.contentType || "",
      thumbnailImg: null,
      pdf: null,
    });
  }, [content]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]:
        type === "file" ? files[0] : type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value) data.append(key, value);
    });

    try {
      await axios.put(
        `https://lmsapp-plvj.onrender.com/admin/allClass/contents/update/${content._id}`,
        data,
        {
          headers: { "x-admin-token": token },
        }
      );
      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "90%",
          maxWidth: 800,
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
          overflowY: "auto",
          maxHeight: "90vh",
        }}
      >
        <IconButton
          onClick={handleClose}
          sx={{ position: "absolute", top: 8, right: 8 }}
        >
          <CloseIcon />
        </IconButton>

        <Typography
          variant="h5"
          component="h2"
          mb={2}
          sx={{ fontWeight: "bold" }}
        >
          Update Content
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label="Part"
            name="part"
            value={formData.part}
            onChange={handleChange}
            margin="normal"
            required
          />

          <FormControlLabel
            control={
              <Checkbox
                name="isFreeContent"
                checked={formData.isFreeContent}
                onChange={handleChange}
              />
            }
            label="Is Free Content"
          />

          <FormControl fullWidth margin="normal" required>
            <InputLabel id="content-type-label">Content Type</InputLabel>
            <Select
              labelId="content-type-label"
              name="contentType"
              value={formData.contentType}
              onChange={handleChange}
            >
              <MenuItem value="Lecture">Lecture</MenuItem>
              <MenuItem value="Notes">Notes</MenuItem>
              <MenuItem value="DPP PDF">DPP PDF</MenuItem>
            </Select>
          </FormControl>

          {formData.contentType === "Lecture" && (
            <Box mt={2}>
              <TextField
                fullWidth
                label="Video URL"
                name="videoUrl"
                value={formData.videoUrl}
                onChange={handleChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Duration (hh:mm:ss)"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                margin="normal"
                placeholder="hh:mm:ss"
                required
              />
              <Typography variant="body2" mb={1}>
                Thumbnail Image:
              </Typography>
              <TextField
                fullWidth
                type="file"
                name="thumbnailImg"
                onChange={handleChange}
                inputProps={{ accept: "image/*" }}
              />
            </Box>
          )}

          {(formData.contentType === "DPP PDF" ||
            formData.contentType === "Notes") && (
            <Box mt={2}>
              <Typography variant="body2" mb={1}>
                PDF File:
              </Typography>
              <TextField
                fullWidth
                type="file"
                name="pdf"
                onChange={handleChange}
                inputProps={{ accept: "application/pdf" }}
              />
            </Box>
          )}

          {error && (
            <Typography variant="body2" color="error" mb={2}>
              {error}
            </Typography>
          )}

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 3 }}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Updating..." : "Update"}
          </Button>
        </form>
      </Box>
    </Modal>
  );
};

export default UpdateContentModal;
