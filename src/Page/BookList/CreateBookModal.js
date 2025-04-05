import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  MenuItem,
  Select,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Modal,
} from "@mui/material";
import Cookies from "js-cookie";
import { useParams } from "react-router-dom";

const CreateBookModal = ({ open, handleClose, setUpdate,clsId }) => {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [materialType, setMaterialType] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const { id } = useParams();

  // Fetch subjects from API
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
    if (!selectedSubject || !materialType || !title) {
      alert("Please fill all fields.");
      return;
    }

    const token = Cookies.get("token");
    const payload = {
      subject: selectedSubject,
      materialType,
      title,
    };

    setLoading(true);
    try {
      const response = await axios.post(
        `https://lmsapp-plvj.onrender.com/admin/materials/book/create/${id}`,
        payload,
        {
          headers: {
            "x-admin-token": token,
          },
        }
      );
      if (response.data.status) {
        setSelectedSubject("");
        setMaterialType("");
        setTitle("");
        setUpdate((prev) => !prev); // Trigger update in parent component
        handleClose();
      } else {
        alert("Failed to create book.");
      }
    } catch (error) {
      console.error("Error creating book:", error);
      alert("An error occurred while creating the book.");
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
          Create Book
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
                <MenuItem key={subject._id} value={subject._id}>
                  {subject.subjectName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

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

          {/* Title Input */}
          <TextField
            label="Title"
            variant="outlined"
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            sx={{ mb: 2 }}
          />

          {/* Submit Button */}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={loading}
          >
            {loading ? "Submitting..." : "Create Book"}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default CreateBookModal;
