import React, { useState } from 'react';
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  IconButton,
  InputAdornment,
  Avatar,
  Grid,
  Divider,
  CircularProgress,
} from '@mui/material';
import { LockOutlined, PersonOutline } from '@mui/icons-material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useNavigate } from 'react-router-dom';
import styles from './Login.module.css';
import logo from "../Images/logo.png";
import Cookies from 'js-cookie';
import axios from 'axios';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false); // State to control loading indicator
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Start loading
    try {
      const response = await axios.post('https://lmsapp-plvj.onrender.com/admin/auth/logIn', {
        email: username,
        password,
      });

      if (response.data.status) {
        Cookies.set('token', response.data.token);
        navigate('/dashboard');
      } 
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Axios error (HTTP error)
        const { response } = error;
        // Set the error message
        const errorMessage = response.data.message;
        alert(errorMessage);
      } else {
        // Network error (e.g., no internet connection)
        alert("Something went wrong");
      }
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const handleClickShowPassword = () => setShowPassword(!showPassword);

  return (
    <div className={styles.main}>
      <img className={styles.logo} src={logo} height={50} width={50} title='PK Pani Wala' alt='PK Pani Wala' />
      <Container maxWidth="sm" className={styles.container}>
        <Box display="flex" flexDirection="column" alignItems="center">
          <Avatar className={styles.avatar}>
            <LockOutlined />
          </Avatar>
          <Typography variant="h5" className={styles.title}>
            Admin Login
          </Typography>
        </Box>
        <Divider variant="middle" className={styles.divider} />
        <Box component="form" onSubmit={handleSubmit} className={styles.form}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Username"
                variant="outlined"
                fullWidth
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutline />
                    </InputAdornment>
                  ),
                }}
                className={styles.input}
                disabled={loading} // Disable input while loading
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Password"
                type={showPassword ? 'text' : 'password'}
                variant="outlined"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlined />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        edge="end"
                        onClick={handleClickShowPassword}
                        aria-label="toggle password visibility"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                className={styles.input}
                disabled={loading} // Disable input while loading
              />
            </Grid>
          </Grid>
          <Button
            type="submit"
            variant="contained"
            fullWidth
            className={styles.button}
            disabled={loading} // Disable button while loading
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" /> // Show loading spinner
            ) : (
              'Login'
            )}
          </Button>
        </Box>
      </Container>
    </div>
  );
};

export default Login;
