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
        {/* Dynamic Route Clustering explicitly for Emma */}
        <div className="route-marker" style={{ top: '30%', left: '40%', opacity: 0.5, transform: 'scale(0.8)' }}>📍 Neighbor 1</div>
        <div className="route-marker" style={{ top: '70%', left: '60%', opacity: 0.5, transform: 'scale(0.8)' }}>📍 Neighbor 2</div>
        <div className="route-marker" style={{ top: '50%', left: '50%', zIndex: 10 }}>📍 Emma's House, Ladywood</div>
        
        <div style={{ position: 'absolute', top: '1rem', left: '1rem', background: 'rgba(0,0,0,0.7)', padding: '1rem', borderRadius: '12px' }}>
          <h3 style={{ color: '#10b981', margin: 0 }}>Dynamic Collection Density: High</h3>
          <p style={{ margin: 0, color: '#94a3b8' }}>Aggregating 3 pickups in Ladywood cluster</p>
        </div>
      </div>

      <div className="driver-bottom-panel">
        <h2>Pickup: Broken Toaster</h2>
        <p className="text-gray-400 mb-4">Emma reported item ready at doorstep.</p>
        
        {!collected ? (
          <button className="btn-swipe-collect" onClick={() => setCollected(true)}>
            <div className="swipe-thumb">&rarr;</div>
            <span className="swipe-text">SWIPE TO COLLECT</span>
          </button>
        ) : (
          <div className="badge success" style={{ padding: '1rem', justifyContent: 'center', fontSize: '1.2rem', width: '100%', maxWidth: '500px' }}>
            ITEM COLLECTED ✅<br/>Routing to Local Repair Hub
          </div>
        )}
      </div>
    </div>
  );
}
