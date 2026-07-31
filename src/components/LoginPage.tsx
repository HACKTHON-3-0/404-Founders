import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import { loginUser } from '../services/auth';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const success = loginUser(email.trim(), password);
    if (success) {
      navigate('/dashboard');
    } else {
      setError('Unable to log in. Check your email and password.');
    }
  };

  return (
    <Box sx={{ maxWidth: 420, mx: 'auto', mt: 8, px: 3 }}>
      <Typography component="h1" variant="h4" gutterBottom>
        Smart Wheelchair Login
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          fullWidth
          margin="normal"
          inputProps={{ 'aria-label': 'Email' }}
        />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          fullWidth
          margin="normal"
          inputProps={{ 'aria-label': 'Password' }}
        />
        <Button type="submit" variant="contained" color="primary" size="large" fullWidth sx={{ mt: 3 }}>
          Sign In
        </Button>
      </Box>
      <Typography sx={{ mt: 3, fontSize: '0.95rem' }}>
        Don't have an account? <Link to="/register">Register here</Link>
      </Typography>
    </Box>
  );
}
