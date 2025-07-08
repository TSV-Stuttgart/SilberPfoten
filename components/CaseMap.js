import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import Link from 'next/link';
import slugify from 'slugify';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';


let caseIcon, messageIcon;
if (typeof window !== 'undefined') {

  const createIconHTML = (iconClass, color) => (
    `<div style="font-size: 1.5rem; color: ${color}; text-align: center; line-height: 1;">` +
      `<i class="${iconClass}"></i>` +
    `</div>`
  );

  const iconSize = [24, 24];
  const iconAnchor = [12, 12];
  const popupAnchor = [0, -12];

  caseIcon = L.divIcon({
    html: createIconHTML('bi bi-megaphone-fill', 'var(--bs-danger)'),
    className: '', // important to override default leaflet-div-icon styles if needed
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

const AREA_RADIUS_METERS = 1000;
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

const MIN_ZOOM_FOR_CIRCLES = 14;

// helper component to listen for map events (zoom changes, load)
// updates the parent component's state with the current zoom level.
function MapEvents({ setZoomLevel }) {
  const map = useMapEvents({
    zoomend: () => {
      setZoomLevel(map.getZoom());
    },
    load: () => {
      setZoomLevel(map.getZoom());
    },
  });
  return null;
}

const CaseMap = ({ messages, initialCenter = [48.7758, 9.1829], initialZoom = 11 }) => {
  const [currentZoom, setCurrentZoom] = useState(initialZoom);

  if (!messages || messages.length === 0) {
    return null;
  }

  const stuttgartCenter = [48.7758, 9.1829];
  const center = Array.isArray(initialCenter) && initialCenter.length === 2 && !initialCenter.some(isNaN)
    ? initialCenter
    : stuttgartCenter;

  return (
    <MapContainer center={center} zoom={initialZoom} style={{ height: '400px', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />

      <MapEvents setZoomLevel={setCurrentZoom} />

      {currentZoom >= MIN_ZOOM_FOR_CIRCLES && messages.map((message) => {
        const isCase = message.message_type === 'case';
        const circleOptions = isCase ? caseCircleOptions : messageCircleOptions;

        return message.lat != null && message.lon != null && (
          <Circle
            key={`circle-${message.message_id}`}
            center={[message.lat, message.lon]}
            radius={AREA_RADIUS_METERS}
            pathOptions={circleOptions}
          />
        );
      })}

      <MarkerClusterGroup showCoverageOnHover={false}>
        {messages.map((message) => {
          const isCase = message.message_type === 'case';
          const icon = isCase ? caseIcon : messageIcon;

          return message.lat != null && message.lon != null && icon && (
            <Marker
              key={message.message_id}
              position={[message.lat, message.lon]}
              icon={icon}
            >
              <Popup>
                <h5>{message.subject}</h5>
                <Link 
                  href={`/message/${message.message_id}/${slugify(message.subject, { lower: true })}`}
                  legacyBehavior
                >
                  <a className="fw-normal text-decoration-underline mt-2 cursor-pointer text-dark">Details anzeigen</a>
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