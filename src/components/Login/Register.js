import React, { useEffect, useState } from 'react';
import { TextField, Button, Container, Typography, Box, InputAdornment, IconButton } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import axios from 'axios';
import styles from './Register.module.css';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('https://www.backend.easytripss.com/admin/auth/register', {
        email,
        password,
      });
      if (response.status === 200) {
        // Handle successful registration here (e.g., redirect to login page)
        alert('Registration successful!');
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed!');
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={styles.main}>
      <Container maxWidth="xs" className={styles.container}>
        <Typography variant="h4" className={styles.title}>Register</Typography>
        <Box component="form" onSubmit={handleSubmit} className={styles.form}>
          <TextField
            label="Email"
            type="email"
            variant="outlined"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
          />
          <TextField
            label="Password"
            type={showPassword ? 'text' : 'password'}
            variant="outlined"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    edge="end"
                    onClick={handleClickShowPassword}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            className={styles.input}
          />
          <Button type="submit" variant="contained" color="primary" fullWidth className={styles.button}>
            Register
          </Button>
        </Box>
        
      </Container>
    </div>
  );
};

export default Register;
