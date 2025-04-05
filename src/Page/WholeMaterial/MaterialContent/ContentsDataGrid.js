import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Stack,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";
import { useParams } from "react-router-dom";
import Cookies from "js-cookie";
import { Edit } from "@mui/icons-material";
import CreateTitleModal from "../MaterialTitle/CreateTitleModal";
import UpdateTitleModal from "../MaterialTitle/UpdateTitleModal";
import CreateContentsTitleModal from "./CreateContentsTitleModal";
import UpdateContentsTitleModal from "./UpdateContentsTitleModal";

const ContentsDataGrid = () => {
  const [contents, setContents] = useState([]);
  const [filteredContents, setFilteredContents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { id } = useParams();
  const token = Cookies.get("token");
  const [modalOpen, setModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [update, setUpdate] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);

  const handleOpen = () => setModalOpen(true);
  const handleClose = () => {
    setModalOpen(false);
    setUpdateModalOpen(false);
  };

  const handleEditClick = (content) => {
    setSelectedContent(content);
    setUpdateModalOpen(true);
  };

  useEffect(() => {
    const fetchContents = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `https://lmsapp-plvj.onrender.com/admin/materials/title/subjects/content/getAllContent/${id}`,
          {
            headers: { "x-admin-token": token },
          }
        );
        if (response.data.status) {
          setContents(response.data.data);
          setFilteredContents(response.data.data);
          setUpdate(false);
        } else {
          console.error("Failed to fetch contents:", response.data.message);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContents();
  }, [id, token, update]);

  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = contents.filter((content) =>
      content.title.toLowerCase().includes(query)
    );
    setFilteredContents(filtered);
  };

  const columns = [
    {
      field: "title",
      headerName: "Title",
      flex: 1,
      minWidth: 200,
    },
    {
      field: "chapterNo",
      headerName: "Chapter No.",
      flex: 0.5,
      minWidth: 150,
    },
    {
      field: "pdf",
      headerName: "PDF Link",
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <a
          href={params.row.pdf.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "blue", textDecoration: "underline" }}
        >
          View PDF
        </a>
      ),
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
  ];

  return (
    <Box sx={{ height: "100%", width: "100%", p: 4, bgcolor: "background.default" }}>
      <Typography variant="h4" gutterBottom>
        Material Contents
      </Typography>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <TextField
          label="Search by Title"
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
          Create New Content
        </Button>
      </Stack>
      <CreateContentsTitleModal
        open={modalOpen}
        handleClose={handleClose}
        setUpdate={setUpdate}
      />
      <UpdateContentsTitleModal
        open={updateModalOpen}
        handleClose={handleClose}
        setUpdate={setUpdate}
        selectedContent={selectedContent}
      />
      <DataGrid
        rows={filteredContents}
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

export default ContentsDataGrid;
