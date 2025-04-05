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
import { useNavigate, useParams } from "react-router-dom";
import Cookies from "js-cookie";
import CreateTitleModal from "./CreateTitleModal";
import UpdateTitleModal from "./UpdateTitleModal";
import { Edit } from "@mui/icons-material";
import VisibilityIcon from "@mui/icons-material/Visibility";

const TitlesDataGrid = () => {
  const [titles, setTitles] = useState([]);
  const [filteredTitles, setFilteredTitles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { id } = useParams();
  const token = Cookies.get("token");
  const [modalOpen, setModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [update, setUpdate] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState(null);
  const navigate = useNavigate();

  const handleOpen = () => setModalOpen(true);
  const handleClose = () => {
    setModalOpen(false);
    setUpdateModalOpen(false);
  };

  const handleEditClick = (title) => {
    setSelectedTitle(title);
    setUpdateModalOpen(true);
  };

  useEffect(() => {
    const fetchTitles = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `https://lmsapp-plvj.onrender.com/admin/materials/title/subjects/content/getAllTitle?clsId=${id}`,
          {
            headers: { "x-admin-token": token },
          }
        );
        if (response.data.status) {
          setTitles(response.data.data);
          setFilteredTitles(response.data.data);
          setUpdate(false);
        } else {
          console.error("Failed to fetch titles:", response.data.message);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTitles();
  }, [id, token, update]);

  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = titles.filter((title) =>
      title.title.toLowerCase().includes(query)
    );
    setFilteredTitles(filtered);
  };

  const columns = [
    {
      field: "title",
      headerName: "Title",
      flex: 1,
      minWidth: 200,
    },
    {
      field: "isFree",
      headerName: "Free",
      flex: 1,
      minWidth: 100,
      renderCell: (params) => (params.row.isFree ? "Yes" : "No"),
    },
    {
      field: "price",
      headerName: "Price",
      flex: 1,
      minWidth: 100,
      renderCell: (params) =>
        params.row.isFree ? "Free" : `₹${params.row.price || ""}`,
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
          onClick={() => navigate(`/dashboard/material-subject/${params.row._id}`)}
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
        Material Titles
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
          Create New Titles
        </Button>
      </Stack>
      <CreateTitleModal
        open={modalOpen}
        handleClose={handleClose}
        setUpdate={setUpdate}
      />
      <UpdateTitleModal
        open={updateModalOpen}
        handleClose={handleClose}
        setUpdate={setUpdate}
        selectedTitle={selectedTitle}
      />
      <DataGrid
        rows={filteredTitles}
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

export default TitlesDataGrid;