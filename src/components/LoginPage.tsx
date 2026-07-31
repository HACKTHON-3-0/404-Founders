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
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
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
    <Box sx={{ maxWidth: 460, mx: 'auto', py: { xs: 4, md: 8 }, px: { xs: 1, md: 3 } }}>
      <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 4, background: 'rgba(255,255,255,0.9)' }}>
        <Stack spacing={2.5} alignItems="flex-start">
          <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main' }}>
            <SmartToyOutlinedIcon />
          </Avatar>
          <Box>
            <Typography component="h1" variant="h4" sx={{ fontWeight: 700 }}>
              Welcome back
            </Typography>
            <Typography sx={{ color: 'text.secondary', mt: 0.75 }}>
              Sign in to your smart wheelchair control hub.
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
              label="Password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              fullWidth
              margin="normal"
              autoComplete="current-password"
              inputProps={{ 'aria-label': 'Password' }}
            />
            <Button type="submit" variant="contained" color="primary" size="large" fullWidth sx={{ mt: 2.5 }}>
              Sign In
            </Button>
          </Box>
          <Typography sx={{ fontSize: '0.95rem', color: 'text.secondary' }}>
            Need an account? <Link to="/register">Create one</Link>
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}
