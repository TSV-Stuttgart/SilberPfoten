import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet'; // Import Leaflet library
import Link from 'next/link';
import slugify from 'slugify';

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
const OBFUSCATION_RADIUS_METERS = 750;
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
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {messages.map((message) => {
        // Determine icon and circle style based on message_type
        const isCase = message.message_type === 'case';
        const icon = isCase ? caseIcon : messageIcon;
        const circleOptions = isCase ? caseCircleOptions : messageCircleOptions;

        // Render only if coordinates are valid and icons have been created (client-side)
        return message.obfuscatedLat != null && message.obfuscatedLon != null && icon && (
          <React.Fragment key={message.message_id}>
            {/* Render the obfuscation circle with appropriate style */}
            <Circle
              center={[message.obfuscatedLat, message.obfuscatedLon]}
              radius={OBFUSCATION_RADIUS_METERS}
              pathOptions={circleOptions} // Use dynamic options
            />
            {/* Render the marker with the appropriate custom icon */}
            <Marker
              position={[message.obfuscatedLat, message.obfuscatedLon]}
              icon={icon} // Use dynamic icon
             >
              <Popup>
                <b>{message.subject}</b><br /><br />
                <Link href={`/message/${message.message_id}/${slugify(message.subject, { lower: true })}`}>
                  Details anzeigen
                </Link>
              </Popup>
            </Marker>
          </React.Fragment>
         );
      })}
    </MapContainer>
  );
};

export default CaseMap; 