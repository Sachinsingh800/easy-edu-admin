import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  MenuItem,
  Grid,
  Paper,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate, useParams } from "react-router-dom";
import ContentModal from "./ContentModal";
import UpdateSubjectModal from "./UpdateSubjectModal";
import UpdateTestSubjectModal from "./UpdateTestSubjectModal";
import CreateTestModal from "../TestsList/CreateTestModal";

const BatchTests = ({clsId}) => {
  const [formData, setFormData] = useState({ subject: "" });
  const [subjects, setSubjects] = useState([]);
  const [subjectList, setSubjectList] = useState([]);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [update, setUpdate] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams();
  const token = Cookies.get("token");

  const fetchSubjects = async () => {
    try {
      const response = await axios.get(
        `https://lmsapp-plvj.onrender.com/admin/batches/test/subjects/getAll/${id}`,
        {
          headers: { "x-admin-token": token },
        }
      );
      setSubjects(response.data.data);
      setUpdate(false);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  const fetchAllSubjects = async () => {
    try {
      const response = await axios.get(
        `https://lmsapp-plvj.onrender.com/admin/subjects/getAll?clsId=${clsId}`,
        {
          headers: { "x-admin-token": token },
        }
      );
      setSubjectList(response.data.data || []);
      setUpdate(false);
    } catch (error) {
      console.error("Error fetching all subjects:", error);
    }
  };

  useEffect(() => {
    fetchSubjects();
    fetchAllSubjects();
  }, [update]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `https://lmsapp-plvj.onrender.com/admin/batches/test/subjects/create/${id}`,
        formData,
        {
          headers: { "x-admin-token": token },
        }
      );
      setFormData({ subject: "" });
      fetchSubjects();
    } catch (error) {
      console.error("Error creating subject:", error);
    }
  };


  const openUpdateModal = (data) => {
    setSelectedSubject(data);
    setUpdateModalOpen(true);
  };

  const columns = [
    { field: "subjectName", headerName: "Subject Name", width: 200 },
    {
      field: "icon",
      headerName: "Icon",
      width: 100,
      renderCell: (params) => (
        <img
          src={params.value}
          alt="icon"
          style={{ width: "50px", height: "50px" }}
        />
      ),
    },
    {
      field: "Edit",
      headerName: "Edit",
      width: 150,
      renderCell: (params) => (
        <IconButton
          color="secondary"
          onClick={() => openUpdateModal(params.row)}
        >
          <EditIcon />
        </IconButton>
      ),
    },
    {
      field: "View",
      headerName: "View",
      width: 150,
      renderCell: (params) => (
        <IconButton
          color="secondary"
          onClick={() => navigate(`/dashboard/batch-test/${params.row.batchId}/${params.row._id}`)}
        >
          <VisibilityIcon />
        </IconButton>
      ),
    },
  ];

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Manage Subjects
      </Typography>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" mb={2}>
          Add New Subject
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Select Subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
              >
                {subjectList.map((subject) => (
                  <MenuItem key={subject._id} value={subject._id}>
                    <img
                      src={subject.icon.url}
                      alt="icon"
                      style={{
                        width: "20px",
                        height: "20px",
                        marginRight: "10px",
                      }}
                    />
                    {subject.subjectName}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" variant="contained" fullWidth>
                Add Subject
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <Box sx={{ height: 400 }}>
        <DataGrid
          rows={subjects}
          columns={columns}
          getRowId={(row) => row._id}
          pageSize={5}
          rowsPerPageOptions={[5]}
        />
      </Box>

      <UpdateTestSubjectModal
        open={updateModalOpen}
        handleClose={() => setUpdateModalOpen(false)}
        selectedSubject={selectedSubject}
        setUpdate={setUpdate}
      />

 
    </Box>
  );
};

export default BatchTests;
