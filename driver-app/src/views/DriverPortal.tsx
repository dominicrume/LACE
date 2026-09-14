import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function DriverPortal() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [collected, setCollected] = useState(false);

  const handleExit = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="driver-portal full-screen-view">
      <button className="btn-exit" onClick={handleExit}>&times;</button>

      <div className="driver-map-sim">
        <div className="route-path"></div>
        <div className="route-marker">📍 Next Stop: 42 Ladywood Rd</div>
      </div>

      <div className="driver-bottom-panel">
        <h2>Pickup: Microwave</h2>
        <p className="text-gray-400 mb-4">Resident reported item ready.</p>
        
        {!collected ? (
          <button className="btn-swipe-collect" onClick={() => setCollected(true)}>
            <div className="swipe-thumb">&rarr;</div>
            <span className="swipe-text">SWIPE TO COLLECT</span>
          </button>
        ) : (
          <div className="badge success" style={{ padding: '1rem', justifyContent: 'center' }}>
            ITEM COLLECTED ✅
          </div>
        )}
      </div>
    </div>
  );
}
