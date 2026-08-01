import React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import DeleteIcon from '@mui/icons-material/Delete';
import { Medication } from '../../services/storage';

type MedicationWidgetProps = {
  medications: Medication[];
  onAcknowledge: (id: string) => void;
  onRemove: (id: string) => void;
};

export default function MedicationWidget({ medications, onAcknowledge, onRemove }: MedicationWidgetProps) {
  return (
    <List disablePadding>
      {medications.map((item) => (
        <ListItem
          key={item.id}
          sx={{
            mb: 1.25,
            borderRadius: 3,
            bgcolor: item.taken ? 'success.light' : 'background.paper',
            border: '1px solid',
            borderColor: item.taken ? 'success.main' : 'divider',
            boxShadow: 1,
            px: 2,
            py: 1,
          }}
        >
          <ListItemText
            primary={item.name}
            secondary={`Schedule: ${item.time}`}
            primaryTypographyProps={{ fontWeight: 700 }}
          />
          <ListItemSecondaryAction sx={{ right: 8, top: '50%', transform: 'translateY(-50%)' }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'stretch', sm: 'center' }}>
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
              <IconButton edge="end" aria-label={`Remove medication ${item.name}`} onClick={() => onRemove(item.id)} sx={{ alignSelf: { xs: 'flex-end', sm: 'center' } }}>
                <DeleteIcon />
              </IconButton>
            </Stack>
          </ListItemSecondaryAction>
        </ListItem>
      ))}
      {medications.length === 0 && (
        <Typography sx={{ mt: 2 }}>No medication reminders are active right now.</Typography>
      )}
    </List>
  );
}
