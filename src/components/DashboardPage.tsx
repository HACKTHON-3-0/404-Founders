import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import LogoutIcon from '@mui/icons-material/Logout';
import { logoutUser, getSessionUser } from '../services/auth';
import {
  loadControlMode,
  saveControlMode,
  loadMedications,
  saveMedications,
  loadFallAlert,
  saveFallAlert,
  loadGpsCoords,
  saveGpsCoords,
  loadBatteryPct,
  saveBatteryPct,
  Medication,
} from '../services/storage';
import MapWidget from './widgets/MapWidget';
import BatteryWidget from './widgets/BatteryWidget';
import MedicationWidget from './widgets/MedicationWidget';
import FallAlertWidget from './widgets/FallAlertWidget';
import ControlModeWidget from './widgets/ControlModeWidget';

const initialMedications: Medication[] = [
  { id: '1', name: 'Morning Insulin', time: '08:00 AM', taken: false },
  { id: '2', name: 'Pain Relief', time: '12:30 PM', taken: false },
  { id: '3', name: 'Evening Vitamin D', time: '07:00 PM', taken: false },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const user = getSessionUser();
  const [controlMode, setControlMode] = useState<'eye' | 'joystick'>(loadControlMode());
  const [medications, setMedications] = useState<Medication[]>(loadMedications() || initialMedications);
  const [fallAlert, setFallAlert] = useState(loadFallAlert());
  const [gpsCoords, setGpsCoords] = useState<[number, number]>(loadGpsCoords());
  const [batteryPct, setBatteryPct] = useState<number>(loadBatteryPct());

  useEffect(() => {
    if (!localStorage.getItem('wheelchair:medications')) {
      saveMedications(initialMedications);
      setMedications(initialMedications);
    }
  }, []);

  useEffect(() => {
    saveControlMode(controlMode);
  }, [controlMode]);

  useEffect(() => {
    saveMedications(medications);
  }, [medications]);

  useEffect(() => {
    saveFallAlert(fallAlert);
  }, [fallAlert]);

  useEffect(() => {
    saveGpsCoords(gpsCoords);
  }, [gpsCoords]);

  useEffect(() => {
    saveBatteryPct(batteryPct);
  }, [batteryPct]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setBatteryPct((current) => Math.max(0, current - 1));
      setGpsCoords(([lat, lng]) => [lat + 0.00005, lng - 0.00005]);
    }, 7000);
    return () => window.clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  const acknowledgeMedication = (id: string) => {
    setMedications((prev) => prev.map((item) => (item.id === id ? { ...item, taken: true } : item)));
  };

  const toggleFallAlert = () => {
    setFallAlert((prev) => !prev);
  };

  const mapCoords = useMemo(() => gpsCoords, [gpsCoords]);

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3} spacing={2}>
        <Box>
          <Typography component="h1" variant="h4" gutterBottom>
            Wheelchair Dashboard
          </Typography>
          <Typography sx={{ color: 'text.secondary' }}>
            Welcome back, {user ?? 'User'}. Monitor your environment and control preferences below.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          size="large"
          aria-label="Logout"
        >
          Logout
        </Button>
      </Stack>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: '100%' }} elevation={3}>
            <Typography variant="h6" mb={2}>
              GPS Location
            </Typography>
            <MapWidget coordinates={mapCoords} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            <Paper sx={{ p: 2 }} elevation={3}>
              <Typography variant="h6" mb={2}>
                Battery Status
              </Typography>
              <BatteryWidget percentage={batteryPct} />
            </Paper>
            <Paper sx={{ p: 2 }} elevation={3}>
              <Typography variant="h6" mb={2}>
                Fall Detection
              </Typography>
              <FallAlertWidget alert={fallAlert} onToggle={toggleFallAlert} />
            </Paper>
          </Stack>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }} elevation={3}>
            <Typography variant="h6" mb={2}>
              Medication Reminders
            </Typography>
            <MedicationWidget medications={medications} onAcknowledge={acknowledgeMedication} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }} elevation={3}>
            <Typography variant="h6" mb={2}>
              Control Mode
            </Typography>
            <ControlModeWidget value={controlMode} onChange={setControlMode} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
