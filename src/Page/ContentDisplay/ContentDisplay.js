import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Grid,
  CircularProgress,
  Dialog,
  DialogContent,
  IconButton,
  AppBar,
  Toolbar,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  DialogContentText,
  DialogTitle,
  DialogActions,
} from "@mui/material";
import { useParams } from "react-router-dom";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import LockIcon from "@mui/icons-material/Lock";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf"; // PDF icon
import axios from "axios";
import Cookies from "js-cookie";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import UpdateContentModal from "./UpdateContentModal";

const ContentDisplay = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [contentData, setContentData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState({ type: "", content: "" });
  const [filterContentType, setFilterContentType] = useState("");
  const token = Cookies.get("token");
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);
  const [selectedContentId, setSelectedContentId] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const handleCloseModal = () => {
    setUpdateModalOpen(false);
  };

  const handleEditClick = (content) => {
    setSelectedContent(content);
    setUpdateModalOpen(true);
  };

  // Fetch content with the selected filter
  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await axios.get(
          `https://lmsapp-plvj.onrender.com/admin/allClass/subjects/contents/getAll/${id}`,
          {
            headers: {
              "x-admin-token": token,
            },
            params: {
              contentType: filterContentType, // Add the filter for content type
            },
          }
        );
        if (response.data.status) {
          setContentData(response.data.data);
          setFilteredData(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching content:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, [id, filterContentType]); // Re-fetch content when filter changes

  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = contentData.filter((content) =>
      content.title.toLowerCase().includes(query)
    );
    setFilteredData(filtered);
  };

  const handleDialogOpen = (type, url) => {
    let embedUrl = url;

    // Check if it's a YouTube video URL and extract the video ID
    if (type === "video" && url.includes("youtu.be")) {
      const videoId = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
      if (videoId && videoId[1]) {
        embedUrl = `https://www.youtube.com/embed/${videoId[1]}`;
      }
    }

    setDialogContent({ type, content: embedUrl });
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setDialogContent({ type: "", content: "" });
  };

  const handleViewPdf = (url) => {
    setDialogContent({ type: "pdf", content: url });
    setDialogOpen(true);
  };

  // Handle delete confirmation dialog open
  const handleDeleteClick = (id) => {
    setSelectedContentId(id);
    setOpenDeleteDialog(true);
  };

  // Handle delete teacher
  const handleDelete = async () => {
    try {
      const token = Cookies.get("token"); // Replace with your token key
      await axios.delete(
        `https://lmsapp-plvj.onrender.com/admin/allClass/subjects/contents/delete/${selectedContentId}`,
        {
          headers: {
            "x-admin-token": token,
          },
        }
      );
      setOpenDeleteDialog(false);
    } catch (error) {
      console.error("Error deleting teacher:", error);
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 2 }}>
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Content Library
          </Typography>
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search content"
            value={searchQuery}
            onChange={handleSearch}
            sx={{ backgroundColor: "white", borderRadius: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          {/* Filter for content type */}
          <FormControl variant="outlined" size="small" sx={{ marginLeft: 2 }}>
            <InputLabel>Content Type</InputLabel>
            <Select
              value={filterContentType}
              onChange={(e) => setFilterContentType(e.target.value)}
              label="Content Type"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Lecture">Lecture</MenuItem>
              <MenuItem value="Notes">Notes</MenuItem>
              <MenuItem value="DPP PDF">DPP PDF</MenuItem>
            </Select>
          </FormControl>
        </Toolbar>
      </AppBar>
      <br />
      <Grid container spacing={3}>
        {filteredData.map((content) => (
          <Grid item xs={12} sm={6} md={4} key={content._id}>
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "flex-end",
                gap: "1rem",
              }}
            >
              <IconButton onClick={() => handleDeleteClick(content._id)}>
                <DeleteIcon />
              </IconButton>
              <IconButton onClick={() => handleEditClick(content)}>
                <EditIcon />
              </IconButton>
            </div>

            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                boxShadow: 3,
                "&:hover": { boxShadow: 6, transform: "scale(1.02)" },
                transition: "0.3s",
              }}
            >
              {!["Notes", "DPP PDF"].includes(content.contentType) && (
                <CardMedia
                  component="img"
                  height="180"
                  image={content.thumbnailImg?.url}
                  alt={content.title}
                />
              )}
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {content.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Content Type: {content.contentType}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Part: {content.part}
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <AccessTimeIcon fontSize="small" />
                  <Typography variant="body2" color="text.secondary">
                    Duration: {content.duration}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1} mt={1}>
                  {content.isFreeContent ? (
                    <CheckCircleOutlineIcon color="success" />
                  ) : (
                    <LockIcon color="error" />
                  )}
                  <Typography variant="body2" color="text.secondary">
                    {content.isFreeContent ? "Free Content" : "Premium Content"}
                  </Typography>
                </Box>
              </CardContent>
              <CardActions>
                {content.videoUrl && (
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<PlayCircleOutlineIcon />}
                    onClick={() => handleDialogOpen("video", content.videoUrl)}
                  >
                    Watch Video
                  </Button>
                )}
                {(content.contentType === "Notes" ||
                  content.contentType === "DPP PDF") && (
                  <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<PictureAsPdfIcon />}
                    onClick={() => handleViewPdf(content.pdf.url)}
                  >
                    View PDF
                  </Button>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      <UpdateContentModal
        open={updateModalOpen}
        handleClose={handleCloseModal}
        content={selectedContent} // Pass selected content data
      />
      {/* Dialog for Video and PDF */}
      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
        fullWidth
        maxWidth="md"
      >
        <DialogContent>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6">
              {dialogContent.type === "video" ? "Watch Video" : "View PDF"}
            </Typography>
            <IconButton onClick={handleDialogClose}>
              <CloseIcon />
            </IconButton>
          </Box>
          {dialogContent.type === "video" ? (
            <iframe
              width="100%"
              height="400"
              src={dialogContent.content}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Video Player"
            ></iframe>
          ) : (
            <iframe
              width="100%"
              height="600"
              src={dialogContent.content}
              frameBorder="0"
              title="PDF Viewer"
            ></iframe>
          )}
        </DialogContent>
      </Dialog>
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this Content? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenDeleteDialog(false)}
            color="primary"
            variant="outlined"
          >
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ContentDisplay;
