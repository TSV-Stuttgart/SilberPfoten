import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import Link from 'next/link';
import slugify from 'slugify';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';


// --- Custom Icons using L.divIcon ---
let caseIcon, messageIcon;
if (typeof window !== 'undefined') { // Ensure this runs client-side only

  // Helper function to create divIcon HTML with centered icon
  const createIconHTML = (iconClass, color) => (
    `<div style="font-size: 1.5rem; color: ${color}; text-align: center; line-height: 1;">` +
      `<i class="${iconClass}"></i>` +
    `</div>`
  );

  const iconSize = [24, 24]; // Approx size in pixels, adjust as needed
  const iconAnchor = [12, 12]; // Point of the icon which will correspond to marker's location
  const popupAnchor = [0, -12]; // Point from which the popup should open relative to the iconAnchor

  caseIcon = L.divIcon({
    html: createIconHTML('bi bi-megaphone-fill', 'var(--bs-danger)'),
    className: '', // Important to override default leaflet-div-icon styles if needed
    iconSize: iconSize,
    iconAnchor: iconAnchor,
    popupAnchor: popupAnchor
  });

  messageIcon = L.divIcon({
    html: createIconHTML('bi bi-envelope-fill', 'rgb(144, 70, 132)'),
    className: '',
    iconSize: iconSize,
    iconAnchor: iconAnchor,
    popupAnchor: popupAnchor
  });
}
// --- End Custom Icons ---

// --- Circle Styles ---
const OBFUSCATION_RADIUS_METERS = 250;
const caseCircleOptions = {
  color: 'var(--bs-danger)',
  fillColor: 'var(--bs-danger)',
  fillOpacity: 0.1,
  weight: 0.5
};
const messageCircleOptions = {
  color: 'rgb(144, 70, 132)',
  fillColor: 'rgb(144, 70, 132)',
  fillOpacity: 0.1,
  weight: 0.5
};
// --- End Circle Styles ---

// Define the zoom level threshold for showing circles
const MIN_ZOOM_FOR_CIRCLES = 14;

// Helper component to listen for map events (zoom changes, load)
// Updates the parent component's state with the current zoom level.
function MapEvents({ setZoomLevel }) {
  const map = useMapEvents({
    zoomend: () => {
      setZoomLevel(map.getZoom());
    },
    load: () => { // Also set initial zoom level on map load
      setZoomLevel(map.getZoom());
    },
  });
  return null; // This component doesn't render anything visual
}

const CaseMap = ({ messages, initialCenter = [48.7758, 9.1829], initialZoom = 11 }) => {
  const [currentZoom, setCurrentZoom] = useState(initialZoom);

  // Basic check to prevent rendering errors if messages aren't loaded yet
  if (!messages || messages.length === 0) {
    return null;
  }

  // Fallback center coordinates if props are invalid
  const center = Array.isArray(initialCenter) && initialCenter.length === 2 && !initialCenter.some(isNaN)
    ? initialCenter
    : [48.7758, 9.1829]; // Fallback to Stuttgart center

  return (
    // Ensure MapContainer is only rendered client-side, although dynamic import helps
    <MapContainer center={center} zoom={initialZoom} style={{ height: '400px', width: '100%' }}>
      {/* Base map tiles */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />

      {/* Component to update zoom state */}
      <MapEvents setZoomLevel={setCurrentZoom} />

      {/* Render obfuscation circles ONLY when zoomed in enough */}
      {currentZoom >= MIN_ZOOM_FOR_CIRCLES && messages.map((message) => {
        const isCase = message.message_type === 'case';
        const circleOptions = isCase ? caseCircleOptions : messageCircleOptions;
        // Ensure coordinates are filled before rendering circle
        return message.obfuscatedLat != null && message.obfuscatedLon != null && (
          <Circle
            key={`circle-${message.message_id}`}
            center={[message.obfuscatedLat, message.obfuscatedLon]}
            radius={OBFUSCATION_RADIUS_METERS}
            pathOptions={circleOptions}
          />
        );
      })}

      {/* Cluster group for markers */}
      <MarkerClusterGroup showCoverageOnHover={false}>
        {messages.map((message) => {
          const isCase = message.message_type === 'case';
          const icon = isCase ? caseIcon : messageIcon;
          // Render marker only if coordinates and icon are valid
          return message.obfuscatedLat != null && message.obfuscatedLon != null && icon && (
            <Marker
              key={message.message_id}
              position={[message.obfuscatedLat, message.obfuscatedLon]}
              icon={icon}
            >
              <Popup>
                <b>{message.subject}</b><br /><br />
                <Link href={`/message/${message.message_id}/${slugify(message.subject, { lower: true })}`}>
                  Details anzeigen
                </Link>
              </Popup>
            </Marker>
          );
        })}
      </MarkerClusterGroup>

    </MapContainer>
  );
};

export default CaseMap; 