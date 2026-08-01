import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
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
  const [medications, setMedications] = useState<Medication[]>(() => {
    const storedMedications = loadMedications();
    return storedMedications.length > 0 ? storedMedications : initialMedications;
  });
  const [newMedName, setNewMedName] = useState('');
  const [newMedTime, setNewMedTime] = useState('');
  const [fallAlert, setFallAlert] = useState(loadFallAlert());
  const [gpsCoords, setGpsCoords] = useState<[number, number]>(loadGpsCoords());
  const [batteryPct, setBatteryPct] = useState<number>(loadBatteryPct());
  const [locationStatus, setLocationStatus] = useState<'Live' | 'Saved' | 'Unavailable'>('Saved');

  useEffect(() => {
    const storedMedications = loadMedications();
    if (storedMedications.length === 0) {
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
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      const handlePosition = (position: GeolocationPosition) => {
        setGpsCoords([position.coords.latitude, position.coords.longitude]);
        setLocationStatus('Live');
      };

      const handleError = () => {
        setLocationStatus('Unavailable');
      };

      navigator.geolocation.getCurrentPosition(handlePosition, handleError, {
        enableHighAccuracy: true,
        timeout: 8000,
      });

      const watchId = navigator.geolocation.watchPosition(handlePosition, handleError, {
        enableHighAccuracy: true,
        timeout: 8000,
      });

      return () => navigator.geolocation.clearWatch(watchId);
    }

    return undefined;
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setBatteryPct((current) => Math.max(0, current - 1));
    }, 7000);
    return () => window.clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  const addMedication = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = newMedName.trim();
    const trimmedTime = newMedTime.trim();

    if (!trimmedName || !trimmedTime) {
      return;
    }

    const nextMedication: Medication = {
      id: `${Date.now()}`,
      name: trimmedName,
      time: trimmedTime,
      taken: false,
    };

    setMedications((prev) => [...prev, nextMedication]);
    setNewMedName('');
    setNewMedTime('');
  };

  const acknowledgeMedication = (id: string) => {
    setMedications((prev) => prev.map((item) => (item.id === id ? { ...item, taken: true } : item)));
  };

  const removeMedication = (id: string) => {
    setMedications((prev) => prev.filter((item) => item.id !== id));
  };

  const toggleFallAlert = () => {
    setFallAlert((prev) => !prev);
  };

  const mapCoords = useMemo(() => gpsCoords, [gpsCoords]);
  const recommendedMedication = useMemo(() => {
    const hour = new Date().getHours();
    const timeWindow = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
    const match = medications.find((item) => item.name.toLowerCase().includes(timeWindow));
    return match ?? medications.find((item) => !item.taken) ?? medications[0];
  }, [medications]);

  return (
    <Box>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3 },
          mb: 3,
          borderRadius: 4,
          background: 'linear-gradient(135deg, rgba(79,70,229,0.08) 0%, rgba(20,184,166,0.08) 100%)',
          border: '1px solid rgba(79,70,229,0.12)',
        }}
      >
        <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between" spacing={2}>
          <Box>
            <Typography component="h1" variant="h4" sx={{ fontWeight: 700 }}>
              Wheelchair Dashboard
            </Typography>
            <Typography sx={{ color: 'text.secondary', mt: 0.75 }}>
              Welcome back, {user ?? 'User'}. Your environment and assistive controls are ready to go.
            </Typography>
          </Box>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25} alignItems={{ xs: 'stretch', sm: 'center' }}>
            <Chip label={locationStatus === 'Live' ? 'Live location' : 'Location saved'} color={locationStatus === 'Live' ? 'primary' : 'default'} size="small" />
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
        </Stack>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: { xs: 2, md: 2.5 }, height: '100%', borderRadius: 4 }} elevation={0}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Current Location
              </Typography>
              <Chip label={locationStatus} size="small" color={locationStatus === 'Live' ? 'success' : locationStatus === 'Unavailable' ? 'warning' : 'default'} />
            </Stack>
            <Divider sx={{ mb: 2 }} />
            <MapWidget coordinates={mapCoords} status={locationStatus} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            <Paper sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 4 }} elevation={0}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Battery Status
              </Typography>
              <BatteryWidget percentage={batteryPct} />
            </Paper>
            <Paper sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 4 }} elevation={0}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Fall Detection
              </Typography>
              <FallAlertWidget alert={fallAlert} onToggle={toggleFallAlert} />
            </Paper>
          </Stack>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 4 }} elevation={0}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
              Medication Reminders
            </Typography>
            <Box
              sx={{
                mb: 2,
                p: 2,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #eef2ff 0%, #f5f3ff 100%)',
                border: '1px solid rgba(79,70,229,0.12)',
              }}
            >
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ xs: 'flex-start', sm: 'center' }}>
                <Chip label="Recommended now" color="primary" size="small" />
                <Typography variant="body1" sx={{ fontWeight: 700 }}>
                  {recommendedMedication?.name ?? 'No medications yet'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {recommendedMedication ? `Scheduled at ${recommendedMedication.time}` : 'Add a reminder to get started.'}
                </Typography>
              </Stack>
            </Box>
            <Box component="form" onSubmit={addMedication} sx={{ mb: 2 }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="Medication name"
                  value={newMedName}
                  onChange={(event) => setNewMedName(event.target.value)}
                  fullWidth
                  size="small"
                />
                <TextField
                  label="Time"
                  value={newMedTime}
                  onChange={(event) => setNewMedTime(event.target.value)}
                  fullWidth
                  size="small"
                />
                <Button type="submit" variant="contained">
                  Add
                </Button>
              </Stack>
            </Box>
            <MedicationWidget
              medications={medications}
              onAcknowledge={acknowledgeMedication}
              onRemove={removeMedication}
            />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 4 }} elevation={0}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Control Mode
            </Typography>
            <ControlModeWidget value={controlMode} onChange={setControlMode} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
