import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Typography from '@mui/material/Typography';

const defaultIcon = L.icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

type MapWidgetProps = {
  coordinates: [number, number];
  status?: 'Live' | 'Saved' | 'Unavailable';
};

export default function MapWidget({ coordinates, status = 'Saved' }: MapWidgetProps) {
  return (
    <div style={{ minHeight: 360, borderRadius: 16, overflow: 'hidden', boxShadow: '0 12px 30px rgba(0,0,0,0.08)' }}>
      <MapContainer center={coordinates} zoom={14} style={{ height: '100%', minHeight: 360 }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={coordinates} icon={defaultIcon}>
          <Popup>
            Current wheelchair location: {coordinates[0].toFixed(4)}, {coordinates[1].toFixed(4)}
          </Popup>
        </Marker>
      </MapContainer>
      <Typography sx={{ mt: 1, fontSize: '0.95rem', textAlign: 'center', color: 'text.secondary' }}>
        {status === 'Live' ? 'Live GPS location update active.' : status === 'Unavailable' ? 'Location access is unavailable, showing the last known position.' : 'Showing your saved location for the current session.'}
      </Typography>
    </div>
  );
}
