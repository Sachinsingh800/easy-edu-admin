import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Typography,
  Button,
  CircularProgress,
  Paper,
  useTheme,
  IconButton,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";
import Cookies from "js-cookie";
import { useParams } from "react-router-dom";
import AddContentModal from "./AddContentModal";
import UpdateContentModal from "./UpdateContentModal";
import EditIcon from "@mui/icons-material/Edit";

const BookContent = () => {
  const [content, setContent] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const [openModal, setOpenModal] = useState(false);
  const [update, setUpdate] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null); // Store the selected content for update
  const [isModalUpdateOpen, setIsModalUpdateOpen] = useState(false); // Track modal open state for update
  const theme = useTheme();

  // Fetch content from API
  useEffect(() => {
    const fetchContent = async () => {
      const token = Cookies.get("token");
      try {
        const response = await axios.get(
          `https://lmsapp-plvj.onrender.com/admin/materials/book/content/getAll/${id}`,
          {
            headers: {
              "x-admin-token": token,
            },
          }
        );
        if (response.data.status) {
          setContent(response.data.data);
          setUpdate(false);
        }
      } catch (error) {
        console.error("Error fetching content:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, [id, update]);

  // Filtered content based on search
  const filteredContent = content.filter(
    (item) =>
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.chapter.toString().includes(search)
  );

  // Columns for the DataGrid
  const columns = [
    { field: "title", headerName: "Title", width: 300 },
    { field: "medium", headerName: "Medium", width: 150 },
    { field: "chapter", headerName: "Chapter", width: 100 },
    {
      field: "pdfUrl",
      headerName: "PDF Link",
      width: 200,
      renderCell: (params) => (
        <Button
          variant="contained"
          color="secondary"
          href={params.value}
          target="_blank"
          rel="noopener noreferrer"
        >
          View PDF
        </Button>
      ),
    },
    {
      field: "edit",
      headerName: "Edit",
      width: 100,
      renderCell: (params) => (
        <IconButton
          onClick={() => handleOpenUpdate(params.row)}
          color="primary"
          title="Edit"
        >
          <EditIcon />
        </IconButton>
      ),
    },
  ];

  // Rows for the DataGrid
  const rows = filteredContent.map((item) => ({
    id: item._id,
    title: item.title,
    medium: item.medium,
    chapter: item.chapter,
    pdfUrl: item.pdf.url,
  }));

  // Handle opening the update modal with the selected content
  const handleOpenUpdate = (content) => {
    setSelectedContent(content);
    setIsModalUpdateOpen(true);
  };

  return (
    <Box sx={{ p: 4, backgroundColor: theme.palette.background.default }}>
      <Typography variant="h4" gutterBottom>
        Book Content
      </Typography>
      <Paper
        elevation={3}
        sx={{ p: 3, mb: 4, backgroundColor: theme.palette.background.paper }}
      >
        {/* Add Content Modal */}
        <AddContentModal
          open={openModal}
          onClose={() => setOpenModal(false)}
          setUpdate={setUpdate}
        />
        {/* Update Content Modal */}
        <UpdateContentModal
          open={isModalUpdateOpen}
          onClose={() => setIsModalUpdateOpen(false)}
          selectedContent={selectedContent}
          setUpdate={setUpdate}
        />

        <Box sx={{ display: "flex", alignItems: "center", mb: 3, gap: 2 }}>
          <TextField
            label="Search by Title or Chapter"
            variant="outlined"
            fullWidth
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={() => setOpenModal(true)}
          >
            Add Content
          </Button>
        </Box>
      </Paper>
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <DataGrid
          rows={rows}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5, 10, 20]}
          autoHeight
          disableSelectionOnClick
        />
      )}
    </Box>
  );
};

export default BookContent;
