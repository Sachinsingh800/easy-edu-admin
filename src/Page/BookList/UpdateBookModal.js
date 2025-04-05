import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Modal,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import Cookies from "js-cookie";

const UpdateBookModal = ({ open, handleClose, book, setUpdate ,clsId }) => {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [title, setTitle] = useState("");
  const [materialType, setMaterialType] = useState("");
  const [loading, setLoading] = useState(false);

  // Update state when the `book` prop changes
  useEffect(() => {
    if (book) {
      setSelectedSubject(book.subjectName || "");
      setTitle(book.title || "");
      setMaterialType(book.materialType || "");
    }
  }, [book]);

  // Fetch subjects for the dropdown
  useEffect(() => {
    const fetchSubjects = async () => {
      const token = Cookies.get("token");
      try {
        const response = await axios.get(
          `https://lmsapp-plvj.onrender.com/admin/subjects/getAll?clsId=${clsId}`,
          {
            headers: {
              "x-admin-token": token,
            },
          }
        );
        if (response.data.status) {
          setSubjects(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching subjects:", error);
      }
    };
    fetchSubjects();
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSubject || !title || !materialType) {
      alert("Please fill all fields.");
      return;
    }
    const token = Cookies.get("token");
    const payload = { subjectName: selectedSubject, title, materialType };

    setLoading(true);
    try {
      const response = await axios.put(
        `https://lmsapp-plvj.onrender.com/admin/materials/book/update/${book?._id}`,
        payload,
        {
          headers: {
            "x-admin-token": token,
          },
        }
      );
      if (response.data.status) {
        setUpdate((prev) => !prev);
        handleClose();
      } else {
        alert("Failed to update book.");
      }
    } catch (error) {
      console.error("Error updating book:", error);
      alert("An error occurred while updating the book.");
    } finally {
      setLoading(false);
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
          width: 400,
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" gutterBottom>
          Update Book
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
          {/* Subject Dropdown */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="subject-label">Subject</InputLabel>
            <Select
              labelId="subject-label"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              label="Subject"
            >
              {subjects.map((subject) => (
                <MenuItem key={subject._id} value={subject.subjectName}>
                  {subject.subjectName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Title Input */}
          <TextField
            label="Title"
            variant="outlined"
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            sx={{ mb: 2 }}
          />

          {/* Material Type Dropdown */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="material-type-label">Material Type</InputLabel>
            <Select
              labelId="material-type-label"
              value={materialType}
              onChange={(e) => setMaterialType(e.target.value)}
              label="Material Type"
            >
              <MenuItem value="NCRT Books">NCRT Books</MenuItem>
              <MenuItem value="Helping Books">Helping Books</MenuItem>
            </Select>
          </FormControl>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Book"}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default UpdateBookModal;
