import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import Cookies from "js-cookie";
import { Edit } from "@mui/icons-material";
import CreateSubjectTitleModal from "./CreateSubjectTitleModal";
import UpdateSubjectTitleModal from "./UpdateSubjectTitleModal";
import VisibilityIcon from "@mui/icons-material/Visibility";

const SubjectsDataGrid = () => {
  const [subjects, setSubjects] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMedium, setSelectedMedium] = useState("English"); // Default medium
  const { id } = useParams();
  const token = Cookies.get("token");
  const [modalOpen, setModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [update, setUpdate] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const navigate = useNavigate();

  const handleOpen = () => setModalOpen(true);
  const handleClose = () => {
    setModalOpen(false);
    setUpdateModalOpen(false);
  };

  const handleEditClick = (subject) => {
    setSelectedSubject(subject);
    setUpdateModalOpen(true);
  };

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://lmsapp-plvj.onrender.com/admin/materials/title/subjects/content/getAllSub/${id}?medium=${selectedMedium}`,
        {
          headers: { "x-admin-token": token },
        }
      );
      if (response.data.status) {
        setSubjects(response.data.data);
        setFilteredSubjects(response.data.data);
        setUpdate(false);
      } else {
        console.error("Failed to fetch subjects:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, [id, token, update, selectedMedium]);

  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = subjects.filter((subject) =>
      subject.subject.toLowerCase().includes(query)
    );
    setFilteredSubjects(filtered);
  };

  const handleMediumChange = (event) => {
    setSelectedMedium(event.target.value);
  };

  const columns = [
    {
      field: "subject",
      headerName: "Subject",
      flex: 1,
      minWidth: 200,
    },
    {
      field: "medium",
      headerName: "Medium",
      flex: 1,
      minWidth: 150,
    },
    {
      field: "createdAt",
      headerName: "Created At",
      flex: 1,
      minWidth: 200,
      renderCell: (params) => new Date(params.row.createdAt).toLocaleString(),
    },
    {
      field: "updatedAt",
      headerName: "Updated At",
      flex: 1,
      minWidth: 200,
      renderCell: (params) => new Date(params.row.updatedAt).toLocaleString(),
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 0.5,
      minWidth: 150,
      renderCell: (params) => (
        <IconButton
          color="primary"
          title="Edit"
          onClick={() => handleEditClick(params.row)}
        >
          <Edit />
        </IconButton>
      ),
    },
    {
      field: "View Subject",
      headerName: "View Subject",
      flex: 0.5,
      minWidth: 150,
      renderCell: (params) => (
        <IconButton
          color="tertiary"
          onClick={() =>
            navigate(`/dashboard/material-contents/${params.row._id}`)
          }
        >
          <VisibilityIcon />
        </IconButton>
      ),
    },
  ];

  return (
    <Box
      sx={{
        height: "100%",
        width: "100%",
        p: 4,
        bgcolor: "background.default",
      }}
    >
      <Typography variant="h4" gutterBottom>
        Material Subjects
      </Typography>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel id="medium-filter-label">Medium</InputLabel>
          <Select
            labelId="medium-filter-label"
            id="medium-filter"
            value={selectedMedium}
            onChange={handleMediumChange}
          >
            <MenuItem value="English">English</MenuItem>
            <MenuItem value="Hindi">Hindi</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="Search by Subject"
          variant="outlined"
          fullWidth
          value={searchQuery}
          onChange={handleSearch}
        />
        <Button
          variant="contained"
          color="primary"
          sx={{ textTransform: "none", fontWeight: "bold" }}
          onClick={handleOpen}
        >
          Create New Subject
        </Button>
      </Stack>
      <CreateSubjectTitleModal
        open={modalOpen}
        handleClose={handleClose}
        setUpdate={setUpdate}
      />
      <UpdateSubjectTitleModal
        open={updateModalOpen}
        handleClose={handleClose}
        setUpdate={setUpdate}
        selectedSubject={selectedSubject}
      />
      <DataGrid
        rows={filteredSubjects}
        columns={columns}
        getRowId={(row) => row._id}
        loading={loading}
        disableSelectionOnClick
        pageSize={5}
        rowsPerPageOptions={[5, 10, 20]}
        checkboxSelection
      />
    </Box>
  );
};

export default SubjectsDataGrid;
