import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  TextField,
  Pagination,
  Button,
  IconButton,
  Snackbar,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { Delete } from "@mui/icons-material";
import styles from "./ClassList.module.css"; // Module-level CSS
import CreateClassModal from "./CreateClassModal";
import axios from "axios";
import Cookies from "js-cookie";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import UpdateClassModal from "./UpdateClassModal";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useNavigate } from "react-router-dom";
import CreateBatchModal from "../Batch/CreateBatch";

const ClassList = () => {
  const [classes, setClasses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const rowsPerPage = 5; // Number of rows per page
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState(""); // Snackbar message
  const [snackbarSeverity, setSnackbarSeverity] = useState("info"); // Snackbar severity
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedClassToDelete, setSelectedClassToDelete] = useState(null);
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [update,setUpdate] = useState(false)
  const [classId,setClassId] = useState(null)

  const navigate = useNavigate()

  // Fetch data from the API
  useEffect(() => {
    const fetchClasses = async () => {
      const token = Cookies.get("token");
      try {
        const response = await axios.get(
          "https://lmsapp-plvj.onrender.com/admin/classes/getAll",
          {
            headers: {
              "x-admin-token": token,
            },
          }
        );
        setClasses(response.data.data);
        setFilteredClasses(response.data.data);
        setUpdate(false)
      } catch (error) {
        setSnackbarMessage("Error fetching class data.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        console.error("Error fetching class data:", error);
      }
    };
    fetchClasses();
  }, [update]);

  // Open/close modal
  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Handle search input
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    const filtered = classes.filter(
      (cls) =>
        cls.clsName.toLowerCase().includes(value) ||
        cls.clsNum.toString().includes(value)
    );
    setFilteredClasses(filtered);
    setPage(1); // Reset to first page
  };

  // Handle pagination
  const handleChangePage = (event, value) => {
    setPage(value);
  };

  // Open delete confirmation dialog
  const handleOpenDeleteDialog = (clsNum) => {
    const selectedClass = classes.find((cls) => cls.clsNum === clsNum);
    setSelectedClassToDelete(selectedClass);
    setDialogOpen(true);
  };

  // Close delete confirmation dialog
  const handleCloseDeleteDialog = () => {
    setDialogOpen(false);
    setSelectedClassToDelete(null);
  };

  // Handle delete class
  const handleDelete = async (id) => {
    if (selectedClassToDelete) {
      const token = Cookies.get("token");

      if (!token) {
        setSnackbarMessage(
          "Authentication token is missing. Please log in again."
        );
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        return;
      }

      try {
        // Send DELETE request to the API
        const response = await axios.delete(
          `https://lmsapp-plvj.onrender.com/admin/classes/delete/${id}`,
          {
            headers: {
              "x-admin-token": token,
            },
          }
        );

        if (response.status === 200) {
          // Update the classes list
          const updatedClasses = classes.filter(
            (cls) => cls.clsNum !== selectedClassToDelete.clsNum
          );
          setClasses(updatedClasses);
          setFilteredClasses(updatedClasses);
          setSnackbarMessage(
            `Class "${selectedClassToDelete.clsName}" deleted successfully.`
          );
          setSnackbarSeverity("success");
        } else {
          setSnackbarMessage(
            response.data?.message ||
              "Failed to delete class. Please try again."
          );
          setSnackbarSeverity("error");
        }
      } catch (error) {
        console.error("Error:", error);
        setSnackbarMessage(
          "An unexpected error occurred. Please try again later."
        );
        setSnackbarSeverity("error");
      }

      // Close dialog and reset state
      setSelectedClassToDelete(null);
      setDialogOpen(false);
      setSnackbarOpen(true);
    }
  };

  // Handle Snackbar close
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  // Open batch creation modal
  const handleOpenBatchModal = (id) => {
    setClassId(id);
    setBatchModalOpen(true);
  };

  // Close batch creation modal
  const handleCloseBatchModal = () => {
    setBatchModalOpen(false);
  };

  // Open/close Update Class modal
  const handleOpenUpdateModal = (cls) => {
    setSelectedClass(cls);
    setIsUpdateModalOpen(true);
  };

  const handleCloseUpdateModal = () => {
    setIsUpdateModalOpen(false);
    setSelectedClass(null);
  };


  // Pagination logic
  const paginatedClasses = filteredClasses?.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  return (
    <div className={styles.container}>
      {/* Title */}
      <Typography variant="h4" gutterBottom className={styles.heading}>
        Class List
      </Typography>

      {/* Update  Class  */}
      <UpdateClassModal
        open={isUpdateModalOpen}
        handleClose={handleCloseUpdateModal}
        classData={selectedClass}
        setUpdate={setUpdate}
      />
      {/* Add New Batch Button */}
      <CreateBatchModal 
      open={batchModalOpen}
      handleClose={handleCloseBatchModal}
      classId={classId}
       />
      <div>
        <Button variant="contained" color="primary" onClick={handleOpenModal}>
          Add New Class
        </Button>

        {/* Create Class Modal */}
        <CreateClassModal open={isModalOpen} handleClose={handleCloseModal} setUpdate={setUpdate} />
      </div>
      <br />

      {/* Search Bar */}
      <TextField
        label="Search Classes"
        variant="outlined"
        fullWidth
        className={styles.searchBar}
        value={searchTerm}
        onChange={handleSearch}
      />

      {/* Class Table */}
      <TableContainer component={Paper} className={styles.tableContainer}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center">
                <b>Class Name</b>
              </TableCell>
              <TableCell align="center">
                <b>Class Number</b>
              </TableCell>
              <TableCell align="center">
                <b>Update</b>
              </TableCell>
              <TableCell align="center">
                <b>Delete</b>
              </TableCell>
              <TableCell align="center">
                <b>View Batches</b>
              </TableCell>
              <TableCell align="center">
                <b>View Tests</b>
              </TableCell>
              <TableCell align="center">
                <b>View Books</b>
              </TableCell>
              <TableCell align="center">
                <b>View Material</b>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedClasses.length > 0 ? (
              paginatedClasses.map((cls, index) => (
                <TableRow key={index}>
                  <TableCell align="center">{cls.clsName}</TableCell>
                  <TableCell align="center">{cls.clsNum}</TableCell>
                  <TableCell align="center">
                    {" "}
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenUpdateModal(cls)}
                    >
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      color="tertiary"
                      onClick={() => handleOpenDeleteDialog(cls.clsNum)}
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton color="tertiary" onClick={()=>navigate(`/dashboard/batch-list/${cls._id}`)}>
                      <VisibilityIcon />
                    </IconButton>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton color="tertiary" onClick={()=>navigate(`/dashboard/test-subjects-list/${cls._id}`)}>
                      <VisibilityIcon />
                    </IconButton>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton color="tertiary" onClick={()=>navigate(`/dashboard/book-list/${cls._id}`)}>
                      <VisibilityIcon />
                    </IconButton>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton color="tertiary" onClick={()=>navigate(`/dashboard/material-title/${cls._id}`)}>
                      <VisibilityIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No classes found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <Pagination
        count={Math.ceil(filteredClasses.length / rowsPerPage)}
        page={page}
        onChange={handleChangePage}
        className={styles.pagination}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete{" "}
            <b>{selectedClassToDelete?.clsName}</b>?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">
            Cancel
          </Button>
          <Button
            onClick={() => handleDelete(selectedClassToDelete._id)}
            color="secondary"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      {/* Snackbar Notification */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default ClassList;
