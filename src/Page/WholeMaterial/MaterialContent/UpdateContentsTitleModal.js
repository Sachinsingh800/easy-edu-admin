import React, { useEffect, useState } from "react";
import { Box, Typography, TextField, Button, Modal } from "@mui/material";
import axios from "axios";
import { useParams } from "react-router-dom";
import Cookies from "js-cookie";

const UpdateContentTitleModal = ({
  open,
  handleClose,
  setUpdate,
  selectedContent,
}) => {
  // States to manage form inputs
  const [title, setTitle] = useState("");
  const [chapterNo, setChapterNo] = useState("");
  const [pdf, setPdf] = useState(null); // To hold the uploaded file
  const [loading, setLoading] = useState(false); // To manage the loading state

  useEffect(()=>{
    setTitle(selectedContent?.title)
    setChapterNo(selectedContent?.chapterNo)
  },[selectedContent])

  // Token for authentication
  const token = Cookies.get("token");
  const { id } = useParams(); // Extract the subject ID from the URL

  // Function to handle file selection
  const handleFileChange = (event) => {
    setPdf(event.target.files[0]);
  };

  // Function to update content
  const handleUpdateContent = async () => {
    // Ensure both title and chapterNo are strings before trimming
    if (!title?.trim() || !String(chapterNo)?.trim()) {
      alert("Title and Chapter No are required!");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("chapterNo", chapterNo);
    if (pdf) {
      formData.append("pdf", pdf);
    }

    setLoading(true); // Start the loading spinner

    try {
      // Make the API request to update the content
      const response = await axios.put(
        `https://lmsapp-plvj.onrender.com/admin/materials/title/subjects/content/updateContent/${id}/${selectedContent?._id}`,
        formData,
        {
          headers: {
            "x-admin-token": token,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.status) {
        setUpdate((prev) => !prev); // Refresh the content list
        handleClose(); // Close the modal
      } else {
        alert(`Error: ${response.data.message}`);
      }
    } catch (error) {
      console.error("Error updating content:", error);
      alert("An error occurred while updating the content. Please try again.");
    } finally {
      setLoading(false); // Stop the loading spinner
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="update-content-modal"
      aria-describedby="update-content-modal-description"
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
        <Typography id="update-content-modal" variant="h6" gutterBottom>
          Update Content
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
        {pdf ? (
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Selected File: {pdf.name}
          </Typography>
        ) : (
          selectedContent?.pdf?.url && (
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Current File:{" "}
              <a
                href={selectedContent.pdf.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                View PDF
              </a>
            </Typography>
          )
        )}
        <Box display="flex" justifyContent="flex-end" gap={2}>
          <Button onClick={handleClose} variant="outlined" color="secondary">
            Cancel
          </Button>
          <Button
            onClick={handleUpdateContent}
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? "Updating..." : "Update"}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default UpdateContentTitleModal;
