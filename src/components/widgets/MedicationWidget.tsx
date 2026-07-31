import React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import { Medication } from '../../services/storage';

type MedicationWidgetProps = {
  medications: Medication[];
  onAcknowledge: (id: string) => void;
};

export default function MedicationWidget({ medications, onAcknowledge }: MedicationWidgetProps) {
  return (
    <List disablePadding>
      {medications.map((item) => (
        <ListItem key={item.id} sx={{ mb: 1, borderRadius: 2, bgcolor: 'background.paper' }}>
          <ListItemText
            primary={item.name}
            secondary={`Schedule: ${item.time}`}
            primaryTypographyProps={{ fontWeight: 700 }}
          />
          <ListItemSecondaryAction>
            {item.taken ? (
              <Chip label="Taken" color="success" size="small" />
            ) : (
              <Button
                variant="contained"
                color="primary"
                size="small"
                onClick={() => onAcknowledge(item.id)}
                aria-label={`Acknowledge medication ${item.name}`}
              >
                Acknowledge
              </Button>
            )}
          </ListItemSecondaryAction>
        </ListItem>
      ))}
      {medications.length === 0 && (
        <Typography sx={{ mt: 2 }}>No medication reminders are active right now.</Typography>
      )}
    </List>
  );
}
