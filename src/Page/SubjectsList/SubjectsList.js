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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import axios from "axios";
import Cookies from "js-cookie";
import { Edit, Delete } from "@mui/icons-material";
import styles from "./SubjectsList.module.css";
import CreateSubjectModal from "./CreateSubjectModal";
import UpdateSubjectModal from "./UpdateSubjectModal";

const SubjectsList = () => {
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [update, setUpdate] = useState(false);
  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteSubjectId, setDeleteSubjectId] = useState(null);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 5,
  });

  useEffect(() => {
    const fetchSubjects = async () => {
      const token = Cookies.get("token");
      try {
        const response = await axios.get(
          "https://lmsapp-plvj.onrender.com/admin/subjects/getAll",
          {
            headers: {
              "x-admin-token": token,
            },
          }
        );
        if (response.data.status) {
          setSubjects(response.data.data);
          setFilteredSubjects(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching subjects:", error);
      } finally {
        setLoading(false);
        setUpdate(false);
      }
    };

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
        if (response.data.status) {
          setClasses(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching classes:", error);
      }
    };

    fetchSubjects();
    fetchClasses();
  }, [update]);

  useEffect(() => {
    const filtered = subjects.filter((subject) => {
      const matchesSearch = subject.subjectName
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesClass = selectedClass
        ? subject.clsId?.clsName?.trim().toLowerCase() === selectedClass.trim().toLowerCase()
        : true;
      return matchesSearch && matchesClass;
    });
    setFilteredSubjects(filtered);
  }, [subjects, searchTerm, selectedClass]);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleClassFilterChange = (event) => {
    setSelectedClass(event.target.value);
  };

  const openDeleteConfirmation = (id) => {
    setDeleteSubjectId(id);
    setOpenDeleteDialog(true);
  };

  const handleDelete = async () => {
    const token = Cookies.get("token");
    try {
      const response = await axios.delete(
        `https://lmsapp-plvj.onrender.com/admin/subjects/delete/${deleteSubjectId}`,
        {
          headers: {
            "x-admin-token": token,
          },
        }
      );
      if (response.data.status) {
        setUpdate(true);
      }
    } catch (error) {
      console.error("Error deleting subject:", error);
    } finally {
      setOpenDeleteDialog(false);
    }
  };

  const handleEdit = (subject) => {
    setSelectedSubject(subject);
    setOpenUpdateModal(true);
  };

  const columns = [
    {
      field: "icon",
      headerName: "Icon",
      width: 100,
      renderCell: (params) => (
        <img
          src={params.row.icon.url}
          alt={params.row.subjectName}
          className={styles.icon}
        />
      ),
    },
    {
      field: "subjectName",
      headerName: "Subject Name",
      width: 200,
    },
    {
      field: "clsName",
      headerName: "Class",
      width: 150,
      renderCell: (params) => params?.row?.clsId?.clsName || '',
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      renderCell: (params) => (
        <Box>
          <IconButton
            onClick={() => handleEdit(params.row)}
            color="primary"
            title="Edit"
          >
            <Edit />
          </IconButton>
          <IconButton
            onClick={() => openDeleteConfirmation(params.row._id)}
            color="error"
            title="Delete"
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
        Subjects List
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={() => setOpenModal(true)}
        sx={{ mb: 2 }}
      >
        Create Subject
      </Button>
      
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          label="Search Subjects"
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Type to search by subject name..."
        />
        
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Class</InputLabel>
          <Select
            value={selectedClass}
            onChange={handleClassFilterChange}
            label="Filter by Class"
          >
            <MenuItem value="">All Classes</MenuItem>
            {classes.map((cls) => (
              <MenuItem key={cls._id} value={cls.clsName}>
                {cls.clsName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {loading ? (
        <Box className={styles.loaderContainer}>
          <CircularProgress />
        </Box>
      ) : (
        <Box className={styles.dataGridContainer}>
          <DataGrid
            rows={filteredSubjects.map((subject) => ({
              ...subject,
              id: subject._id,
            }))}
            columns={columns}
            rowCount={filteredSubjects.length}
            disableSelectionOnClick
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[5, 10, 20]}
          />
        </Box>
      )}

      <CreateSubjectModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        setUpdate={setUpdate}
        classes={classes}
      />
      <UpdateSubjectModal
        open={openUpdateModal}
        onClose={() => setOpenUpdateModal(false)}
        setUpdate={setUpdate}
        subject={selectedSubject}
        classes={classes}
      />

      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this subject? This action cannot be
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

export default SubjectsList;