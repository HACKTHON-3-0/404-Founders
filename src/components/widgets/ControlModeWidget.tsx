import React from 'react';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';

type ControlModeWidgetProps = {
  value: 'eye' | 'joystick';
  onChange: (value: 'eye' | 'joystick') => void;
};

export default function ControlModeWidget({ value, onChange }: ControlModeWidgetProps) {
  const handleModeChange = (_event: React.MouseEvent<HTMLElement>, nextMode: 'eye' | 'joystick' | null) => {
    if (nextMode) onChange(nextMode);
  };

  return (
    <>
      <Typography sx={{ mb: 2 }}>Choose the active control mode for the wheelchair.</Typography>
      <ToggleButtonGroup
        value={value}
        exclusive
        onChange={handleModeChange}
        aria-label="Control mode selection"
        fullWidth
      >
        <ToggleButton value="eye" aria-label="Eye-based control" sx={{ py: 3, fontSize: '1rem' }}>
          Eye-based Control
        </ToggleButton>
        <ToggleButton value="joystick" aria-label="Joystick-based control" sx={{ py: 3, fontSize: '1rem' }}>
          Joystick-based Control
        </ToggleButton>
      </ToggleButtonGroup>
    </>
  );
}
