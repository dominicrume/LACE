import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function AiTriage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPhase(p => (p < 3 ? p + 1 : p));
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  const handleExit = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="ai-core-portal full-screen-view" style={{ background: '#020617', color: '#fff', fontFamily: "'Space Mono', monospace" }}>
      <button className="btn-exit" onClick={handleExit}>&times;</button>
      
      <div style={{ padding: '4rem', display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
        <h1 style={{ fontSize: '3rem', color: '#8b5cf6', marginBottom: '1rem' }}>LCX Digital Triage Engine</h1>
        <p style={{ fontSize: '1.2rem', color: '#94a3b8', marginBottom: '4rem' }}>"In milliseconds, the system determines the item's highest-value pathway."</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', width: '100%', maxWidth: '1200px' }}>
          
          {/* Vision Simulation */}
          <div style={{ background: '#0f172a', borderRadius: '16px', border: '1px solid #1e293b', overflow: 'hidden', position: 'relative', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: '8rem', filter: phase === 0 ? 'blur(4px)' : 'none', transition: 'filter 0.5s' }}>🍞</div>
            
            {phase >= 1 && (
              <div style={{ position: 'absolute', width: '200px', height: '200px', border: '2px dashed #22c55e', background: 'rgba(34, 197, 94, 0.1)', animation: 'pulse 2s infinite' }}>
                <span style={{ position: 'absolute', top: '-25px', left: '-2px', background: '#22c55e', color: '#000', padding: '2px 8px', fontWeight: 'bold' }}>Toaster_Defective: 99.2%</span>
              </div>
            )}
            
            {phase === 0 && (
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: '#3b82f6', fontSize: '1.5rem', animation: 'pulse 1s infinite' }}>Awaiting Image Upload...</span>
              </div>
            )}
          </div>

          {/* Assessment Output */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ background: '#0f172a', borderRadius: '16px', border: '1px solid #1e293b', padding: '2rem' }}>
              <h3 style={{ color: '#94a3b8', marginBottom: '1rem' }}>CONDITION ASSESSMENT</h3>
              {phase >= 1 ? (
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '1.2rem' }}>
                  <li><span style={{ color: '#3b82f6' }}>[✓]</span> Class: Domestic Appliance (Small)</li>
                  <li><span style={{ color: '#3b82f6' }}>[✓]</span> Visual Damage: Minimal (heating element fault likely)</li>
                  <li><span style={{ color: '#3b82f6' }}>[✓]</span> Hazmat Risk: LOW</li>
                </ul>
              ) : (
                <div style={{ color: '#475569' }}>Waiting for data...</div>
              )}
            </div>

            <div style={{ background: '#0f172a', borderRadius: '16px', border: phase >= 2 ? '2px solid #8b5cf6' : '1px solid #1e293b', padding: '2rem', transition: 'all 0.3s' }}>
              <h3 style={{ color: '#94a3b8', marginBottom: '1rem' }}>ROUTING DECISION</h3>
              {phase >= 2 ? (
                <div>
                  <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#a78bfa', marginBottom: '0.5rem' }}>PATHWAY: DIRECT REPAIR</div>
                  <div style={{ color: '#22c55e' }}>Action: Dispatch Driver (Ladywood Cluster)</div>
                </div>
              ) : (
                <div style={{ color: '#475569' }}>Calculating optimal pathway...</div>
              )}
            </div>
          </div>
        </div>

        <button className="btn btn-outline mt-8" onClick={() => setPhase(0)} style={{ alignSelf: 'center' }}>Reset Triage Sequence</button>
      </div>
    </div>
  );
}
