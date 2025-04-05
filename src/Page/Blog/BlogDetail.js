import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  CircularProgress,
  Alert,
  Typography,
  Chip,
  Link,
  Paper,
  Box,
  IconButton,
  useTheme
} from '@mui/material';
import styles from './BlogDetail.module.css';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const BlogDetail = () => {
  const { link } = useParams();
  const [blogData, setBlogData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    const fetchBlogDetails = async () => {
      try {
        const response = await fetch(
          `https://lmsapp-plvj.onrender.com/admin/blog/get/${link}`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch blog details');
        }
        
        const data = await response.json();
        
        if (data.status) {
          setBlogData(data.data);
        } else {
          throw new Error(data.message || 'Blog not found');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogDetails();
  }, [link]);

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        backgroundColor: theme.palette.background.default
      }}>
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert 
          severity="error" 
          sx={{ 
            borderRadius: 2,
            boxShadow: theme.shadows[2],
            '& .MuiAlert-message': { py: 2 }
          }}
        >
          <Typography variant="h6">{error}</Typography>
        </Alert>
      </Container>
    );
  }

  if (!blogData) return null;

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Box sx={{ position: 'relative', mb: 4 }}>
        <IconButton
          onClick={() => navigate(-1)}
          sx={{
            position: 'absolute',
            left: -64,
            top: 0,
            color: theme.palette.text.secondary,
            '&:hover': {
              backgroundColor: theme.palette.action.hover
            }
          }}
        >
          <ArrowBackIcon fontSize="large" />
        </IconButton>

        <IconButton
          onClick={() => navigate(`/dashboard/update-blog/${link}`)}
          sx={{
            position: 'absolute',
            right: -64,
            top: 0,
            '&:hover': {
              backgroundColor: theme.palette.primary.light,
              '& .MuiSvgIcon-root': {
                color: theme.palette.primary.contrastText
              }
            }
          }}
        >
          <EditIcon fontSize="large" />
        </IconButton>
      </Box>

      <Paper 
        elevation={4} 
        sx={{ 
          borderRadius: 4,
          overflow: 'hidden',
          transition: 'transform 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)'
          }
        }}
      >
        <Box sx={{ position: 'relative' }}>
          <img
            src={blogData.featureImage.url}
            alt="Feature"
            className={styles.featureImage}
          />
          <Chip
            label={blogData.catId.categoryName}
            sx={{
              position: 'absolute',
              top: 24,
              left: 24,
              bgcolor: 'background.paper',
              fontWeight: 700,
              fontSize: '0.875rem',
              px: 1.5,
              py: 1.5,
              boxShadow: theme.shadows[2]
            }}
          />
        </Box>

        <Box sx={{ px: { xs: 3, md: 6 }, py: 5 }}>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 700,
              mb: 3,
              color: 'text.primary',
              fontSize: { xs: '2rem', md: '2.5rem' },
              lineHeight: 1.2
            }}
          >
            {blogData.blogName}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <Typography 
              variant="subtitle1" 
              sx={{ 
                color: 'text.secondary',
                mr: 2,
                fontStyle: 'italic'
              }}
            >
              By {blogData.authorName}
            </Typography>
            <Box sx={{ 
              width: 4, 
              height: 4, 
              borderRadius: '50%', 
              bgcolor: 'text.disabled',
              mx: 1.5 
            }} />
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'text.disabled',
                letterSpacing: 0.5
              }}
            >
              {new Date(blogData.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Typography>
          </Box>

          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 600,
              mb: 3,
              color: 'text.primary',
              lineHeight: 1.4
            }}
          >
            {blogData.title}
          </Typography>

          <Typography 
            variant="subtitle1" 
            sx={{ 
              mb: 4,
              color: 'text.secondary',
              fontSize: '1.25rem',
              lineHeight: 1.6
            }}
          >
            {blogData.subtitle}
          </Typography>

          <Box 
            className={styles.content}
            sx={{
              '& h2': { 
                fontSize: '1.5rem', 
                fontWeight: 600, 
                mt: 4, 
                mb: 2 
              },
              '& p': { 
                mb: 2, 
                lineHeight: 1.8 
              },
              '& img': {
                maxWidth: '100%',
                height: 'auto',
                borderRadius: 2,
                my: 3
              }
            }}
            dangerouslySetInnerHTML={{ __html: blogData.mixContent }}
          />

          {blogData.pdfLink && (
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                mt: 4,
                bgcolor: 'background.paper',
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2
              }}
            >
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 600,
                  mb: 1.5,
                  color: 'text.primary'
                }}
              >
                Download Resource
              </Typography>
              <Link
                href={blogData.pdfLink}
                target="_blank"
                rel="noopener"
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  color: 'primary.main',
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline',
                    color: 'primary.dark'
                  }
                }}
              >
                {blogData.pdfLink}
              </Link>
            </Paper>
          )}

          <Box 
            sx={{ 
              mt: 6,
              pt: 4,
              borderTop: `1px solid ${theme.palette.divider}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              color: 'text.secondary',
              fontSize: '0.875rem'
            }}
          >
            <Typography variant="body2">
              Last updated: {new Date(blogData.updatedAt).toLocaleDateString()}
            </Typography>
            <Typography variant="body2">
              Category: {blogData.catId.categoryName}
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default BlogDetail;