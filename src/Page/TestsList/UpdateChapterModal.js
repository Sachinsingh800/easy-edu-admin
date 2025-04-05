import React, { useState } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import axios from "axios";
import Cookies from "js-cookie";
import PropTypes from "prop-types";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { xs: 300, sm: 400 },
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

const UpdateChapterModal = ({ open, onClose, chapter, update }) => {
  const [chapterName, setChapterName] = useState(chapter.chapterName || "");
  const [chapterNo, setChapterNo] = useState(chapter.chapterNo || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleUpdate = async () => {
    const token = Cookies.get("token");
    if (!token) {
      setError("Authentication token not found. Please log in.");
      return;
    }

    if (!chapterName || !chapterNo) {
      setError("Please fill out all fields.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.put(
        `https://lmsapp-plvj.onrender.com/admin/directTest/subjects/chapter/update/${chapter._id}`,
        { chapterName, chapterNo },
        {
          headers: {
            "x-admin-token": token,
          },
        }
      );

      if (response.data.status) {
        setChapterName("");
        setChapterNo("");
        update(true);
        handleClose();
      } else {
        setError(response.data.message || "Failed to update chapter.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update chapter.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setChapterName(chapter.chapterName || "");
    setChapterNo(chapter.chapterNo || "");
    setError(null);
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={modalStyle}>
        <Typography variant="h6" gutterBottom>
          Update Chapter
        </Typography>
        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        <TextField
          label="Chapter Name"
          value={chapterName}
          onChange={(e) => setChapterName(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Chapter No"
          type="number"
          value={chapterNo}
          onChange={(e) => setChapterNo(e.target.value)}
          fullWidth
          margin="normal"
        />
        <Box display="flex" justifyContent="flex-end" mt={2}>
          <Button onClick={handleClose} sx={{ mr: 2 }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleUpdate}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Save Changes"}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

UpdateChapterModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  chapter: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    chapterName: PropTypes.string,
    chapterNo: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,
  update: PropTypes.func.isRequired,
};

export default UpdateChapterModal;
