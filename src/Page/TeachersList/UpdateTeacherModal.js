import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
  Box,
  Typography,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import axios from "axios";
import Cookies from "js-cookie";

const UpdateTeacherModal = ({ open, onClose, setUpdate, teacher }) => {
  const [formData, setFormData] = useState({
    teacherName: "",
    expertise: "",
    yearOfEx: "",
    pic: null,
  });

  const [loading, setLoading] = useState(false);
  const [subjectsList, setSubjectsList] = useState([]); // List of subjects
  const [subjectsLoading, setSubjectsLoading] = useState(true); // Tracks API loading state

  // Fetch subjects from API
  useEffect(() => {
    const fetchSubjects = async () => {
      const token = Cookies.get("token");
      try {
        const response = await axios.get(
          "https://lmsapp-plvj.onrender.com/admin/subjects/getAll",
          {
            headers: {
              "x-admin-token": token,
            },
          }
        );
        setSubjectsList(response.data.data || []); // Update the subjects list
      } catch (error) {
        console.error("Error fetching subjects:", error);
      } finally {
        setSubjectsLoading(false); // Mark loading as complete
      }
    };

    fetchSubjects();
  }, []);

  // Pre-fill the form when the selected teacher changes
  useEffect(() => {
    if (teacher) {
      setFormData({
        teacherName: teacher.teacherName || "",
        expertise: teacher.expertise || "",
        yearOfEx: teacher.yearOfEx || "",
        pic: teacher.pic ? teacher.pic.url : null, // Use the teacher's existing pic URL
      });
    }
  }, [teacher]);

  // Handle input change
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle file input change
  const handleFileChange = (event) => {
    setFormData({ ...formData, pic: event.target.files[0] });
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    const token = Cookies.get("token");
    const formDataToSend = new FormData();
    formDataToSend.append("teacherName", formData.teacherName);
    formDataToSend.append("expertise", formData.expertise);
    formDataToSend.append("yearOfEx", formData.yearOfEx);
    if (formData.pic) {
      formDataToSend.append("pic", formData.pic);
    }

    try {
      const response = await axios.put(
        `https://lmsapp-plvj.onrender.com/admin/teachers/update/${teacher.id}`,
        formDataToSend,
        {
          headers: {
            "x-admin-token": token,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.status) {
        setUpdate(true); // Trigger re-fetching of the teachers list
        onClose(); // Close the modal
      }
    } catch (error) {
      console.error("Error updating teacher:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Update Teacher</DialogTitle>
      <DialogContent>
        {subjectsLoading ? (
          <CircularProgress />
        ) : (
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            {/* Teacher Name */}
            <TextField
              label="Teacher Name"
              name="teacherName"
              value={formData.teacherName}
              onChange={handleInputChange}
              variant="outlined"
              fullWidth
              required
            />

            {/* Expertise Selection */}
            <FormControl fullWidth required>
              <InputLabel>Expertise</InputLabel>
              <Select
                name="expertise"
                value={formData.expertise}
                onChange={handleInputChange}
              >
                {subjectsList.map((subject) => (
                  <MenuItem key={subject.id} value={subject.subjectName}>
                    {subject.subjectName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Years of Experience */}
            <TextField
              label="Years of Experience"
              name="yearOfEx"
              value={formData.yearOfEx}
              onChange={handleInputChange}
              variant="outlined"
              fullWidth
              type="number"
              required
            />

            {/* Picture Upload */}
            <Button variant="outlined" component="label">
              Upload Picture
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={handleFileChange}
              />
            </Button>
            {formData.pic && (
              <Box>
                <Typography variant="body2">
                  Selected file: {formData.pic.name || "Existing image"}
                </Typography>
                {/* Show existing image if no new file is selected */}
                <img src={formData.pic.name ? URL.createObjectURL(formData.pic) : formData.pic} alt="Teacher" width="100" />
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary" variant="outlined">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          variant="contained"
          disabled={loading || !formData.teacherName || !formData.expertise}
        >
          {loading ? <CircularProgress size={24} /> : "Update"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UpdateTeacherModal;
