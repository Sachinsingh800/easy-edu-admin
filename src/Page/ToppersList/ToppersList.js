import React, { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import {
  Box,
  Typography,
  CircularProgress,
  TextField,
  Button,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Avatar,
  InputAdornment,
} from "@mui/material";
import axios from "axios";
import Cookies from "js-cookie";
import { Edit, Delete, Add, Search } from "@mui/icons-material";
import styles from "./ToppersList.module.css";

const ToppersList = () => {
  const [toppers, setToppers] = useState([]);
  const [filteredToppers, setFilteredToppers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedTopper, setSelectedTopper] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteTopperId, setDeleteTopperId] = useState(null);
  const [pageSize, setPageSize] = useState(10);

  // Form states
  const [name, setName] = useState("");
  const [percentage, setPercentage] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [cls, setCls] = useState(""); // Changed from 'class' to 'cls'

  useEffect(() => {
    const fetchToppers = async () => {
      const token = Cookies.get("token");
      try {
        const response = await axios.get(
          "https://lmsapp-plvj.onrender.com/admin/ourToppers/getAll",
          {
            headers: {
              "x-admin-token": token,
            },
          }
        );
        if (response.data.status) {
          setToppers(response.data.data);
          setFilteredToppers(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching toppers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchToppers();
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    const filtered = toppers.filter((topper) =>
      topper.name.toLowerCase().includes(value)
    );
    setFilteredToppers(filtered);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const token = Cookies.get("token");
    const formData = new FormData();
    formData.append("name", name);
    formData.append("percentage", percentage);
    formData.append("pic", image);
    formData.append("cls", cls);

    try {
      const response = await axios.post(
        "https://lmsapp-plvj.onrender.com/admin/ourToppers/create",
        formData,
        {
          headers: {
            "x-admin-token": token,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (response.data.status) {
        const newToppers = [...toppers, response.data.data];
        setToppers(newToppers);
        setFilteredToppers(
          newToppers.filter((topper) =>
            topper.name.toLowerCase().includes(searchTerm.toLowerCase())
          )
        );
        handleCloseModal();
      }
    } catch (error) {
      console.error("Error creating topper:", error);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const token = Cookies.get("token");
    const formData = new FormData();
    formData.append("name", name);
    formData.append("percentage", percentage);
    formData.append("cls", cls);
    if (image) formData.append("pic", image);

    try {
      const response = await axios.put(
        `https://lmsapp-plvj.onrender.com/admin/ourToppers/update/${selectedTopper._id}`,
        formData,
        {
          headers: {
            "x-admin-token": token,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (response.data.status) {
        const updatedToppers = toppers.map((topper) =>
          topper._id === selectedTopper._id ? response.data.data : topper
        );
        setToppers(updatedToppers);
        setFilteredToppers(
          updatedToppers.filter((topper) =>
            topper.name.toLowerCase().includes(searchTerm.toLowerCase())
          )
        );
        handleCloseModal();
      }
    } catch (error) {
      console.error("Error updating topper:", error);
    }
  };

  const handleDelete = async () => {
    const token = Cookies.get("token");
    try {
      const response = await axios.delete(
        `https://lmsapp-plvj.onrender.com/admin/ourToppers/delete/${deleteTopperId}`,
        {
          headers: {
            "x-admin-token": token,
          },
        }
      );
      if (response.data.status) {
        const updatedToppers = toppers.filter(
          (topper) => topper._id !== deleteTopperId
        );
        setToppers(updatedToppers);
        setFilteredToppers(updatedToppers);
      }
    } catch (error) {
      console.error("Error deleting topper:", error);
    } finally {
      setOpenDeleteDialog(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleEditClick = (topper) => {
    setSelectedTopper(topper);
    setName(topper.name);
    setPercentage(topper.percentage);
    setCls(topper.cls);
    setPreview(topper.pic.url);
    setOpenEditModal(true);
  };

  const handleCloseModal = () => {
    setOpenCreateModal(false);
    setOpenEditModal(false);
    setName("");
    setPercentage("");
    setCls("");
    setImage(null);
    setPreview("");
  };

  const columns = [
    {
      field: "pic",
      headerName: "Photo",
      width: 120,
      renderCell: (params) => (
        <Avatar
          src={params.row.pic.url}
          alt={params.row.name}
          sx={{ width: 56, height: 56 }}
        />
      ),
    },
    { field: "name", headerName: "Name", width: 200 },
    {
      field: "percentage",
      headerName: "Percentage",
      width: 150,
      renderCell: (params) => `${params.value}%`,
    },
    { field: "cls", headerName: "Class", width: 150 },
    {
      field: "createdAt",
      headerName: "Created At",
      width: 200,
      renderCell: (params) =>
        new Date(params.value).toLocaleDateString("en-US"),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      renderCell: (params) => (
        <Box>
          <IconButton
            onClick={() => handleEditClick(params.row)}
            color="primary"
          >
            <Edit />
          </IconButton>
          <IconButton
            onClick={() => {
              setDeleteTopperId(params.row._id);
              setOpenDeleteDialog(true);
            }}
            color="error"
          >
            <Delete />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box className={styles.container}>
      <Box className={styles.header}>
        <Typography variant="h4" className={styles.title}>
          Our Toppers
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenCreateModal(true)}
        >
          Add New Topper
        </Button>
      </Box>

      <TextField
        variant="outlined"
        placeholder="Search toppers..."
        fullWidth
        margin="normal"
        value={searchTerm}
        onChange={handleSearch}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
        }}
      />

      {loading ? (
        <Box className={styles.loading}>
          <CircularProgress size={60} />
        </Box>
      ) : (
        <Box sx={{ height: 600, width: "100%" }}>
          <DataGrid
            rows={filteredToppers}
            columns={columns}
            pageSize={pageSize}
            onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
            rowsPerPageOptions={[10, 20, 50]}
            getRowId={(row) => row._id}
            disableSelectionOnClick
          />
        </Box>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={openCreateModal || openEditModal} onClose={handleCloseModal}>
        <DialogTitle>
          {openCreateModal ? "Add New Topper" : "Edit Topper"}
        </DialogTitle>
        <DialogContent>
          <Box
            component="form"
            onSubmit={openCreateModal ? handleCreate : handleUpdate}
            sx={{ mt: 2 }}
          >
            <input
              accept="image/*"
              style={{ display: "none" }}
              id="image-upload"
              type="file"
              onChange={handleImageChange}
            />
            <label htmlFor="image-upload">
              <Button
                variant="outlined"
                component="span"
                fullWidth
                sx={{ mb: 2 }}
              >
                Upload Photo
              </Button>
            </label>
            {preview && (
              <Avatar
                src={preview}
                alt="Preview"
                sx={{ width: 100, height: 100, mb: 2, mx: "auto" }}
              />
            )}

            <TextField
              margin="normal"
              required
              fullWidth
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Class"
              value={cls}
              onChange={(e) => setCls(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Percentage"
              type="number"
              inputProps={{ min: 0, max: 100 }}
              value={percentage}
              onChange={(e) => setPercentage(e.target.value)}
            />

            <DialogActions sx={{ mt: 3 }}>
              <Button onClick={handleCloseModal} color="inherit">
                Cancel
              </Button>
              <Button type="submit" variant="contained">
                {openCreateModal ? "Create" : "Update"}
              </Button>
            </DialogActions>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Delete Topper</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this topper? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ToppersList;