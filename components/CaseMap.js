import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet'; // Import Leaflet library
import Link from 'next/link';
import slugify from 'slugify';
import MarkerClusterGroup from 'react-leaflet-markercluster'; // Import cluster group
import 'leaflet.markercluster/dist/MarkerCluster.css'; // <-- Import base library CSS
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'; // <-- Import base library Default CSS


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
    html: createIconHTML('bi bi-megaphone-fill', 'var(--bs-danger)'), // Use Bootstrap danger color variable
    className: '', // Important to override default leaflet-div-icon styles if needed
    iconSize: iconSize,
    iconAnchor: iconAnchor,
    popupAnchor: popupAnchor
  });

  messageIcon = L.divIcon({
    html: createIconHTML('bi bi-envelope-fill', 'rgb(144, 70, 132)'), // Specific purple color
    className: '',
    iconSize: iconSize,
    iconAnchor: iconAnchor,
    popupAnchor: popupAnchor
  });
}
// --- End Custom Icons ---

// --- Circle Styles ---
const OBFUSCATION_RADIUS_METERS = 0;
const caseCircleOptions = {
  color: 'var(--bs-danger)',       // Outline color (Bootstrap danger)
  fillColor: 'var(--bs-danger)',   // Fill color (Bootstrap danger)
  fillOpacity: 0.1,             // Make fill semi-transparent
  weight: 0.5                     // Outline thickness
};
const messageCircleOptions = {
  color: 'rgb(144, 70, 132)',    // Outline color (Purple)
  fillColor: 'rgb(144, 70, 132)', // Fill color (Purple)
  fillOpacity: 0.1,              // Make fill semi-transparent
  weight: 0.5                      // Outline thickness
};
// --- End Circle Styles ---

const CaseMap = ({ messages, initialCenter = [48.7758, 9.1829], initialZoom = 11 }) => { // Default center Stuttgart
  if (!messages || messages.length === 0) {
    // Don't render anything if there are no messages to show, instead of showing a message.
    // The parent component might handle loading/empty states.
    return null;
  }

  // Ensure initialCenter has valid numbers, fallback if not
  const center = Array.isArray(initialCenter) && initialCenter.length === 2 && !initialCenter.some(isNaN)
    ? initialCenter
    : [48.7758, 9.1829]; // Fallback to Stuttgart center

  return (
    // Ensure MapContainer is only rendered client-side, although dynamic import helps
    <MapContainer center={center} zoom={initialZoom} style={{ height: '400px', width: '100%' }}>
      {/* Use CartoDB Voyager Tile Layer */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" // CartoDB Voyager URL
      />

      {/* Render Circles Separately FIRST */}
      {messages.map((message) => {
        const isCase = message.message_type === 'case';
        const circleOptions = isCase ? caseCircleOptions : messageCircleOptions;
        return message.obfuscatedLat != null && message.obfuscatedLon != null && (
          <Circle
            key={`circle-${message.message_id}`} // Add key here
            center={[message.obfuscatedLat, message.obfuscatedLon]}
            radius={OBFUSCATION_RADIUS_METERS}
            pathOptions={circleOptions}
          />
        );
      })}

      {/* Wrap Markers in MarkerClusterGroup, using default icons */}
      <MarkerClusterGroup showCoverageOnHover={false}>
        {messages.map((message) => {
          const isCase = message.message_type === 'case';
          const icon = isCase ? caseIcon : messageIcon;
          return message.obfuscatedLat != null && message.obfuscatedLon != null && icon && (
            <Marker
              key={message.message_id} // Key for marker
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