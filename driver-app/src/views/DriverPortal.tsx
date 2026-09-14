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
          <h3 style={{ color: '#10b981', margin: 0 }}>Smart Collection Route</h3>
          <p style={{ margin: 0, color: '#94a3b8' }}>Saving 3 car trips to the tip by collecting from Emma and 2 neighbors.</p>
        </div>
      </div>

      <div className="driver-bottom-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h2>Pickup: Broken Toaster</h2>
        <p className="text-gray-400 mb-6">Emma reported item ready at doorstep.</p>
        
        {!collected ? (
          <div style={{ position: 'relative', width: '100%', maxWidth: '400px', height: '60px', background: '#1e293b', borderRadius: '30px', overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
            <div style={{ position: 'absolute', width: '100%', textAlign: 'center', color: '#94a3b8', fontWeight: 'bold', pointerEvents: 'none' }}>
              &gt;&gt; SWIPE TO COLLECT &gt;&gt;
            </div>
            <input 
              type="range" 
              min="0" max="100" 
              defaultValue="0"
              style={{ width: '100%', height: '100%', opacity: 0, cursor: 'pointer', zIndex: 10, position: 'absolute' }}
              onChange={(e) => {
                if (parseInt(e.target.value) > 90) {
                  setCollected(true);
                }
              }}
            />
            <div style={{ width: '60px', height: '60px', background: '#3b82f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', position: 'absolute', left: 0 }}>
              <span style={{ color: '#fff', fontSize: '1.5rem' }}>🚐</span>
            </div>
          </div>
        ) : (
          <div className="badge success" style={{ padding: '1rem', justifyContent: 'center', fontSize: '1.2rem', width: '100%', maxWidth: '500px', textAlign: 'center' }}>
            ITEM COLLECTED ✅<br/><span style={{ fontSize: '0.9rem', color: '#fff' }}>Items collected are sent directly to the local repair hub.</span>
          </div>
        )}
      </div>
    </div>
  );
}
