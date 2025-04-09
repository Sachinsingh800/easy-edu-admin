import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Cookies from 'js-cookie'
import { 
  Container,
  Typography,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material'
import { AdminPanelSettings, Email, DateRange } from '@mui/icons-material'

const AdminProfile = () => {
  const [profileData, setProfileData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchProfile = async () => {
      try {
         const token = Cookies.get("token");
        const response = await axios.get(
          'https://lmsapp-plvj.onrender.com/admin/auth/profile',
          {
            headers: {
              'x-admin-token': token
            }
          }
        )

        if (response.data.status) {
          setProfileData(response.data.data)
        }
      } catch (err) {
        setError('Failed to fetch profile data')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }
    return new Date(dateString).toLocaleDateString('en-US', options)
  }

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress size={60} />
      </Container>
    )
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    )
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Card elevation={3}>
        <CardContent>
          <Typography variant="h4" gutterBottom sx={{ 
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            mb: 3
          }}>
            <AdminPanelSettings fontSize="large" />
            Admin Profile
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <List>
                <ListItem>
                  <ListItemText
                    primary="Email"
                    secondary={profileData.email}
                    secondaryTypographyProps={{ variant: 'h6' }}
                  />
                  <Email color="action" />
                </ListItem>
                <Divider />

                <ListItem>
                  <ListItemText
                    primary="Role"
                    secondary={profileData.role}
                    secondaryTypographyProps={{ variant: 'h6' }}
                  />
                  <AdminPanelSettings color="action" />
                </ListItem>
                <Divider />
              </List>
            </Grid>

            <Grid item xs={12} md={6}>
              <List>
                <ListItem>
                  <ListItemText
                    primary="Account Created"
                    secondary={formatDate(profileData.createdAt)}
                  />
                  <DateRange color="action" />
                </ListItem>
                <Divider />

                <ListItem>
                  <ListItemText
                    primary="Last Updated"
                    secondary={formatDate(profileData.updatedAt)}
                  />
                  <DateRange color="action" />
                </ListItem>
                <Divider />
              </List>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  )
}

export default AdminProfile