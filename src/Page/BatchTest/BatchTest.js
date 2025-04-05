import React, { useEffect, useState } from "react";
import {
  Box,
  TextField,
  Typography,
  CircularProgress,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import CreateTestModal from "./CreateBatchTestModal";
import { Delete, Edit } from "@mui/icons-material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import UpdateTestModal from "./UpdateTestModal";

const BatchTest = () => {
  const { batchId,subjectId } = useParams();
  const [tests, setTests] = useState([]);
  const [filteredTests, setFilteredTests] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const token = Cookies.get("token");
  const [contentModalOpen, setContentModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [selectedSelectedId, setSelectedId] = useState(null); // To hold selected teacher data
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [update, setUpdate] = useState(false);
  const [selectedTest,setSelectedTest] = useState(null)
  const navigate= useNavigate()


  const handleEditClick =(data)=>{
    setSelectedTest(data)
    setUpdateModalOpen(true)
  }


  // Handle delete confirmation dialog open
  const handleDeleteClick = (id) => {
    setSelectedId(id);
    setOpenDeleteDialog(true);
  };

  // Handle delete teacher
  const handleDelete = async () => {
    try {
      const token = Cookies.get("token"); // Replace with your token key
      await axios.delete(
        `https://lmsapp-plvj.onrender.com/admin/batches/test/subjects/tests/delete/${selectedSelectedId}`,
        {
          headers: {
            "x-admin-token": token,
          },
        }
      );
      setOpenDeleteDialog(false);
      fetchTests();
    } catch (error) {
      console.error("Error deleting teacher:", error);
    }
  };

  const fetchTests = async () => {
    try {
      const response = await axios.get(
        `https://lmsapp-plvj.onrender.com/admin/batches/test/subjects/tests/getAll/${subjectId}`,
        {
          headers: { "x-admin-token": token },
        }
      );
      setTests(response.data.data);
      setFilteredTests(response.data.data);
      setUpdate(false);
    } catch (error) {
      console.error("Error fetching tests:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, [batchId, update]);

  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    setFilteredTests(
      tests.filter(
        (test) =>
          test.name.toLowerCase().includes(query) ||
          test.description.toLowerCase().includes(query)
      )
    );
  };

  const columns = [
    { field: "name", headerName: "Test Name", flex: 1 },
    { field: "description", headerName: "Description", flex: 2 },
    { field: "totalMarks", headerName: "Total Marks", flex: 0.5 },
    { field: "duration", headerName: "Duration (mins)", flex: 0.5 },
    { field: "wrongAnswerDeduction", headerName: "Wrong Deduction", flex: 0.5 },
    {
      field: "unattemptedDeduction",
      headerName: "Unattempted Deduction",
      flex: 0.5,
    },
    { field: "totalQues", headerName: "Total Questions", flex: 0.5 },
    {
      field: "isFreeTest",
      headerName: "Free Test",
      flex: 0.5,
      renderCell: (params) => (params.value ? "Yes" : "No"),
    },
    {
      field: "createdAt",
      headerName: "Created At",
      flex: 1,
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
            title="Edit"
            onClick={() => handleEditClick(params.row)}
          >
            <Edit />
          </IconButton>
          <IconButton
            color="error"
            title="Delete"
            onClick={() => handleDeleteClick(params.row._id)}
          >
            <Delete />
          </IconButton>
        </Box>
      ),
    },
    {
      field: "View",
      headerName: "View",
      width: 150,
      renderCell: (params) => (
        <Box>
          <IconButton title="Edit" onClick={()=>navigate(`/dashboard/batch-question-details/${batchId}/${params.row._id}`)}>
            <VisibilityIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold" }}>
        Tests Management
      </Typography>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <TextField
          fullWidth
          label="Search Tests"
          variant="outlined"
          value={searchQuery}
          onChange={handleSearch}
          sx={{ mr: 2 }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={() => setContentModalOpen(true)}
          sx={{ textTransform: "none", fontWeight: "bold" }}
        >
          Create New Test
        </Button>
      </Box>

      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "60vh",
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ height: 600, width: "100%" }}>
          <DataGrid
            rows={filteredTests}
            columns={columns}
            getRowId={(row) => row._id}
            pageSize={10}
            rowsPerPageOptions={[10, 20, 50]}
            disableSelectionOnClick
            sx={{
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "#f5f5f5",
                fontWeight: "bold",
              },
              "& .MuiDataGrid-footerContainer": {
                backgroundColor: "#f5f5f5",
              },
            }}
          />
        </Box>
      )}
      <CreateTestModal
        open={contentModalOpen}
        handleClose={() => setContentModalOpen(false)}
        setUpdate={setUpdate}
        batchId={batchId}
        subjectId={subjectId}
      />
      <UpdateTestModal
        open={updateModalOpen}
        handleClose={() => setUpdateModalOpen(false)}
        selectedTest={selectedTest}
        setUpdate={setUpdate}
      />
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this Test? This action cannot be
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

export default BatchTest;
