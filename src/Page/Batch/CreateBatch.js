import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  FormControlLabel,
  Checkbox,
  Grid,
  Modal,
  Snackbar,
  Alert,
  IconButton
} from "@mui/material";
import Cookies from "js-cookie";
import { useForm, Controller } from "react-hook-form";
import axios from "axios";
import DeleteIcon from "@mui/icons-material/Delete";

const CreateBatchModal = ({ open, handleClose, classId }) => {
  const [thumbnailImg, setThumbnailImg] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [isFree, setIsFree] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const {
    control,
    handleSubmit,
    register,
    reset,
    formState: { errors },
    getValues,
  } = useForm({
    defaultValues: {
      title: "",
      board: "",
      duration: {
        startDate: "2024-01-01",
        endDate: "2024-12-31",
      },
      batchTag: "",
      price: "",
      mrp: "",
    },
  });

  const onSubmit = async (data) => {
    const token = Cookies.get("token");

    if (!token) {
      setSnackbar({ open: true, message: "Authentication token is missing", severity: "error" });
      return;
    }

    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("board", data.board);
    formData.append(
      "duration",
      JSON.stringify({
        startDate: data.duration.startDate,
        endDate: data.duration.endDate,
      })
    );
    formData.append("batchTag", data.batchTag);
    formData.append("isFree", isFree);

    if (thumbnailImg) {
      formData.append("thumbnailImg", thumbnailImg);
    }

    if (!isFree) {
      formData.append("price", data.price);
      formData.append("mrp", data.mrp);
    }

    try {
      const response = await axios.post(
        `https://lmsapp-plvj.onrender.com/admin/course/batches/create/${classId}`,
        formData,
        {
          headers: {
            "x-admin-token": token,
          },
        }
      );

      if (response.status) {
        setSnackbar({ open: true, message: "Batch created successfully!", severity: "success" });
        reset();
        setThumbnailImg(null);
        setThumbnailPreview(null);
        setIsFree(false);
        handleClose();
      }
    } catch (error) {
      setSnackbar({ open: true, message: "An error occurred while creating the batch", severity: "error" });
    }
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    setThumbnailImg(file);
    setThumbnailPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleThumbnailDelete = () => {
    setThumbnailImg(null);
    setThumbnailPreview(null);
  };

  const validateDateGap = () => {
    const { startDate, endDate } = getValues("duration");
    const start = new Date(startDate);
    const end = new Date(endDate);
    return (end - start) / (1000 * 60 * 60 * 24) >= 1 || "End date must be at least 1 day after the start date";
  };

  return (
    <>
      <Modal open={open} onClose={handleClose} aria-labelledby="create-batch-modal">
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{
            maxWidth: "700px",
            maxHeight: "80vh",
            overflowY: "auto",
            margin: "auto",
            padding: "24px",
            backgroundColor: "#ffffff",
            borderRadius: "12px",
            boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.1)",
            mt: "10vh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Typography variant="h4" gutterBottom align="center" sx={{ fontWeight: "bold" }}>
            Create Batch
          </Typography>

          <Controller
            name="title"
            control={control}
            rules={{ required: "Title is required" }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Title"
                fullWidth
                margin="normal"
                error={!!errors.title}
                helperText={errors.title?.message}
              />
            )}
          />

          <Controller
            name="board"
            control={control}
            rules={{ required: "Board is required" }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Board"
                fullWidth
                margin="normal"
                error={!!errors.board}
                helperText={errors.board?.message}
              />
            )}
          />

          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Duration
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Controller
                name="duration.startDate"
                control={control}
                rules={{ required: "Start Date is required" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Start Date"
                    type="date"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.duration?.startDate}
                    helperText={errors.duration?.startDate?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={6}>
              <Controller
                name="duration.endDate"
                control={control}
                rules={{
                  required: "End Date is required",
                  validate: validateDateGap,
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="End Date"
                    type="date"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.duration?.endDate}
                    helperText={errors.duration?.endDate?.message}
                  />
                )}
              />
            </Grid>
          </Grid>

          <Controller
            name="batchTag"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="Batch Tag" fullWidth margin="normal" />
            )}
          />

          <FormControlLabel
            control={
              <Checkbox checked={isFree} onChange={(e) => setIsFree(e.target.checked)} />
            }
            label="Is Free"
          />

          {!isFree && (
            <>
              <Controller
                name="price"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Price" type="number" fullWidth margin="normal" />
                )}
              />
              <Controller
                name="mrp"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="MRP" type="number" fullWidth margin="normal" />
                )}
              />
            </>
          )}

          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Thumbnail Image
          </Typography>
          <Button variant="outlined" component="label" sx={{ marginBottom: "16px" }}>
            Upload Thumbnail
            <input type="file" hidden onChange={handleThumbnailChange} />
          </Button>
          {thumbnailPreview && (
            <Box sx={{ position: "relative", display: "inline-block", mb: 2 }}>
              <Box
                component="img"
                src={thumbnailPreview}
                alt="Thumbnail Preview"
                sx={{ width: "100%", height: "auto", borderRadius: "8px" }}
              />
              <IconButton
                onClick={handleThumbnailDelete}
                sx={{ position: "absolute", top: 8, right: 8, backgroundColor: "white" }}
              >
                <DeleteIcon color="error" />
              </IconButton>
            </Box>
          )}

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 3, py: 1.5, fontWeight: "bold" }}
          >
            Create Batch
          </Button>
        </Box>
      </Modal>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default CreateBatchModal;
