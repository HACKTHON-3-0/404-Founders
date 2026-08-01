import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';

type FallAlertWidgetProps = {
  alert: boolean;
  onToggle: () => void;
};

export default function FallAlertWidget({ alert, onToggle }: FallAlertWidgetProps) {
  return (
    <Box>
      <Alert severity={alert ? 'error' : 'success'} sx={{ mb: 2, fontWeight: 700 }}>
        {alert ? 'FALL DETECTED! Check the wheelchair immediately.' : 'No fall detected. System is stable.'}
      </Alert>
      <Button
        variant="contained"
        color={alert ? 'secondary' : 'success'}
        onClick={onToggle}
        fullWidth
        size="large"
        aria-label={alert ? 'Clear fall alert' : 'Simulate fall alert'}
      >
        {alert ? 'Clear Alert' : 'Simulate Fall' }
      </Button>
    </Box>
  );
}
