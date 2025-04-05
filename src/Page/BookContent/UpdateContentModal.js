import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Typography,
  Button,
  Modal,
  Backdrop,
  Fade,
  MenuItem,
} from "@mui/material";
import axios from "axios";
import Cookies from "js-cookie";
import { useParams } from "react-router-dom";

const UpdateContentModal = ({ open, onClose, selectedContent, setUpdate }) => {
  const [updatedContent, setUpdatedContent] = useState({
    title: "",
    pdf: null,
    medium: "",
    chapter: "",
  });
  const [pdfName, setPdfName] = useState(""); // State to store PDF file name
  const { id } = useParams();

  // Set initial values when selectedContent changes
  useEffect(() => {
    if (selectedContent) {
      setUpdatedContent({
        title: selectedContent.title || "",
        medium: selectedContent.medium || "",
        chapter: selectedContent.chapter || "",
        pdf: null, // PDF will not be pre-loaded
      });
      setPdfName(""); // Reset PDF name
    }
  }, [selectedContent]);

  // Handle form submission for updating content
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const token = Cookies.get("token");

    const formData = new FormData();
    formData.append("title", updatedContent.title);
    // Only append the PDF if the user uploaded a new one
    if (updatedContent.pdf) {
      formData.append("pdf", updatedContent.pdf);
    }
    formData.append("medium", updatedContent.medium);
    formData.append("chapter", updatedContent.chapter);

    try {
      const response = await axios.put(
        `https://lmsapp-plvj.onrender.com/admin/materials/book/content/update/${id}/${selectedContent.id} `,
        formData,
        {
          headers: {
            "x-admin-token": token,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (response.data.status) {
        setUpdate(true);
        onClose();
      }
    } catch (error) {
      console.error("Error updating content:", error);
    }
  };

  // Handle PDF file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setUpdatedContent({ ...updatedContent, pdf: file });
    setPdfName(file ? file.name : "");
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
      }}
    >
      <Fade in={open}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Update Content
          </Typography>
          <form onSubmit={handleFormSubmit}>
            {/* Title Input */}
            <TextField
              label="Title"
              variant="outlined"
              fullWidth
              required
              sx={{ mb: 2 }}
              value={updatedContent.title}
              onChange={(e) =>
                setUpdatedContent({ ...updatedContent, title: e.target.value })
              }
            />

            {/* Medium Dropdown */}
            <TextField
              label="Medium"
              variant="outlined"
              fullWidth
              required
              sx={{ mb: 2 }}
              value={updatedContent.medium}
              onChange={(e) =>
                setUpdatedContent({ ...updatedContent, medium: e.target.value })
              }
              select
            >
              <MenuItem value="Hindi">Hindi</MenuItem>
              <MenuItem value="English">English</MenuItem>
            </TextField>

            {/* Chapter Input */}
            <TextField
              label="Chapter"
              variant="outlined"
              fullWidth
              required
              sx={{ mb: 2 }}
              value={updatedContent.chapter}
              onChange={(e) =>
                setUpdatedContent({ ...updatedContent, chapter: e.target.value })
              }
            />

            {/* PDF Upload */}
            <Button
              variant="contained"
              component="label"
              fullWidth
              sx={{ mb: 2 }}
            >
              Upload New PDF (Optional)
              <input
                type="file"
                hidden
                accept=".pdf"
                onChange={handleFileChange}
              />
            </Button>
            {pdfName && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 2, wordBreak: "break-word" }}
              >
                Selected File: {pdfName}
              </Typography>
            )}

            {/* Submit Button */}
            <Button
              variant="contained"
              color="primary"
              type="submit"
              fullWidth
            >
              Update Content
            </Button>
          </form>
        </Box>
      </Fade>
    </Modal>
  );
};

export default UpdateContentModal;
