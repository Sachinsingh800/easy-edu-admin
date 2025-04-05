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
  Select,
  MenuItem,
} from "@mui/material";
import axios from "axios";
import Cookies from "js-cookie";

const UpdateSubjectModal = ({ open, onClose, setUpdate, subject }) => {
  const [formData, setFormData] = useState({
    subjectName: "",
    icon: null,
  });
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [loading, setLoading] = useState(false);
  const [classesLoading, setClassesLoading] = useState(false);
  const [classesError, setClassesError] = useState(null);

  useEffect(() => {
    const fetchClassesAndPrefill = async () => {
      const token = Cookies.get("token");
      try {
        setClassesLoading(true);
        
        // Fetch classes
        const response = await axios.get(
          "https://lmsapp-plvj.onrender.com/admin/classes/getAll",
          {
            headers: {
              "x-admin-token": token,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data.status) {
          setClasses(response.data.data);
          setClassesError(null);
          
          // Pre-fill form when subject exists
          if (subject) {
            setFormData({
              subjectName: subject.subjectName || "",
              icon: null,
            });
            setSelectedClassId(subject.clsId?._id || "");
          }
        }
      } catch (err) {
        setClassesError(err.response?.data?.message || "Failed to fetch classes");
      } finally {
        setClassesLoading(false);
      }
    };

    if (open) fetchClassesAndPrefill();
  }, [open, subject]);

  const handleInputChange = (event) => {
    setFormData(prev => ({
      ...prev,
      [event.target.name]: event.target.value
    }));
  };

  const handleFileChange = (event) => {
    setFormData(prev => ({
      ...prev,
      icon: event.target.files[0]
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!subject?._id) return;

    setLoading(true);
    const token = Cookies.get("token");
    const formDataToSend = new FormData();
    
    formDataToSend.append("subjectName", formData.subjectName);
    formDataToSend.append("clsId", selectedClassId);
    if (formData.icon) formDataToSend.append("icon", formData.icon);

    try {
      const response = await axios.put(
        `https://lmsapp-plvj.onrender.com/admin/subjects/update/${subject._id}`,
        formDataToSend,
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
      console.error("Update error:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Update Subject</DialogTitle>
      <DialogContent>
        <Box component="form" sx={{ mt: 2 }}>
          {/* Class Selection */}
          <Box mb={3}>
            <Typography variant="subtitle1" gutterBottom>
              Select Class
            </Typography>
            {classesLoading ? (
              <CircularProgress size={24} />
            ) : classesError ? (
              <Typography color="error">{classesError}</Typography>
            ) : (
              <Select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                fullWidth
                variant="outlined"
                required
              >
                <MenuItem value="" disabled>
                  Select a Class
                </MenuItem>
                {classes.map((cls) => (
                  <MenuItem key={cls._id} value={cls._id}>
                    {cls.clsName} 
                  </MenuItem>
                ))}
              </Select>
            )}
          </Box>

          {/* Subject Name */}
          <TextField
            label="Subject Name"
            name="subjectName"
            value={formData.subjectName}
            onChange={handleInputChange}
            fullWidth
            required
            variant="outlined"
            margin="normal"
          />

          {/* Icon Upload */}
          <Box mt={2}>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="icon-upload"
              type="file"
              onChange={handleFileChange}
            />
            <label htmlFor="icon-upload">
              <Button 
                variant="outlined" 
                component="span"
                fullWidth
              >
                {formData.icon?.name || "Upload New Icon"}
              </Button>
            </label>
            {formData.icon && (
              <Typography variant="caption" color="textSecondary">
                Selected file: {formData.icon.name}
              </Typography>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          variant="contained"
          disabled={loading || classesLoading}
        >
          {loading ? <CircularProgress size={24} /> : "Update Subject"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UpdateSubjectModal;