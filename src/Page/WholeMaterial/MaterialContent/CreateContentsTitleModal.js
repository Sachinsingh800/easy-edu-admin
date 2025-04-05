import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Modal,
} from "@mui/material";
import axios from "axios";
import { useParams } from "react-router-dom";
import Cookies from "js-cookie";

const CreateContentsTitleModal = ({ open, handleClose, setUpdate }) => {
  const [title, setTitle] = useState("");
  const [chapterNo, setChapterNo] = useState("");
  const [pdf, setPdf] = useState(null);
  const [loading, setLoading] = useState(false);
  const token = Cookies.get("token");
  const { id } = useParams();

  const handleFileChange = (event) => {
    setPdf(event.target.files[0]);
  };

  const handleCreateContent = async () => {
    if (!title.trim() || !chapterNo.trim() || !pdf) {
      alert("All fields are required!");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("chapterNo", chapterNo);
    formData.append("pdf", pdf);

    setLoading(true);
    try {
      const response = await axios.post(
        `https://lmsapp-plvj.onrender.com/admin/materials/title/subjects/content/createContent/${id}`,
        formData,
        {
          headers: {
            "x-admin-token": token,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.status) {
        setUpdate((prev) => !prev); // Trigger a refresh
        handleClose(); // Close the modal
      } else {
        alert(`Error: ${response.data.message}`);
      }
    } catch (error) {
      console.error("Error creating content:", error);
      alert("An error occurred while creating the content. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="create-content-modal"
      aria-describedby="create-content-modal-description"
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
        }}
      >
        <Typography id="create-content-modal" variant="h6" gutterBottom>
          Create New Content
        </Typography>
        <TextField
          fullWidth
          label="Title"
          variant="outlined"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Chapter No"
          variant="outlined"
          value={chapterNo}
          onChange={(e) => setChapterNo(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Button
          variant="outlined"
          component="label"
          sx={{ mb: 2, textAlign: "left" }}
        >
          Upload PDF
          <input
            type="file"
            hidden
            accept="application/pdf"
            onChange={handleFileChange}
          />
        </Button>
        {pdf && (
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Selected File: {pdf.name}
          </Typography>
        )}
        <Box display="flex" justifyContent="flex-end" gap={2}>
          <Button onClick={handleClose} variant="outlined" color="secondary">
            Cancel
          </Button>
          <Button
            onClick={handleCreateContent}
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create"}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default CreateContentsTitleModal;
