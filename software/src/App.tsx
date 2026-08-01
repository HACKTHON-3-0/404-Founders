import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import DashboardPage from './components/DashboardPage';
import { getSessionUser } from './services/auth';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#4f46e5' },
    secondary: { main: '#14b8a6' },
    background: { default: '#f5f7ff', paper: '#ffffff' },
  },
  shape: { borderRadius: 18 },
  typography: {
    fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 999,
          boxShadow: 'none',
          fontWeight: 600,
          px: 2.2,
          py: 1.1,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 18px 45px rgba(15, 23, 42, 0.06)',
          border: '1px solid rgba(15, 23, 42, 0.05)',
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
    },
  },
});

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const user = getSessionUser();
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8faff 0%, #eef4ff 100%)' }}>
        <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 }, px: { xs: 2, md: 4 } }}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
