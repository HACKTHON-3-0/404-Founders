import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import { registerUser } from '../services/auth';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim() || !password) {
      setError('Email and password are required.');
      return;
    }
    if (!displayName.trim()) {
      setError('Display name is required.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    const success = registerUser(email.trim(), password, displayName.trim());
    if (success) {
      navigate('/dashboard');
    } else {
      setError('Account already exists for this email.');
    }
  };

  return (
    <Box sx={{ maxWidth: 480, mx: 'auto', py: { xs: 4, md: 8 }, px: { xs: 1, md: 3 } }}>
      <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 4, background: 'rgba(255,255,255,0.9)' }}>
        <Stack spacing={2.5} alignItems="flex-start">
          <Avatar sx={{ width: 56, height: 56, bgcolor: 'secondary.main' }}>
            <PersonAddAltOutlinedIcon />
          </Avatar>
          <Box>
            <Typography component="h1" variant="h4" sx={{ fontWeight: 700 }}>
              Create your account
            </Typography>
            <Typography sx={{ color: 'text.secondary', mt: 0.75 }}>
              Set up your profile and start using the wheelchair dashboard smoothly.
            </Typography>
          </Box>
          {error && (
            <Alert severity="error" sx={{ width: '100%' }}>
              {error}
            </Alert>
          )}
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%' }}>
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              fullWidth
              margin="normal"
              autoComplete="email"
              inputProps={{ 'aria-label': 'Email' }}
            />
            <TextField
              label="Display Name"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              required
              fullWidth
              margin="normal"
              helperText="Your username will be created automatically from your email."
              inputProps={{ 'aria-label': 'Display Name' }}
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              fullWidth
              margin="normal"
              autoComplete="new-password"
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
              autoComplete="new-password"
              inputProps={{ 'aria-label': 'Confirm Password' }}
            />
            <Button type="submit" variant="contained" color="primary" size="large" fullWidth sx={{ mt: 2.5 }}>
              Register
            </Button>
          </Box>
          <Typography sx={{ fontSize: '0.95rem', color: 'text.secondary' }}>
            Already have an account? <Link to="/login">Sign in</Link>
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}
