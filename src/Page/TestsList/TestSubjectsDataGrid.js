import React, { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import {
  Box,
  Typography,
  CircularProgress,
  TextField,
  Button,
  IconButton,
} from "@mui/material";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate, useParams } from "react-router-dom";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CreateTestSubjectModal from "./CreateTestSubjectModal";
import styles from "./TestSubjectsDataGrid.module.css";

const TestSubjectsDataGrid = () => {
  const [subjects, setSubjects] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [update, setUpdate] = useState(false);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 5,
  });
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubjects = async () => {
      const token = Cookies.get("token");
      try {
        const response = await axios.get(
          `https://lmsapp-plvj.onrender.com/admin/directTest/subjects/getAll/${id}`,
          {
            headers: { "x-admin-token": token },
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

    fetchSubjects();
  }, [id, update]);

  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);
    const filtered = subjects.filter((subject) =>
      subject.subjectName?.toLowerCase().includes(value)
    );
    setFilteredSubjects(filtered);
  };

  const columns = [
    {
      field: "subjectName",
      headerName: "Subject",
      width: 200,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <img
            src={params.row.subject?.icon?.url}
            alt={params.row.subject?.subjectName}
            style={{ width: 32, height: 32, borderRadius: "50%" }}
          />
          <Typography>{params.row.subject?.subjectName}</Typography>
        </Box>
      ),
    },
    { field: "createdAt", headerName: "Created At", width: 200 },
    { field: "updatedAt", headerName: "Updated At", width: 200 },
    {
      field: "actions",
      headerName: "View Chapters",
      width: 150,
      renderCell: (params) => (
        <IconButton
          onClick={() =>
            navigate(`/dashboard/chapter-list/${id}/${params.row._id}`)
          }
        >
          <VisibilityIcon />
        </IconButton>
      ),
    },
  ];

  return (
    <Box className={styles.container}>
      <Typography variant="h4" className={styles.title} gutterBottom>
        Subjects List
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setOpenModal(true)}
        >
          Create Subject
        </Button>
        
        <TextField
          label="Search Subjects"
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Type to search by subject name..."
        />
      </Box>

      {loading ? (
        <Box className={styles.loaderContainer}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ height: 400, width: '100%' }}>
          <DataGrid
            rows={filteredSubjects}
            columns={columns}
            getRowId={(row) => row._id}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[5, 10, 20]}
            loading={loading}
          />
        </Box>
      )}

      <CreateTestSubjectModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        setUpdate={setUpdate}
        clsId={id}
      />
    </Box>
  );
};

export default TestSubjectsDataGrid;