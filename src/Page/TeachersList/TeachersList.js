import React, { useEffect, useState } from "react";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import {
  TextField,
  Box,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import axios from "axios";
import Cookies from "js-cookie";
import { Delete, Edit } from "@mui/icons-material";
import styles from "./TeachersList.module.css";
import CreateTeacherModal from "./CreateTeacherModal";
import UpdateTeacherModal from "./UpdateTeacherModal";

const TeachersList = () => {
  const [teachers, setTeachers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null); // To hold selected teacher data
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openCreateModal, setOpenCreateModal] = useState(false); // State for Create modal
  const [openUpdateModal, setOpenUpdateModal] = useState(false); // State for Update modal
  const [update, setUpdate] = useState(false);
      const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 5,
      });

  // Fetch teachers data from API
  const fetchTeachers = async () => {
    try {
      const token = Cookies.get("token"); // Replace with your token key
      const response = await axios.get(
        "https://lmsapp-plvj.onrender.com/admin/teachers/getAll",
        {
          headers: {
            "x-admin-token": token,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (response.data.status) {
        setTeachers(response.data.data);
        setFilteredData(response.data.data);
        setUpdate(false); 
      } else {
        console.error(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching teachers:", error);
    }
  };

  // Filter teachers data based on search term
  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);
    const filtered = teachers.filter((teacher) =>
      teacher.teacherName.toLowerCase().includes(value)
    );
    setFilteredData(filtered);
  };

  // Handle delete confirmation dialog open
  const handleDeleteClick = (id) => {
    setSelectedTeacher(id);
    setOpenDeleteDialog(true);
  };

  // Handle delete teacher
  const handleDelete = async () => {
    try {
      const token = Cookies.get("token"); // Replace with your token key
      await axios.delete(
        `https://lmsapp-plvj.onrender.com/admin/teachers/delete/${selectedTeacher}`,
        {
          headers: {
            "x-admin-token": token,
          },
        }
      );
      setTeachers((prev) =>
        prev.filter((teacher) => teacher._id !== selectedTeacher)
      );
      setFilteredData((prev) =>
        prev.filter((teacher) => teacher._id !== selectedTeacher)
      );
      setOpenDeleteDialog(false);
    } catch (error) {
      console.error("Error deleting teacher:", error);
    }
  };

  // Handle edit button click
  const handleEditClick = (teacher) => {
    setSelectedTeacher(teacher); // Set the selected teacher for editing
    setOpenUpdateModal(true); // Open Update modal
  };

  useEffect(() => {
    fetchTeachers();
  }, [update]);

  // Define columns for DataGrid
  const columns = [
    {
      field: "pic",
      headerName: "Profile Picture",
      width: 150,
      renderCell: (params) => (
        <img
          src={params.value.url}
          alt="Teacher"
          style={{ width: "50px", height: "50px", borderRadius: "50%" }}
        />
      ),
    },
    { field: "teacherName", headerName: "Name", width: 200 },
    { field: "expertise", headerName: "Expertise", width: 150 },
    { field: "yearOfEx", headerName: "Experience (Years)", width: 150 },
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
            color="primary"
            title="Edit"
            onClick={() => handleEditClick(params.row)}
          >
            <Edit />
          </IconButton>
          <IconButton
            color="error"
            title="Delete"
            onClick={() => handleDeleteClick(params.row.id)}
          >
            <Delete />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box className={styles.container}>
      <Typography variant="h4" className={styles.title} gutterBottom>
        Teacher List
      </Typography>
      <Button
        variant="contained"
        color="primary"
        sx={{ marginBottom: "20px" }}
        onClick={() => {
          setOpenCreateModal(true);
        }}
      >
        Create Teacher
      </Button>
      {/* Create Teacher Modal */}
      <CreateTeacherModal
        open={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
        setUpdate={setUpdate}
      />
      {/* Update Teacher Modal */}
      <UpdateTeacherModal
        open={openUpdateModal}
        onClose={() => setOpenUpdateModal(false)}
        setUpdate={setUpdate}
        teacher={selectedTeacher} // Pass the selected teacher for editing
      />
      <TextField
        fullWidth
        label="Search by Teacher Name"
        variant="outlined"
        value={searchTerm}
        onChange={handleSearch}
        sx={{ marginBottom: "20px" }}
      />
      <DataGrid
        rows={filteredData.map((teacher) => ({
          id: teacher._id,
          pic: teacher.pic,
          teacherName: teacher.teacherName,
          expertise: teacher.expertise,
          yearOfEx: teacher.yearOfEx,
          createdAt: teacher.createdAt,
        }))}
        columns={columns}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pageSizeOptions={[5, 10, 20]}
        disableSelectionOnClick
      />
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this teacher? This action cannot be
            undone.
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

export default TeachersList;
