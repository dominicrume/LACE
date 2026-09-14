import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ResidentPortal() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [status, setStatus] = useState<'idle' | 'scanning' | 'success'>('idle');

  const handleScan = () => {
    setStatus('scanning');
    setTimeout(() => {
      setStatus('success');
    }, 2000);
  };

  const handleExit = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="resident-portal full-screen-view">
      <button className="btn-exit" onClick={handleExit}>&times;</button>
      
      <div className="resident-content">
        <h1 className="resident-title">What are you recycling today?</h1>
        
        {status === 'idle' && (
          <button className="btn-massive-scan" onClick={handleScan}>
            <span className="scan-icon">📷</span>
            <span>Identify Item</span>
          </button>
        )}

        {status === 'scanning' && (
          <div className="scanning-animation">
            <div className="scanner-line"></div>
            <p>Analyzing item...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="success-state">
            <div className="success-icon">✅</div>
            <h2>Microwave Identified</h2>
            <p>We've scheduled a pickup for tomorrow.</p>
            <button className="btn-primary mt-4" onClick={() => setStatus('idle')}>Scan Another</button>
          </div>
        )}
      </div>
    </div>
  );
}
