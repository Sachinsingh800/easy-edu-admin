import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  Card,
  Grid,
  Typography,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Container,
  InputAdornment,
  CircularProgress,
  Chip,
  IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import styles from "./BatchYearManagement.module.css";
import VisibilityIcon from '@mui/icons-material/Visibility';
import Cookies from "js-cookie";

const BatchYearManagement = () => {
  const { id } = useParams();
  const [batchYears, setBatchYears] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newBatchYear, setNewBatchYear] = useState("");
  const [editBatch, setEditBatch] = useState(null);
  const [editYear, setEditYear] = useState("");
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate()

 const token = Cookies.get("token");
  useEffect(() => {
    fetchBatchYears();
  }, [id]);

  const fetchBatchYears = async () => {
    try {
      const response = await axios.get(
        `https://lmsapp-plvj.onrender.com/admin/offline/class-subject-year-student/batchYear/getAll/${id}`,
        { headers: { "x-admin-token": token } }
      );
      setBatchYears(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching batch years:", error);
      setLoading(false);
    }
  };

  // Add simple filter function
  const filteredBatchYears = batchYears?.filter((batch) =>
    batch?.batchYear?.toLowerCase()?.includes(searchTerm?.toLowerCase())
  );

  const handleCreateBatchYear = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `https://lmsapp-plvj.onrender.com/admin/offline/class-subject-year-student/batchYear/create/${id}`,
        { batchYear: newBatchYear },
        { headers: { "x-admin-token": token } }
      );
      setNewBatchYear("");
      fetchBatchYears();
    } catch (error) {
      console.error("Error creating batch year:", error);
    }
  };

  const handleUpdateBatchYear = async () => {
    try {
      await axios.put(
        `https://lmsapp-plvj.onrender.com/admin/offline/class-subject-year-student/batchYear/update/${editBatch._id}`,
        { batchYear: editYear },
        { headers: { "x-admin-token": token } }
      );
      setOpenEditDialog(false);
      fetchBatchYears();
    } catch (error) {
      console.error("Error updating batch year:", error);
    }
  };

  return (
    <Container className={styles.container}>
      <div className={styles.header}>
        <Typography variant="h4" component="h1" fontWeight="600">
          Batch Year Management
        </Typography>

        <TextField
          className={styles.searchBar}
          variant="outlined"
          placeholder="Search batch years..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </div>

      <Card className={styles.formContainer}>
        <form onSubmit={handleCreateBatchYear}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <TextField
                label="New Batch Year"
                value={newBatchYear}
                onChange={(e) => setNewBatchYear(e.target.value)}
                required
                fullWidth
                variant="outlined"
                placeholder="e.g. 2024-2025"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                startIcon={<AddIcon />}
              >
                Add New Batch
              </Button>
            </Grid>
          </Grid>
        </form>
      </Card>

      {loading ? (
        <div style={{ textAlign: "center", marginTop: "2rem" }}>
          <CircularProgress />
        </div>
      ) : (
        <Grid container spacing={3} className={styles.cardGrid}>
          {filteredBatchYears?.map((batch) => (
            <Grid item key={batch._id} xs={12} sm={6} md={4}>
              <Card
                className={styles.batchCard}
                sx={{
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: 3,
                  },
                }}
              >
                <IconButton
                  className={styles.addButton}
                  onClick={() =>
                    navigate(`/dashboard/student-enrollment/${batch._id}`)
                  }
                >
                  <VisibilityIcon fontSize="small" />
                </IconButton>
                <Chip
                  label={batch.isDeleted ? "Inactive" : "Active"}
                  color={batch.isDeleted ? "error" : "success"}
                  className={styles.statusIndicator}
                  size="small"
                />

                <Typography variant="h6" component="div" fontWeight="500">
                  {batch?.batchYear}
                </Typography>

                <div className={styles.actionButtons}>
                  <Button
                    variant="outlined"
                    color="secondary"
                    startIcon={<EditIcon />}
                    onClick={() => {
                      setEditBatch(batch);
                      setEditYear(batch.batchYear);
                      setOpenEditDialog(true);
                    }}
                    fullWidth
                  >
                    Edit
                  </Button>
                </div>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle variant="h6" fontWeight="600">
          Edit Batch Year
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Batch Year"
            value={editYear}
            onChange={(e) => setEditYear(e.target.value)}
            fullWidth
            variant="outlined"
            margin="normal"
            autoFocus
            placeholder="e.g. 2024-2025"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button
            onClick={handleUpdateBatchYear}
            color="primary"
            variant="contained"
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BatchYearManagement;
