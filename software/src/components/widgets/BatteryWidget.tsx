import React from 'react';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';

type BatteryWidgetProps = {
  percentage: number;
};

export default function BatteryWidget({ percentage }: BatteryWidgetProps) {
  const statusColor = percentage > 50 ? 'success' : percentage > 20 ? 'warning' : 'error';
  const label = percentage > 50 ? 'Good' : percentage > 20 ? 'Low' : 'Critical';

  return (
    <Box>
      <Typography variant="h5" component="div" sx={{ fontWeight: 700, mb: 1 }}>
        {percentage}%
      </Typography>
      <LinearProgress variant="determinate" value={percentage} color={statusColor} sx={{ height: 14, borderRadius: 8 }} />
      <Typography sx={{ mt: 1, fontSize: '0.95rem' }}>{label} battery level</Typography>
    </Box>
  );
}
