import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { Download, Visibility, Event, Info, Delete } from "@mui/icons-material";
import axios from "axios";
import Cookies from "js-cookie";
import EditIcon from "@mui/icons-material/Edit";
import UpdateBatchDescription from "./UpdateBatchDescription";
import { useParams } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import CreateBatchDescription from "./CreateBatchDescription";

const BatchDescription = ({clsId}) => {
  const [batchDetails, setBatchDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // State to manage modal open/close
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [update, setUpdate] = useState(false);
  const [batchDescriptionModalOpen, setBatchDescriptionModalOpen] =
    useState(false);
  const { id } = useParams();
  // Close Description batch creation modal
  const handleDescriptionCloseBatchModal = () => {
    setBatchDescriptionModalOpen(false);
  };

  // Fetch batch details
  useEffect(() => {
    const fetchBatchDetails = async () => {
      const token = Cookies.get("token");
      try {
        const response = await axios.get(
          `https://lmsapp-plvj.onrender.com/admin/batches/discription/get/${id}`,
          {
            headers: {
              "x-admin-token": token,
            },
          }
        );
        if (response.data.status) {
          setBatchDetails(response.data.data);
          setUpdate(false);
        }
      } catch (error) {
        if (error.response) {
          // Display the error message from the API response
          setError(
            error.response.data.message || "Failed to fetch batch details."
          );
        } else {
          setError("An error occurred while fetching batch details.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchBatchDetails();
  }, [id, update]);

  const handleDownloadPDF = (pdfUrl) => {
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.setAttribute("download", "schedule.pdf");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // Handle modal open/close
  const handleModalOpen = () => setIsModalOpen(true);
  const handleModalClose = () => setIsModalOpen(false);

  // Handle delete confirmation dialog open
  const handleDeleteClick = () => {
    setOpenDeleteDialog(true);
  };

  // Handle delete teacher
  const handleDelete = async () => {
    try {
      const token = Cookies.get("token"); // Replace with your token key
      await axios.delete(
        `https://lmsapp-plvj.onrender.com/admin/batches/discription/delete/${batchDetails._id}`,
        {
          headers: {
            "x-admin-token": token,
          },
        }
      );
      setUpdate(true);
      setOpenDeleteDialog(false);
    } catch (error) {
      console.error("Error deleting teacher:", error);
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="90vh"
        flexDirection="column"
        gap="2rem"
      >
        <Button
          color="secondary"
          variant="contained"
          onClick={() => setBatchDescriptionModalOpen(true)}
        >
          <AddIcon />
        </Button>
        <Typography variant="h6" color="error">
          {error}
        </Typography>
        {/* batch description Modal */}
        <CreateBatchDescription
          open={batchDescriptionModalOpen}
          handleClose={handleDescriptionCloseBatchModal}
          id={id}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box style={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h4" gutterBottom>
          Batch Details
        </Typography>
        <Box>
          <IconButton color="primary" onClick={handleModalOpen}>
            <EditIcon />
          </IconButton>
          <IconButton color="error" onClick={handleDeleteClick}>
            <Delete />
          </IconButton>
        </Box>
      </Box>
      {/* UpdateBatchDescription Modal */}
      <UpdateBatchDescription
        open={isModalOpen}
        handleClose={handleModalClose}
        batchDetails={batchDetails}
        clsId={clsId}
      />

      {/* Batch Info Section */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6}>
          <Card sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              <Event /> Course Duration
            </Typography>
            <Typography>
              {new Date(
                batchDetails.courseDuration.startDate
              ).toLocaleDateString()}{" "}
              -{" "}
              {new Date(
                batchDetails.courseDuration.endDate
              ).toLocaleDateString()}
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Batch Includes */}
      <Divider />
      <Typography variant="h5" mt={3} mb={2}>
        Batch Includes
      </Typography>
      <Typography variant="body1" mb={2}>
        {batchDetails.batchIncludes.join(", ")}
      </Typography>

      {/* Validity */}
      <Divider />
      <Typography variant="h5" mt={3} mb={2}>
        Validity
      </Typography>
      <Typography variant="body1">
        {new Date(batchDetails.validity).toLocaleDateString()}
      </Typography>

      {/* Subjects */}
      <Divider />
      <Typography variant="h5" mt={3} mb={2}>
        Subjects
      </Typography>
      <Typography variant="body1">
        {batchDetails.subjects.join(", ")}
      </Typography>

      {/* Teachers Section */}
      <Divider />
      <Typography variant="h5" mt={3} mb={2}>
        Know Your Teachers
      </Typography>
      <Grid container spacing={3}>
        {batchDetails.knowYourTeachers.map((teacher, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card sx={{ textAlign: "center", p: 2 }}>
              <CardMedia
                component="img"
                image={teacher.pic}
                alt={teacher.teacherName}
                sx={{
                  width: 100,
                  height: 100,
                  borderRadius: "50%",
                  margin: "0 auto",
                  objectFit: "cover",
                }}
              />
              <CardContent>
                <Typography variant="h6">{teacher.teacherName}</Typography>
                <Typography variant="body2">{teacher.expertise}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {teacher.yearOfEx} years of experience
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Schedule Section */}
      <Divider />
      <Typography variant="h5" mt={3} mb={2}>
        Schedule
      </Typography>
      <Grid container spacing={3}>
        {batchDetails.schedule.map((item, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card sx={{ textAlign: "center" }}>
              <CardMedia
                component="img"
                height="140"
                image={item.icon}
                alt={item.subject}
                sx={{
                  width: 100,
                  height: 100,
                  borderRadius: "50%",
                  margin: "0 auto",
                  objectFit: "cover",
                }}
              />
              <CardContent>
                <Typography variant="h6">{item.subject}</Typography>
                <Box mt={2} display="flex" justifyContent="space-between">
                  <Button
                    startIcon={<Visibility />}
                    href={item.pdf}
                    target="_blank"
                    variant="outlined"
                  >
                    View PDF
                  </Button>
                  <Button
                    startIcon={<Download />}
                    onClick={() => handleDownloadPDF(item.pdf)}
                    variant="contained"
                  >
                    Download
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Other Details */}
      <Divider />
      <Typography variant="h5" mt={3} mb={2}>
        Other Details
      </Typography>
      <Typography variant="body1" mb={2}>
        {batchDetails.otherDetails.join(", ")}
      </Typography>

      {/* FAQ Section */}
      <Divider />
      <Typography variant="h5" mt={3} mb={2}>
        FAQ
      </Typography>
      {batchDetails.faq.map((faq, index) => (
        <Box key={index} mt={1} mb={2}>
          <Typography variant="body1" fontWeight="bold">
            Q: {faq.question}
          </Typography>
          <Typography variant="body2">A: {faq.answer}</Typography>
        </Box>
      ))}
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this discription? This action cannot
            be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenDeleteDialog(false)}
            color="primary"
            variant="outlined"
          >
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BatchDescription;
