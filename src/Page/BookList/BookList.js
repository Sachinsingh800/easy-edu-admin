import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  TextField,
  Typography,
  Container,
  Button,
  Grid,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useNavigate, useParams } from "react-router-dom";
import CreateBookModal from "./CreateBookModal";
import Cookies from "js-cookie";
import { Edit } from "@mui/icons-material";
import UpdateBookModal from "./UpdateBookModal";
import VisibilityIcon from "@mui/icons-material/Visibility";

const BookList = () => {
  const [books, setBooks] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [materialType, setMaterialType] = useState("NCRT Books"); // Default material type
  const { id } = useParams();
  const [open, setOpen] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [update, setUpdate] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const navigate = useNavigate()

  const handleOpenUpdate = (book) => {
    setOpenUpdate(true);
    setSelectedBook(book);
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setOpenUpdate(false);
  };

  // Fetch data from API
  useEffect(() => {
    const fetchBooks = async () => {
      const token = Cookies.get("token");
      try {
        const response = await axios.get(
          `https://lmsapp-plvj.onrender.com/admin/materials/book/getAll?clsId=${id}&materialType=${materialType}`,
          {
            headers: {
              "x-admin-token": token,
            },
          }
        );
        if (response.data.status) {
          setBooks(response.data.data);
          setFilteredBooks(response.data.data);
          setUpdate(false);
        }
      } catch (error) {
        console.error("Error fetching books:", error);
      }
    };
    fetchBooks();
  }, [update, materialType]);

  // Handle search input
  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchText(value);
    const filtered = books.filter(
      (book) =>
        book.subjectName.toLowerCase().includes(value) ||
        book.title.toLowerCase().includes(value)
    );
    setFilteredBooks(filtered);
  };

  // Define columns for the DataGrid
  const columns = [
    {
      field: "icon",
      headerName: "Icon",
      width: 100,
      renderCell: (params) => (
        <img
          src={params.value}
          alt="icon"
          style={{ width: 50, height: 50, borderRadius: "50%" }}
        />
      ),
    },
    { field: "subjectName", headerName: "Subject Name", width: 200 },
    { field: "title", headerName: "Title", width: 300 },
    { field: "materialType", headerName: "Material Type", width: 300 },
    {
      field: "createdAt",
      headerName: "Created At",
      width: 200,
      renderCell: (params) => new Date(params.row.createdAt).toLocaleString(),
    },
    {
      field: "updatedAt",
      headerName: "Updated At",
      width: 200,
      renderCell: (params) => new Date(params.row.updatedAt).toLocaleString(),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      renderCell: (params) => (
        <IconButton
          onClick={() => handleOpenUpdate(params.row)}
          color="primary"
          title="Edit"
        >
          <Edit />
        </IconButton>
      ),
    },
    {
        field: "View Content",
        headerName: "View Content",
        width: 250,
        renderCell: (params) => (
          <IconButton
            color="tertiary"
            onClick={() => navigate(`/dashboard/book-content/${params.row._id}`)}
          >
            <VisibilityIcon />
          </IconButton>
        ),
      },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography
        variant="h4"
        gutterBottom
        align="center"
        sx={{ fontWeight: 600 }}
      >
         Books
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3, alignItems: "center" }}>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Search by Subject or Title"
            variant="outlined"
            value={searchText}
            onChange={handleSearch}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth>
            <InputLabel id="material-type-label">Material Type</InputLabel>
            <Select
              labelId="material-type-label"
              value={materialType}
              onChange={(e) => setMaterialType(e.target.value)}
              label="Material Type"
            >
              <MenuItem value="NCRT Books">NCRT Books</MenuItem>
              <MenuItem value="Helping Books">Helping Books</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid
          item
          xs={12}
          sm={2}
          sx={{ textAlign: { xs: "center", sm: "right" } }}
        >
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpen}
            sx={{ px: 4, py: 1 }}
          >
            Add New Book
          </Button>
        </Grid>
      </Grid>

      <CreateBookModal
        open={open}
        handleClose={handleClose}
        setUpdate={setUpdate}
        clsId={id}
      />
      <UpdateBookModal
        open={openUpdate}
        handleClose={handleClose}
        book={selectedBook}
        setUpdate={setUpdate}
        clsId={id}
      />

      <Box
        sx={{
          height: 500,
          width: "100%",
          backgroundColor: "#fff",
          borderRadius: 2,
          p: 2,
        }}
      >
        <DataGrid
          rows={filteredBooks.map((book) => ({ id: book._id, ...book }))}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5, 10, 20]}
          disableSelectionOnClick
          sx={{
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#f5f5f5",
              fontWeight: "bold",
            },
            "& .MuiDataGrid-row:hover": {
              backgroundColor: "#f9f9f9",
            },
          }}
        />
      </Box>
    </Container>
  );
};

export default BookList;
