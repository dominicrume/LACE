import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function WarehouseHUD() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [telemetry, setTelemetry] = useState<any[]>([]);
  const [safetyStatus, setSafetyStatus] = useState<'idle' | 'testing' | 'pass' | 'fail'>('idle');

  useEffect(() => {
    const ws = new WebSocket(
      window.location.protocol === 'https:' 
        ? `wss://${window.location.host}/ws/telemetry` 
        : `ws://${window.location.host}/ws/telemetry`
    );
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setTelemetry((prev) => [data, ...prev].slice(0, 10));
    };
    return () => ws.close();
  }, []);

  const handleExit = () => {
    logout();
    navigate('/');
  };

  const handleTest = (result: 'pass' | 'fail') => {
    setSafetyStatus('testing');
    setTimeout(() => setSafetyStatus(result), 1500);
  };

  return (
    <div className="warehouse-hud full-screen-view">
      <button className="btn-exit" onClick={handleExit}>&times;</button>
      
      <div className="hud-grid">
        {/* Left Side: Robot Telemetry HUD */}
        <div className="hud-panel telemetry-panel">
          <div className="hud-header">
            <span className="live-dot"></span>
            <h2>KINOVA GEN3 VISION</h2>
          </div>
          <div className="robot-cam-sim">
            <div className="bounding-box"></div>
            <div className="hud-overlay-text">TARGET IDENTIFIED: MICROWAVE (98.4%)</div>
          </div>
          <div className="telemetry-log">
            {telemetry.map((msg, i) => (
              <div key={i} className="log-line">
                <span className="log-time">[{new Date(msg.timestamp).toISOString().split('T')[1].substring(0, 8)}]</span>
                <span className="log-msg">{msg.msg}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: PAT Safety Station */}
        <div className="hud-panel safety-panel">
          <h2>SAFETY & PAT TESTING</h2>
          <p className="text-gray-400 mb-6">Scan barcode to initiate physical test.</p>
          
          <div className="pat-status-box" data-status={safetyStatus}>
            {safetyStatus === 'idle' && 'WAITING FOR SCAN...'}
            {safetyStatus === 'testing' && 'PERFORMING ELECTRICAL INSULATION TEST...'}
            {safetyStatus === 'pass' && 'CERTIFIED SAFE ✅'}
            {safetyStatus === 'fail' && 'HAZARDOUS ❌ (DO NOT SHIP)'}
          </div>

          <div className="pat-controls mt-6 flex gap-4">
            <button className="btn btn-outline" onClick={() => handleTest('pass')}>Simulate: PASS</button>
            <button className="btn btn-outline" onClick={() => handleTest('fail')}>Simulate: FAIL</button>
            <button className="btn btn-outline" onClick={() => setSafetyStatus('idle')}>RESET</button>
          </div>
        </div>
      </div>
    </div>
  );
}
