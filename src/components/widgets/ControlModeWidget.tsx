import React from 'react';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

type ControlModeWidgetProps = {
  value: 'eye' | 'joystick';
  onChange: (value: 'eye' | 'joystick') => void;
};

export default function ControlModeWidget({ value, onChange }: ControlModeWidgetProps) {
  const handleModeChange = (_event: React.MouseEvent<HTMLElement>, nextMode: 'eye' | 'joystick' | null) => {
    if (nextMode) onChange(nextMode);
  };

  return (
    <Stack spacing={2}>
      <Typography sx={{ color: 'text.secondary' }}>Choose the active control mode for the wheelchair.</Typography>
      <ToggleButtonGroup
        value={value}
        exclusive
        onChange={handleModeChange}
        aria-label="Control mode selection"
        fullWidth
        sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}
      >
        <ToggleButton value="eye" aria-label="Eye-based control" sx={{ py: 2.5, fontSize: '0.95rem', borderRadius: 3 }}>
          Eye-based Control
        </ToggleButton>
        <ToggleButton value="joystick" aria-label="Joystick-based control" sx={{ py: 2.5, fontSize: '0.95rem', borderRadius: 3 }}>
          Joystick-based Control
        </ToggleButton>
      </ToggleButtonGroup>
    </Stack>
  );
}
