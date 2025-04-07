import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Alert,
  IconButton,
  Stack,
} from "@mui/material";
import { Add, Edit, Delete } from "@mui/icons-material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useNavigate } from "react-router-dom";

const CategoryManagementGrid = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    catName: "",
    description: "",
  });
  const navigate = useNavigate();


  const fetchCategories = async () => {
    try {
      const token = Cookies.get("token");
      const response = await axios.get(
        "https://lmsapp-plvj.onrender.com/admin/course/category/get",
        { headers: { "x-admin-token": token } }
      );
      setCategories(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmitCategory = async () => {
    try {
      setIsSubmitting(true);
      const token = Cookies.get("token");
      const url = editingCategory
        ? `https://lmsapp-plvj.onrender.com/admin/course/category/update/${editingCategory._id}`
        : "https://lmsapp-plvj.onrender.com/admin/course/category/create";

      const method = editingCategory ? "put" : "post";

      await axios[method](url, formData, {
        headers: { "x-admin-token": token },
      });

      await fetchCategories();
      handleCloseDialog();
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        const token = Cookies.get("token");
        await axios.delete(
          `https://lmsapp-plvj.onrender.com/admin/course/category/delete/${categoryId}`,
          { headers: { "x-admin-token": token } }
        );
        await fetchCategories();
      } catch (err) {
        setError(err.response?.data?.message || "Failed to delete category");
      }
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCategory(null);
    setFormData({ catName: "", description: "" });
  };

  const handleEditClick = (category) => {
    setEditingCategory(category);
    setFormData({
      catName: category.catName,
      description: category.description,
    });
    setOpenDialog(true);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">Course Categories</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenDialog(true)}
        >
          Add Category
        </Button>
      </Box>

      {loading ? (
        <LinearProgress />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Category Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category._id}>
                  <TableCell>{category.catName}</TableCell>
                  <TableCell>{category.description}</TableCell>
                  <TableCell>
                    {new Date(category.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <IconButton
                        aria-label="edit"
                        onClick={() => handleEditClick(category)}
                      >
                        <Edit color="primary" />
                      </IconButton>
                      <IconButton
                        aria-label="delete"
                        onClick={() => handleDeleteCategory(category._id)}
                      >
                        <Delete color="error" />
                      </IconButton>
                      <IconButton
                        aria-label="view"
                        onClick={() => {
                          navigate(
                            `/dashboard/course-grid/${category._id}`
                          );
                        }}
                      >
                        <VisibilityIcon color="secondary" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingCategory ? "Edit Category" : "Create New Category"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Category Name"
              name="catName"
              value={formData.catName}
              onChange={handleInputChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              margin="normal"
              multiline
              rows={4}
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmitCategory}
            variant="contained"
            disabled={isSubmitting}
            startIcon={
              isSubmitting && <CircularProgress size={20} color="inherit" />
            }
          >
            {isSubmitting
              ? editingCategory
                ? "Updating..."
                : "Creating..."
              : editingCategory
              ? "Update"
              : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="error" sx={{ width: "100%" }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CategoryManagementGrid;
