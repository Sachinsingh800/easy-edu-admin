import React, { useState } from "react";
import { Box, Typography, TextField, Button, Modal, Checkbox, FormControlLabel } from "@mui/material";
import axios from "axios";
import Cookies from "js-cookie";
import { useParams } from "react-router-dom";

const CreateTitleModal = ({ open, handleClose, setUpdate }) => {
  const [title, setTitle] = useState("");
  const [isFree, setIsFree] = useState(false);
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const token = Cookies.get("token");
  const { id } = useParams();

  const handleCreateTitle = async () => {
    if (!title.trim()) {
      alert("Title cannot be empty!");
      return;
    }

    if (!isFree && (!price || isNaN(price) || Number(price) < 0)) {
      alert("Please enter a valid price!");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `https://lmsapp-plvj.onrender.com/admin/materials/title/subjects/content/createTitle/${id}`,
        { title, isFree, price: isFree ? 0 : Number(price) },
        {
          headers: { "x-admin-token": token },
        }
      );

      if (response.data.status) {
        setUpdate((prev) => !prev);
        handleClose();
      } else {
        alert(`Error: ${response.data.message}`);
      }
    } catch (error) {
      console.error("Error creating title:", error);
      alert("An error occurred while creating the title. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="create-title-modal"
      aria-describedby="create-title-modal-description"
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
        <Typography id="create-title-modal" variant="h6" gutterBottom>
          Create New Title
        </Typography>
        <TextField
          fullWidth
          label="Title"
          variant="outlined"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          sx={{ mb: 2 }}
        />
        <FormControlLabel
          control={<Checkbox checked={isFree} onChange={(e) => setIsFree(e.target.checked)} />}
          label="Is Free"
        />
        {!isFree && (
          <TextField
            fullWidth
            label="Price"
            type="number"
            variant="outlined"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            sx={{ mb: 2 }}
          />
        )}
        <Box display="flex" justifyContent="flex-end" gap={2}>
          <Button onClick={handleClose} variant="outlined" color="secondary">
            Cancel
          </Button>
          <Button
            onClick={handleCreateTitle}
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

export default CreateTitleModal;
