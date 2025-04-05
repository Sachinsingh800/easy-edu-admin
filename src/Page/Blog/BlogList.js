import React, { useState, useEffect } from 'react';
import { 
  Container,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  IconButton,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Skeleton,
  Divider,
  Chip,
  Box
} from '@mui/material';
import { 
  EditNoteOutlined, 
  DeleteOutlineOutlined,
  PostAddOutlined,
  ArticleOutlined
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import VisibilityIcon from '@mui/icons-material/Visibility';

const BlogList = () => {
  const [blogData, setBlogData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { categoryId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlogData = async () => {
      try {
        const response = await fetch(
          `https://lmsapp-plvj.onrender.com/admin/blog/getAll/${categoryId}`
        );
        if (!response.ok) throw new Error('Failed to fetch blog data');
        const data = await response.json();
        data.status ? setBlogData(data.data) : setError(data.message);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogData();
  }, [categoryId]);

  const handleDeleteBlog = async () => {
    setDeleteLoading(true);
    try {
      const response = await fetch(
        `https://lmsapp-plvj.onrender.com/admin/blog/delete/${selectedBlog._id}`,
        { method: 'DELETE' }
      );
      if (!response.ok) throw new Error('Delete failed');
      setBlogData(prev => prev.filter(blog => blog._id !== selectedBlog._id));
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleteLoading(false);
      setOpenDeleteDialog(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Skeleton variant="rectangular" width={200} height={40} sx={{ mb: 3 }} />
        {[...Array(5)].map((_, i) => (
          <Box key={i} sx={{ mb: 2 }}>
            <Skeleton variant="rounded" height={80} />
          </Box>
        ))}
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
          action={
            <Button 
              color="inherit" 
              size="small"
              onClick={() => window.location.reload()}
            >
              RETRY
            </Button>
          }
        >
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 4
      }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          Blog Management
          <Chip 
            label={`Category ID: ${categoryId}`}
            variant="outlined"
            size="small"
            sx={{ ml: 2, color: 'text.secondary' }}
          />
        </Typography>
        <Button
          variant="contained"
          startIcon={<PostAddOutlined />}
          onClick={() => navigate(`/dashboard/blogs/${categoryId}`)}
          sx={{ borderRadius: 2, px: 3, py: 1 }}
        >
          New Blog Post
        </Button>
      </Box>

      {blogData.length === 0 ? (
        <Box sx={{ 
          textAlign: 'center', 
          p: 8,
          border: '1px dashed',
          borderColor: 'divider',
          borderRadius: 2
        }}>
          <ArticleOutlined sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No blog posts found in this category
          </Typography>
        </Box>
      ) : (
        <List disablePadding>
          {blogData.map((blog) => (
            <React.Fragment key={blog._id}>
              <ListItem 
                sx={{
                  py: 3,
                  px: 4,
                  transition: '0.3s',
                  '&:hover': {
                    bgcolor: 'action.hover',
                    transform: 'translateX(4px)'
                  }
                }}
                secondaryAction={
                  <>
                    <IconButton
                      edge="end"
                      onClick={() => navigate(`/dashboard/blog/${blog.customLink}`)}
                      sx={{ mr: 1 }}
                    >
                      <VisibilityIcon color="primary" />
                    </IconButton>
                  </>
                }
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <ArticleOutlined />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography 
                      variant="subtitle1" 
                      sx={{ 
                        fontWeight: 600, 
                        cursor: 'pointer',
                        mb: 0.5,
                        '&:hover': { color: 'primary.main' }
                      }}
                    >
                      {blog.blogName}
                    </Typography>
                  }
                />
              </ListItem>
              <Divider variant="middle" />
            </React.Fragment>
          ))}
        </List>
      )}

      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{selectedBlog?.blogName}"? 
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleDeleteBlog} 
            color="error"
            disabled={deleteLoading}
            startIcon={deleteLoading && <CircularProgress size={20} />}
          >
            {deleteLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BlogList;