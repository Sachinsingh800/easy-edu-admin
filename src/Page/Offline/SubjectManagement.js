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
  IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import styles from "./SubjectManagement.module.css";
import VisibilityIcon from '@mui/icons-material/Visibility';
import Cookies from "js-cookie";

const SubjectManagement = () => {
  const { id } = useParams();
  const [subjects, setSubjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newSubjectName, setNewSubjectName] = useState("");
  const [editSubject, setEditSubject] = useState(null);
  const [editName, setEditName] = useState("");
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate()

 const token = Cookies.get("token");
  useEffect(() => {
    fetchSubjects();
  }, [id]);

  const fetchSubjects = async () => {
    try {
      const response = await axios.get(
        `https://lmsapp-plvj.onrender.com/admin/offline/class-subject-year-student/subject/getAll/${id}`,
        { headers: { "x-admin-token": token } }
      );
      setSubjects(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      setLoading(false);
    }
  };

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `https://lmsapp-plvj.onrender.com/admin/offline/class-subject-year-student/subject/create/${id}`,
        { subjectName: newSubjectName },
        { headers: { "x-admin-token": token } }
      );
      setNewSubjectName("");
      fetchSubjects();
    } catch (error) {
      console.error("Error creating subject:", error);
    }
  };

  const handleUpdateSubject = async () => {
    try {
      await axios.put(
        `https://lmsapp-plvj.onrender.com/admin/offline/class-subject-year-student/subject/update/${editSubject._id}`,
        { subjectName: editName },
        { headers: { "x-admin-token": token } }
      );
      setOpenEditDialog(false);
      fetchSubjects();
    } catch (error) {
      console.error("Error updating subject:", error);
    }
  };

  const filteredSubjects = subjects.filter((subject) =>
    subject.subjectName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container className={styles.container}>
      <div className={styles.header}>
        <Typography variant="h4" component="h1" fontWeight="600">
          Subject Management
        </Typography>

        <TextField
          className={styles.searchBar}
          variant="outlined"
          placeholder="Search subjects..."
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
        <form onSubmit={handleCreateSubject}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <TextField
                label="New Subject Name"
                value={newSubjectName}
                onChange={(e) => setNewSubjectName(e.target.value)}
                required
                fullWidth
                variant="outlined"
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
                Add New Subject
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
          {filteredSubjects.map((subject) => (
            <Grid item key={subject._id} xs={12} sm={6} md={4} lg={3}>
              <Card
                className={styles.subjectCard}
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
                    navigate(`/dashboard/batch-year-management/${subject._id}`)
                  }
                >
                  <VisibilityIcon fontSize="small" />
                </IconButton>
                <Typography variant="h6" component="div" fontWeight="500">
                  {subject.subjectName}
                </Typography>
                <div className={styles.actionButtons}>
                  <Button
                    variant="outlined"
                    color="secondary"
                    startIcon={<EditIcon />}
                    onClick={() => {
                      setEditSubject(subject);
                      setEditName(subject.subjectName);
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
          Edit Subject
        </DialogTitle>
        <DialogContent className={styles.dialogContent}>
          <TextField
            label="Subject Name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            fullWidth
            variant="outlined"
            margin="normal"
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button
            onClick={handleUpdateSubject}
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

export default SubjectManagement;
