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
};

export default function MapWidget({ coordinates }: MapWidgetProps) {
  return (
    <div style={{ minHeight: 360, borderRadius: 12, overflow: 'hidden' }}>
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
      <Typography sx={{ mt: 1, fontSize: '0.95rem', textAlign: 'center' }}>
        Mock GPS coordinates can be updated in the simulation settings.
      </Typography>
    </div>
  );
}
