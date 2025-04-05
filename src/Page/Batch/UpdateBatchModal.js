import React, { useEffect, useState } from "react";
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
  IconButton,
} from "@mui/material";
import Cookies from "js-cookie";
import { useForm, Controller } from "react-hook-form";
import axios from "axios";
import DeleteIcon from "@mui/icons-material/Delete";

const UpdateBatchModal = ({ open, handleClose, batch ,setUpdate }) => {
  const [thumbnailImg, setThumbnailImg] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(
    batch?.thumbnailImg?.url || null
  );
  const [isFree, setIsFree] = useState(batch?.isFree || false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const {
    control,
    handleSubmit,
    reset,
    register,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: batch?.title || "",
      board: batch?.board || "",
      duration: {
        startDate: batch?.duration?.startDate || "",
        endDate: batch?.duration?.endDate || "",
      },
      batchTag: batch?.batchTag || "",
      price: batch?.price || "",
      mrp: batch?.mrp || "",
    },
  });

  useEffect(() => {
    reset({
      title: batch?.title || "",
      board: batch?.board || "",
      duration: {
        startDate: batch?.duration?.startDate || "",
        endDate: batch?.duration?.endDate || "",
      },
      batchTag: batch?.batchTag || "",
      price: batch?.price || "",
      mrp: batch?.mrp || "",
    });
    setThumbnailPreview(batch?.thumbnailImg?.url || null);
    setIsFree(batch?.isFree || false);
  }, [batch, reset]);

  const onSubmit = async (data) => {
    const token = Cookies.get("token");

    if (!token) {
      setSnackbar({
        open: true,
        message: "Authentication token is missing",
        severity: "error",
      });
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
      const response = await axios.put(
        `https://lmsapp-plvj.onrender.com/admin/course/batches/update/${batch._id}`,
        formData,
        {
          headers: {
            "x-admin-token": token,
          },
        }
      );

      // Ensure correct success check
      if (response.status === 200 && response.data.status === true) {
        setSnackbar({
          open: true,
          message: response.data.message || "Batch updated successfully!",
          severity: "success",
        });
        setUpdate(true)
        handleClose();
      } else {
        throw new Error(response?.data?.message || "Failed to update batch.");
      }
    } catch (error) {
      console.error("Error caught:", error); // Log the error to debug
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "An error occurred while updating the batch";
        setSnackbar({ open: true, message: errorMessage, severity: "error" });
      } else {
        // Handle non-Axios errors here (e.g., logic issues)
        setSnackbar({
          open: true,
          message: "Unexpected error occurred.",
          severity: "error",
        });
      }
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

  return (
    <>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="update-batch-modal"
      >
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
          <Typography
            variant="h4"
            gutterBottom
            align="center"
            sx={{ fontWeight: "bold" }}
          >
            Update Batch
          </Typography>

          <TextField
            label="Title"
            fullWidth
            margin="normal"
            {...register("title", { required: "Title is required" })}
            error={!!errors.title}
            helperText={errors.title?.message}
          />

          <TextField
            label="Board"
            fullWidth
            margin="normal"
            {...register("board", { required: "Board is required" })}
            error={!!errors.board}
            helperText={errors.board?.message}
          />

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Controller
                name="duration.startDate"
                control={control}
                render={({ field }) => (
                  <TextField
                    label="Start Date"
                    type="date"
                    fullWidth
                    margin="normal"
                    {...field}
                    InputLabelProps={{ shrink: true }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={6}>
              <Controller
                name="duration.endDate"
                control={control}
                render={({ field }) => (
                  <TextField
                    label="End Date"
                    type="date"
                    fullWidth
                    margin="normal"
                    {...field}
                    InputLabelProps={{ shrink: true }}
                  />
                )}
              />
            </Grid>
          </Grid>

          <TextField
            label="Batch Tag"
            fullWidth
            margin="normal"
            {...register("batchTag")}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={isFree}
                onChange={(e) => setIsFree(e.target.checked)}
              />
            }
            label="Is Free"
          />

          {!isFree && (
            <>
              <TextField
                label="Price"
                fullWidth
                margin="normal"
                type="number"
                {...register("price", { required: "Price is required" })}
                error={!!errors.price}
                helperText={errors.price?.message}
              />
              <TextField
                label="MRP"
                fullWidth
                margin="normal"
                type="number"
                {...register("mrp", { required: "MRP is required" })}
                error={!!errors.mrp}
                helperText={errors.mrp?.message}
              />
            </>
          )}

          <Typography variant="body1" sx={{ mt: 2 }}>
            Thumbnail
          </Typography>
          {thumbnailPreview && (
            <Box
              sx={{
                mt: 1,
                mb: 2,
                display: "flex",
                alignItems: "center",
              }}
            >
              <img
                src={thumbnailPreview}
                alt="Thumbnail Preview"
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 8,
                  marginRight: 16,
                }}
              />
              <IconButton onClick={handleThumbnailDelete}>
                <DeleteIcon />
              </IconButton>
            </Box>
          )}
          <Button variant="outlined" component="label">
            Upload Thumbnail
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={handleThumbnailChange}
            />
          </Button>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 3, py: 1.5, fontWeight: "bold" }}
          >
            Update Batch
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

export default UpdateBatchModal;
