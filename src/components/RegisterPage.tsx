import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import { registerUser } from '../services/auth';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim() || !password) {
      setError('Email and password are required.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    const success = registerUser(email.trim(), password);
    if (success) {
      navigate('/dashboard');
    } else {
      setError('Account already exists for this email.');
    }
  };

  return (
    <Box sx={{ maxWidth: 420, mx: 'auto', mt: 8, px: 3 }}>
      <Typography component="h1" variant="h4" gutterBottom>
        Create an Account
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
        <TextField
          label="Confirm Password"
          type="password"
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          required
          fullWidth
          margin="normal"
          inputProps={{ 'aria-label': 'Confirm Password' }}
        />
        <Button type="submit" variant="contained" color="primary" size="large" fullWidth sx={{ mt: 3 }}>
          Register
        </Button>
      </Box>
      <Typography sx={{ mt: 3, fontSize: '0.95rem' }}>
        Already have an account? <Link to="/login">Sign in</Link>
      </Typography>
    </Box>
  );
}
