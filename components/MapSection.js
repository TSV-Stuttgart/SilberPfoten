import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css'


// Dynamically import the actual map rendering component
const MapComponent = dynamic(() => import('../components/CaseMap'), {
  ssr: false,
  loading: () => <p>Karte wird geladen...</p>
});

// obfuscate coordinates to protect privacy
const obfuscateCoordinates = (lat, lon, radiusMeters = 500) => {
  if (lat == null || lon == null) return { obfuscatedLat: null, obfuscatedLon: null };

  const earthRadius = 6371000; // Earth radius in meters
  const radiusRad = radiusMeters / earthRadius;
  const randomAngle = Math.random() * 2 * Math.PI;
  const randomDistanceRad = Math.sqrt(Math.random()) * radiusRad;
  const latRad = lat * Math.PI / 180;
  const lonRad = lon * Math.PI / 180;

  const newLatRad = Math.asin(
    Math.sin(latRad) * Math.cos(randomDistanceRad) +
    Math.cos(latRad) * Math.sin(randomDistanceRad) * Math.cos(randomAngle)
  );
  const newLonRad = lonRad + Math.atan2(
    Math.sin(randomAngle) * Math.sin(randomDistanceRad) * Math.cos(latRad),
    Math.cos(randomDistanceRad) - Math.sin(latRad) * Math.sin(newLatRad)
  );

  const obfuscatedLat = newLatRad * 180 / Math.PI;
  const obfuscatedLon = newLonRad * 180 / Math.PI;

  return { obfuscatedLat, obfuscatedLon };
};

const MapSection = ({ messages }) => {
  const mapMessages = useMemo(() => {
    if (!messages) return [];
    return messages
      .filter(m => m.lat != null && m.lon != null)
      .map(m => ({
        ...m,
        ...obfuscateCoordinates(m.lat, m.lon)
      }));
  }, [messages]);

  return (
    <div className="container mt-3 mb-3">
      <div className="row">
        <div className="col-12">
          <div className="fw-bold h4">Fälle in deiner Nähe</div>
          <div className="mb-3">
            <MapComponent messages={mapMessages} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapSection; 