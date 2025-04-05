import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Typography,
  Snackbar,
  Alert,
  CircularProgress,
  Button,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate, useParams } from "react-router-dom";
import UpdateBatchModal from "./UpdateBatchModal";
import CreateBatchModal from "./CreateBatch";
import styles from "./BatchList.module.css";
import VisibilityIcon from "@mui/icons-material/Visibility";

const BatchList = () => {
  const [batches, setBatches] = useState([]);
  const [filteredBatches, setFilteredBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [batchToDelete, setBatchToDelete] = useState(null);
  const { id } = useParams();
  const [update, setUpdate] = useState(false);
  const [batchModalOpen, setBatchModalOpen] = useState(false);

  const [selectedBatchId, setSelectedBatchId] = useState(null);
  const navigate = useNavigate();

  // Open batch creation modal
  const handleOpenBatchModal = () => {
    setBatchModalOpen(true);
  };

  // Close batch creation modal
  const handleCloseBatchModal = () => {
    setBatchModalOpen(false);
  };

  useEffect(() => {
    fetchBatches();
  }, [update]);

  const fetchBatches = async () => {
    const token = Cookies.get("token");

    if (!token) {
      setSnackbar({
        open: true,
        message: "Authentication token is missing",
        severity: "error",
      });
      return;
    }

    try {
      const response = await axios.get(
        `https://lmsapp-plvj.onrender.com/admin/course/batches/getAll/${id}`,
        {
          headers: {
            "x-admin-token": token,
          },
        }
      );

      if (response.data.status) {
        setBatches(response.data.data);
        setFilteredBatches(response.data.data);
        setUpdate(false);
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to fetch batches",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = batches.filter(
      (batch) =>
        batch.title.toLowerCase().includes(query) ||
        batch.board.toLowerCase().includes(query) ||
        batch.clsName.toLowerCase().includes(query)
    );
    setFilteredBatches(filtered);
  };

  const handleOpenModal = (batch) => {
    setSelectedBatch(batch);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBatch(null);
  };

  const openDeleteDialog = (batchId) => {
    setBatchToDelete(batchId);
    setIsDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setIsDialogOpen(false);
    setBatchToDelete(null);
  };

  const confirmDeleteBatch = async () => {
    const token = Cookies.get("token");

    if (!token) {
      setSnackbar({
        open: true,
        message: "Authentication token is missing",
        severity: "error",
      });
      return;
    }

    try {
      const response = await axios.delete(
        `https://lmsapp-plvj.onrender.com/admin/course/batches/delete/${batchToDelete}`,
        {
          headers: {
            "x-admin-token": token,
          },
        }
      );

      if (response.data.status) {
        setSnackbar({
          open: true,
          message: "Batch deleted successfully",
          severity: "success",
        });
        setUpdate(true); // Trigger re-fetch
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to delete batch",
        severity: "error",
      });
    } finally {
      closeDeleteDialog();
    }
  };

  const columns = [
    {
      field: "thumbnailImg",
      headerName: "Thumbnail",
      width: 100,
      renderCell: (params) => (
        <img
          src={params.row.thumbnailImg.url}
          alt={params.row.title}
          style={{ width: "50px", height: "50px", borderRadius: "8px" }}
        />
      ),
    },
    { field: "title", headerName: "Title", width: 200 },
    { field: "clsName", headerName: "Class Name", width: 100 },
    { field: "board", headerName: "Board", width: 100 },
    {
      field: "duration",
      headerName: "Duration",
      width: 200,
      renderCell: (params) => (
        <div>{`${params.row.duration.startDate} - ${params.row.duration.endDate}`}</div>
      ),
    },
    { field: "isFree", headerName: "Is Free?", width: 100 },
    { field: "price", headerName: "Price", width: 100 },
    { field: "mrp", headerName: "MRP", width: 100 },
    { field: "discount", headerName: "Discount", width: 100 },
    { field: "isbatchActive", headerName: "Batch Active", width: 100 },
    { field: "batchTag", headerName: "Batch Tag", width: 150 },
    {
      field: "createdAt",
      headerName: "Created At",
      width: 200,
      renderCell: (params) => new Date(params.row.createdAt).toLocaleString(),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      renderCell: (params) => (
        <Box>
          <IconButton
            color="primary"
            onClick={() => handleOpenModal(params.row)}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            color="secondary"
            onClick={() => openDeleteDialog(params.row._id)}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
    {
      field: "View",
      headerName: "View",
      width: 200,
      renderCell: (params) => (
        <IconButton
          color="secondary"
          onClick={() => navigate(`/dashboard/batch-subjects/${id}/${params.row._id}`)}
        >
          <VisibilityIcon />
        </IconButton>
      ),
    },
  ];

  return (
    <Box className={styles.container}>
      <Typography variant="h4" className={styles.title} gutterBottom>
        Batch List
      </Typography>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <TextField
          label="Search Batches"
          variant="outlined"
          value={searchQuery}
          onChange={handleSearch}
          fullWidth
          sx={{ maxWidth: "400px" }}
        />
        <div>
          <Button
            variant="contained"
            onClick={fetchBatches}
            sx={{ marginLeft: "16px" }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            onClick={handleOpenBatchModal}
            sx={{ marginLeft: "16px" }}
          >
            Create Batch
          </Button>
        </div>
      </Box>

      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "300px",
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ height: 500, width: "100%" }}>
          <DataGrid
            rows={filteredBatches.map((batch) => ({ ...batch, id: batch._id }))}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5, 10, 20]}
            disableSelectionOnClick
            sx={{
              backgroundColor: "#fff",
              borderRadius: "8px",
              boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.1)",
            }}
          />
        </Box>
      )}

      <UpdateBatchModal
        open={isModalOpen}
        batch={selectedBatch}
        handleClose={handleCloseModal}
        onBatchUpdated={fetchBatches}
        setUpdate={setUpdate}
      />
      <CreateBatchModal
        open={batchModalOpen}
        handleClose={handleCloseBatchModal}
        classId={id}
      />

      <Dialog open={isDialogOpen} onClose={closeDeleteDialog}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this batch? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmDeleteBatch} color="secondary">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
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
    </Box>
  );
};

export default BatchList;
