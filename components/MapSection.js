import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css'


// Dynamically import the actual map rendering component
const MapComponent = dynamic(() => import('../components/CaseMap'), {
  ssr: false,
  loading: () => <p>Karte wird geladen...</p>
});


const MapSection = ({ messages }) => {
  const mapMessages = useMemo(() => {
    if (!messages) return [];
    return messages
      .filter(m => m.lat != null && m.lon != null);
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