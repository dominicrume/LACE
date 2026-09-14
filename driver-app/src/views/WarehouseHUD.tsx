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

  const playSound = (type: 'pass' | 'fail' | 'scan') => {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    if (type === 'pass') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    } else if (type === 'fail') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, ctx.currentTime);
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.8, ctx.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5);
      // LFO for alarm effect
      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 5;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 50;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start(ctx.currentTime);
      lfo.stop(ctx.currentTime + 1.5);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 1.5);
    } else if (type === 'scan') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(1000, ctx.currentTime);
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.1);
    }
  };

  const handleExit = () => {
    logout();
    navigate('/');
  };

  const handleTest = (result: 'pass' | 'fail') => {
    setSafetyStatus('testing');
    playSound('scan');
    setTimeout(() => {
      setSafetyStatus(result);
      playSound(result);
    }, 1500);
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
            {safetyStatus === 'fail' && (
              <div className="flex-col items-center">
                <div className="mb-2">HAZARDOUS ❌ (DO NOT SHIP)</div>
                <div style={{ fontSize: '1rem', color: '#fca5a5' }}>
                  Please isolate unit immediately. Click Reset below to await next scan.
                </div>
              </div>
            )}
          </div>

          <div className="pat-controls mt-6 flex gap-4">
            <button className="btn btn-outline" onClick={() => handleTest('pass')}>Simulate: PASS</button>
            <button className="btn btn-outline" onClick={() => handleTest('fail')}>Simulate: FAIL</button>
            <button 
              className={`btn ${safetyStatus === 'fail' ? 'btn-danger' : 'btn-outline'}`} 
              onClick={() => {
                setSafetyStatus('idle');
                if (safetyStatus !== 'idle') playSound('scan');
              }}
              style={safetyStatus === 'fail' ? { animation: 'pulse-red 2s infinite' } : {}}
            >
              RESET TO WAITING
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
