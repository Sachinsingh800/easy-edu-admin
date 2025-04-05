import React, { useState } from "react";
import {
  Box,
  Button,
  Modal,
  Typography,
  TextField,
  IconButton,
} from "@mui/material";
import { styled } from "@mui/system";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";
import Cookies from "js-cookie";

// Styled components for a polished UI
const StyledModal = styled(Modal)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const ModalContent = styled(Box)(({ theme }) => ({
  width: 400,
  backgroundColor: "#fff",
  borderRadius: "10px",
  boxShadow: theme.shadows[5],
  padding: theme.spacing(4),
  position: "relative",
}));

const CloseButton = styled(IconButton)(({ theme }) => ({
  position: "absolute",
  top: theme.spacing(1),
  right: theme.spacing(1),
}));

const UploadDocxModal = ({ open, handleClose, setUpdate, id, batchId }) => {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    const token = Cookies.get("token");
    e.preventDefault();
    if (!file) {
      alert("Please select a .docx file before submitting.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        `https://lmsapp-plvj.onrender.com/admin/batches/test/subjects/tests/ques/createBulk/${batchId}/${id}`,
        formData,
        {
          headers: {
            "x-admin-token": token,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setUpdate(true);
      alert("File uploaded successfully!");
      console.log(response.data);
      handleClose();
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload file. Please try again.");
    }
  };

  return (
    <div>
      <StyledModal open={open} onClose={handleClose}>
        <ModalContent>
          <CloseButton onClick={handleClose}>
            <CloseIcon />
          </CloseButton>

          <Typography variant="h6" gutterBottom>
            Upload .docx File
          </Typography>

          <form onSubmit={handleSubmit}>
            <TextField
              type="file"
              inputProps={{ accept: ".docx" }}
              onChange={handleFileChange}
              fullWidth
              margin="normal"
            />

            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
              <Button type="submit" variant="contained" color="success">
                Submit
              </Button>
            </Box>
          </form>
        </ModalContent>
      </StyledModal>
    </div>
  );
};

export default UploadDocxModal;
