import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import {
  DataGrid,
  GridActionsCellItem,
} from "@mui/x-data-grid";
import {
  LinearProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Typography,
  TextField,
  Grid,
  Card,
  CardContent,
  Avatar,
  InputAdornment,
  Skeleton,
  Checkbox,
  Snackbar,
  Alert
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { 
  Add as AddIcon, 
  Search as SearchIcon, 
  Edit as EditIcon 
} from "@mui/icons-material";
import VisibilityIcon from "@mui/icons-material/Visibility";

const BatchSubjectsGrid = () => {
  const [rows, setRows] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogLoading, setDialogLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedSubjectForUpdate, setSelectedSubjectForUpdate] = useState(null);
  const [currentBatchSubjectId, setCurrentBatchSubjectId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { id, batchId } = useParams();
  const navigate = useNavigate()

  const columns = [
    { field: "subjectName", headerName: "Subject Name", width: 200 },
    {
      field: "icon",
      headerName: "Icon",
      width: 150,
      renderCell: (params) => (
        <Avatar
          src={params.value}
          sx={{ width: 48, height: 48, boxShadow: 1 }}
        />
      ),
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 100,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Edit"
          onClick={() => {
            setCurrentBatchSubjectId(params.row._id);
            setSelectedSubjectForUpdate(params.row.subjectId);
            setOpenEditDialog(true);
            setError(null);
            fetchAllSubjects();
          }}
        />,
      ],
    },
    {
      field: "view",
      type: "actions",
      headerName: "view",
      width: 100,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<VisibilityIcon />}
          label="Edit"
          onClick={() => {
            navigate(`/dashboard/batch-subject-contents/${params.row.batchId}/${params.row._id}`)
          }}
        />,
      ],
    },
  ];

  const fetchBatchSubjects = async () => {
    try {
      const token = Cookies.get("token");
      const response = await axios.get(
        `https://lmsapp-plvj.onrender.com/admin/batches/subjects/getAll/${batchId}`,
        { headers: { "x-admin-token": token } }
      );
      if (response.data.status) {
        setRows(response.data.data.map((item) => ({ ...item, id: item._id })));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllSubjects = async () => {
    try {
      setDialogLoading(true);
      const token = Cookies.get("token");
      const response = await axios.get(
        `https://lmsapp-plvj.onrender.com/admin/subjects/getAll?clsId=${id}`,
        { headers: { "x-admin-token": token } }
      );
      if (response.data.status) {
        setSubjects(response.data.data);
      }
    } catch (err) {
      setError("Failed to fetch subjects");
    } finally {
      setDialogLoading(false);
    }
  };

  const handleAddSubject = async () => {
    try {
      if (!selectedSubject) return;
      const token = Cookies.get("token");
      await axios.post(
        `https://lmsapp-plvj.onrender.com/admin/batches/subjects/create/${batchId}`,
        { subject: selectedSubject },
        { headers: { "x-admin-token": token } }
      );
      await fetchBatchSubjects();
      setOpenDialog(false);
      setSelectedSubject(null);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add subject");
    }
  };

  const handleUpdateSubject = async () => {
    try {
      if (!selectedSubjectForUpdate) return;
      const token = Cookies.get("token");
      await axios.put(
        `https://lmsapp-plvj.onrender.com/admin/batches/subjects/update/${currentBatchSubjectId}`,
        { subject: selectedSubjectForUpdate },
        { headers: { "x-admin-token": token } }
      );
      await fetchBatchSubjects();
      setOpenEditDialog(false);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update subject");
    }
  };

  const filteredSubjects = subjects.filter((subject) =>
    subject.subjectName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    fetchBatchSubjects();
  }, []);

  const renderSubjectCards = (subjects, selectedState, setSelectedState) => (
    <Grid container spacing={3}>
      {subjects.map((subject) => (
        <Grid item xs={12} sm={6} md={4} key={subject._id}>
          <Card
            onClick={() => setSelectedState(subject._id)}
            sx={{
              cursor: "pointer",
              border: 2,
              borderColor:
                selectedState === subject._id ? "primary.main" : "divider",
              boxShadow: selectedState === subject._id ? 3 : 0,
              transition: "all 0.2s ease",
              "&:hover": {
                transform: "translateY(-4px)",
              },
            }}
          >
            <CardContent>
              <Avatar
                src={subject.icon.url}
                sx={{
                  width: 64,
                  height: 64,
                  mb: 2,
                  mx: "auto",
                }}
              />
              <Typography
                variant="h6"
                align="center"
                gutterBottom
                fontWeight="600"
              >
                {subject.subjectName}
              </Typography>
              <Typography
                variant="body2"
                color="textSecondary"
                align="center"
              >
                {subject.clsId.clsName}
              </Typography>
              <Checkbox
                checked={selectedState === subject._id}
                color="primary"
                sx={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                }}
              />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const handleCloseError = () => {
    setError(null);
  };

  return (
    <div style={{ height: "80vh", width: "100%", padding: 24 }}>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => {
          setOpenDialog(true);
          setError(null);
          fetchAllSubjects();
        }}
        sx={{ mb: 3 }}
      >
        Add Subject
      </Button>

      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        pageSize={5}
        rowsPerPageOptions={[5]}
        disableSelectionOnClick
        components={{
          LoadingOverlay: LinearProgress,
        }}
        sx={{
          border: 1,
          borderColor: "divider",
          borderRadius: 2,
          "& .MuiDataGrid-cell": {
            borderBottom: "none",
          },
        }}
      />

      {/* Add Subject Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          setError(null);
        }}
        fullWidth
        maxWidth="md"
        PaperProps={{ sx: { borderRadius: 4 } }}
      >
        <DialogTitle sx={{ bgcolor: "background.paper", py: 3 }}>
          <Typography variant="h6" fontWeight="600">
            Add Subject to Batch
          </Typography>
        </DialogTitle>

        <DialogContent dividers sx={{ py: 3 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search subjects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 3 }}
          />

          {dialogLoading ? (
            <Grid container spacing={3}>
              {[1, 2, 3].map((i) => (
                <Grid item xs={12} sm={6} md={4} key={i}>
                  <Skeleton variant="rectangular" height={150} />
                </Grid>
              ))}
            </Grid>
          ) : filteredSubjects.length === 0 ? (
            <Typography
              variant="body1"
              color="textSecondary"
              align="center"
              py={4}
            >
              No subjects found
            </Typography>
          ) : (
            renderSubjectCards(filteredSubjects, selectedSubject, setSelectedSubject)
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, bgcolor: "background.paper" }}>
          <Button
            onClick={() => {
              setOpenDialog(false);
              setSelectedSubject(null);
              setError(null);
            }}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddSubject}
            variant="contained"
            color="primary"
            disabled={!selectedSubject}
          >
            Add Selected
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Subject Dialog */}
      <Dialog
        open={openEditDialog}
        onClose={() => {
          setOpenEditDialog(false);
          setError(null);
        }}
        fullWidth
        maxWidth="md"
        PaperProps={{ sx: { borderRadius: 4 } }}
      >
        <DialogTitle sx={{ bgcolor: "background.paper", py: 3 }}>
          <Typography variant="h6" fontWeight="600">
            Update Subject
          </Typography>
        </DialogTitle>

        <DialogContent dividers sx={{ py: 3 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search subjects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 3 }}
          />

          {dialogLoading ? (
            <Grid container spacing={3}>
              {[1, 2, 3].map((i) => (
                <Grid item xs={12} sm={6} md={4} key={i}>
                  <Skeleton variant="rectangular" height={150} />
                </Grid>
              ))}
            </Grid>
          ) : filteredSubjects.length === 0 ? (
            <Typography
              variant="body1"
              color="textSecondary"
              align="center"
              py={4}
            >
              No subjects found
            </Typography>
          ) : (
            renderSubjectCards(
              filteredSubjects,
              selectedSubjectForUpdate,
              setSelectedSubjectForUpdate
            )
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, bgcolor: "background.paper" }}>
          <Button
            onClick={() => {
              setOpenEditDialog(false);
              setSelectedSubjectForUpdate(null);
              setError(null);
            }}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdateSubject}
            variant="contained"
            color="primary"
            disabled={!selectedSubjectForUpdate}
          >
            Update Subject
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default BatchSubjectsGrid;