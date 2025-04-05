import React, { useState, useEffect } from "react";
import {
  Modal,
  Backdrop,
  Fade,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Select,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import Cookies from "js-cookie";
import axios from "axios";
import styles from "./CreateSubjectModal.module.css";

const CreateSubjectModal = ({ open, onClose, setUpdate }) => {
  const [newSubject, setNewSubject] = useState({ subjectName: "" });
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [iconFile, setIconFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [classesLoading, setClassesLoading] = useState(false);
  const [classesError, setClassesError] = useState(null);

  // Fetch classes when modal opens
  useEffect(() => {
    const fetchClasses = async () => {
      const token = Cookies.get("token");
      try {
        setClassesLoading(true);
        const response = await axios.get(
          "https://lmsapp-plvj.onrender.com/admin/classes/getAll",
          {
            headers: {
              "x-admin-token": token,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (response.data.status) {
          setClasses(response.data.data);
          setClassesError(null);
        } else {
          setClassesError(response.data.message || "Failed to fetch classes");
        }
      } catch (err) {
        setClassesError(
          err.response?.data?.message || "Failed to fetch classes"
        );
      } finally {
        setClassesLoading(false);
      }
    };

    if (open) {
      fetchClasses();
      setSelectedClassId(""); // Reset selection when modal reopens
    }
  }, [open]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSubject({ ...newSubject, [name]: value });
  };

  const handleFileChange = (e) => {
    setIconFile(e.target.files[0]);
  };

  const handleCreateSubject = async () => {
    const token = Cookies.get("token");

    if (!token) {
      alert("Authentication token not found. Please log in.");
      return;
    }

    if (!selectedClassId || !newSubject.subjectName || !iconFile) {
      alert("Please select a class, fill in all fields, and upload an icon.");
      return;
    }

    const formData = new FormData();
    formData.append("subjectName", newSubject.subjectName);
    formData.append("icon", iconFile);

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `https://lmsapp-plvj.onrender.com/admin/subjects/create/${selectedClassId}`,
        formData,
        {
          headers: {
            "x-admin-token": token,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setNewSubject({ subjectName: "" });
      setIconFile(null);
      setUpdate(true);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
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
        <Box className={styles.modal}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h5" gutterBottom>
              Create New Subject
            </Typography>
            <IconButton onClick={onClose}>
              <Close />
            </IconButton>
          </Box>

          {/* Class Selection */}
          {classesLoading ? (
            <Box display="flex" justifyContent="center" my={2}>
              <CircularProgress size={24} />
            </Box>
          ) : classesError ? (
            <Typography color="error" variant="body2" gutterBottom>
              {classesError}
            </Typography>
          ) : (
            <Select
              fullWidth
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              displayEmpty
              required
              margin="dense"
              sx={{ mt: 1 }}
            >
              <MenuItem value="" disabled>
                Select Class
              </MenuItem>
              {classes.map((cls) => (
                <MenuItem key={cls._id} value={cls._id}>
                  {cls.clsName}
                </MenuItem>
              ))}
            </Select>
          )}

          <TextField
            fullWidth
            margin="normal"
            label="Subject Name"
            name="subjectName"
            value={newSubject.subjectName}
            onChange={handleInputChange}
          />

          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ margin: "16px 0" }}
          />

          {error && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}

          <Button
            variant="contained"
            color="primary"
            onClick={handleCreateSubject}
            fullWidth
            disabled={loading || classesLoading}
            className={styles.createButton}
          >
            {loading ? <CircularProgress size={24} /> : "Create Subject"}
          </Button>
        </Box>
      </Fade>
    </Modal>
  );
};

export default CreateSubjectModal;
