import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  IconButton,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import Cookies from "js-cookie";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import VisibilityIcon from "@mui/icons-material/Visibility";
import UpdateChapterModal from "./UpdateChapterModal"; // Import the update modal
import CreateChapterModal from "./CreateChapterModal"


const ChapterDataGrid = () => {
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState(null); // For update modal
  const { id } = useParams(); // SubjectTest ID
  const navigate = useNavigate();
  const [update, setUpdate] = useState(false);

  useEffect(() => {
    const fetchChapters = async () => {
      const token = Cookies.get("token");
      if (!token) {
        setError("Authentication token not found. Please log in.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `https://lmsapp-plvj.onrender.com/admin/directTest/subjects/chapter/getAll/${id}`,
          {
            headers: {
              "x-admin-token": token,
            },
          }
        );
        setChapters(response.data.data || []);
        setError(null); // Clear previous errors
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch chapters.");
      } finally {
        setLoading(false);
        setUpdate(false);
      }
    };

    fetchChapters();
  }, [id, update]);

  const handleUpdateClick = (chapter) => {
    setSelectedChapter(chapter);
    setOpenUpdateModal(true);
  };

  const columns = [
    { field: "chapterNo", headerName: "Chapter No", width: 130 },
    { field: "chapterName", headerName: "Chapter Name", width: 250 },
    {
      field: "createdAt",
      headerName: "Created At",
      width: 250,
      renderCell: (params) => new Date(params.row.createdAt).toLocaleString(),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 200,
      renderCell: (params) => (
        <Button
          variant="outlined"
          color="primary"
          onClick={() => handleUpdateClick(params.row)}
        >
          Update
        </Button>
      ),
    },
    {
      field: "View",
      headerName: "View",
      width: 150,
      renderCell: (params) => (
        <Box>
          <IconButton
            title="View Details"
            onClick={() => navigate(`/dashboard/tests-list/${params.row._id}`)}
          >
            <VisibilityIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Chapters
      </Typography>

      <Button
        variant="contained"
        color="primary"
        onClick={() => setOpenCreateModal(true)}
        sx={{ mb: 2 }}
      >
        Create Chapter
      </Button>

      {loading ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="400px"
        >
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <Box height={400}>
          <DataGrid
            rows={chapters.map((chapter) => ({ ...chapter, id: chapter._id }))}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5, 10, 20]}
            disableSelectionOnClick
          />
        </Box>
      )}

      {/* Create Modal */}
      <CreateChapterModal
        open={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
        clsId={chapters[0]?.clsId || ""}
        subjectTest={id}
        update={setUpdate}
      />

      {/* Update Modal */}
      {selectedChapter && (
        <UpdateChapterModal
          open={openUpdateModal}
          onClose={() => setOpenUpdateModal(false)}
          chapter={selectedChapter}
          update={setUpdate}
        />
      )}
    </Box>
  );
};

export default ChapterDataGrid;
