import React, { useState, useEffect, useRef } from 'react';
import { useSimulation } from '../contexts/SimulationContext';

const SCENARIOS = {
  toaster: {
    name: 'Broken Toaster',
    image: '/assets/toaster.jpg',
    class: 'Domestic Appliance (Small)',
    visualDamage: 'Minimal (heating element fault likely)',
    hazmat: 'LOW',
    bbox: 'Toaster_Defective: 99.2%',
    pathway: 'DIRECT REPAIR',
    action: 'Dispatch Driver (Ladywood Cluster)'
  },
  tv: {
    name: 'Smashed TV',
    image: '/assets/tv.jpg',
    class: 'Consumer Electronics (Display)',
    visualDamage: 'Critical (screen completely shattered)',
    hazmat: 'MEDIUM (Glass/Phosphor)',
    bbox: 'Display_Smashed: 98.7%',
    pathway: 'COMPONENT HARVESTING',
    action: 'Route to Advanced Dismantling Facility'
  },
  scrap: {
    name: 'Scrap Metal',
    image: '/assets/scrap.jpg',
    class: 'Mixed Ferrous Metals',
    visualDamage: 'Severe oxidation / Structural failure',
    hazmat: 'LOW',
    bbox: 'Metal_Scrap_Pile: 95.4%',
    pathway: 'MATERIAL RECYCLING',
    action: 'Bulk Transport to Smelter'
  }
};

export default function AiTriage({ onComplete }: { onComplete?: () => void }) {
  const { activeScenario, setActiveScenario } = useSimulation();
  
  const [phase, setPhase] = useState(0);
  const timerRef = useRef<any>(null);

  const startSimulation = (scenarioKey: keyof typeof SCENARIOS) => {
    setActiveScenario(scenarioKey);
    setPhase(0);
    if (timerRef.current) clearInterval(timerRef.current);
    
    timerRef.current = setInterval(() => {
      setPhase(p => {
        if (p >= 3) {
          clearInterval(timerRef.current);
          return p;
        }
        return p + 1;
      });
    }, 1500);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
  return (
    <div className="ai-core-portal full-screen-view" style={{ background: '#020617', color: '#fff', fontFamily: "'Space Mono', monospace", height: '100%' }}>
      
      <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', color: '#8b5cf6', marginBottom: '0.5rem', textAlign: 'center' }}>LCX Digital Triage Engine</h1>
        <p style={{ fontSize: '1rem', color: '#94a3b8', marginBottom: '2rem', textAlign: 'center' }}>"In milliseconds, the system determines the item's highest-value pathway."</p>

        {/* Interactive Controls */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <button className={`btn ${activeScenario === 'toaster' ? 'btn-primary' : 'btn-outline'}`} onClick={() => startSimulation('toaster')}>Upload Toaster</button>
          <button className={`btn ${activeScenario === 'tv' ? 'btn-primary' : 'btn-outline'}`} onClick={() => startSimulation('tv')}>Upload Smashed TV</button>
          <button className={`btn ${activeScenario === 'scrap' ? 'btn-primary' : 'btn-outline'}`} onClick={() => startSimulation('scrap')}>Upload Scrap Metal</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', width: '100%', maxWidth: '1200px' }}>
          
          {/* Vision Simulation */}
          <div style={{ background: '#0f172a', borderRadius: '16px', border: '1px solid #1e293b', overflow: 'hidden', position: 'relative', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {currentData ? (
              <>
                <img src={currentData.image} alt={currentData.name} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: phase === 0 ? 'blur(8px)' : 'none', transition: 'filter 0.5s' }} />
                
                {phase >= 1 && (
                  <div className="neon-box-active" style={{ position: 'absolute', width: '250px', height: '250px', border: '3px dashed #22c55e', background: 'rgba(34, 197, 94, 0.1)', animation: 'pulse 2s infinite' }}>
                    <span style={{ position: 'absolute', top: '-28px', left: '-3px', background: '#22c55e', color: '#000', padding: '4px 10px', fontWeight: 'bold' }}>{currentData.bbox}</span>
                  </div>
                )}
                
                {phase === 0 && (
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ color: '#3b82f6', fontSize: '1.5rem', animation: 'pulse 1s infinite' }}>Analyzing Image Data...</span>
                  </div>
                )}
              </>
            ) : (
              <div style={{ color: '#475569', fontSize: '1.2rem' }}>Awaiting Resident Upload...</div>
            )}
          </div>

          {/* Assessment Output */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ background: '#0f172a', borderRadius: '16px', border: '1px solid #1e293b', padding: '2rem', minHeight: '200px' }}>
              <h3 style={{ color: '#94a3b8', marginBottom: '1rem' }}>CONDITION ASSESSMENT</h3>
              {currentData && phase >= 1 ? (
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '1.2rem' }}>
                  <li className="typewriter-text"><span style={{ color: '#3b82f6' }}>[✓]</span> Class: {currentData.class}</li>
                  {phase >= 2 && <li className="typewriter-text" style={{ animationDelay: '0.5s' }}><span style={{ color: '#3b82f6' }}>[✓]</span> Visual Damage: {currentData.visualDamage}</li>}
                  {phase >= 3 && <li className="typewriter-text" style={{ animationDelay: '1s' }}><span style={{ color: '#3b82f6' }}>[✓]</span> Hazmat Risk: {currentData.hazmat}</li>}
                </ul>
              ) : (
                <div style={{ color: '#475569' }}>Waiting for data...</div>
              )}
            </div>

            <div style={{ background: '#0f172a', borderRadius: '16px', border: phase >= 2 ? '2px solid #8b5cf6' : '1px solid #1e293b', padding: '2rem', transition: 'all 0.3s', minHeight: '180px' }}>
              <h3 style={{ color: '#94a3b8', marginBottom: '1rem' }}>ROUTING DECISION</h3>
              {currentData && phase >= 2 ? (
                <div>
                  <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#a78bfa', marginBottom: '0.5rem' }}>PATHWAY: {currentData.pathway}</div>
                  <div style={{ color: '#22c55e', fontSize: '1.2rem', marginBottom: '1.5rem' }}>Action: {currentData.action}</div>
                  {phase >= 3 && (
                    <button 
                      onClick={() => onComplete && onComplete()}
                      style={{ padding: '0.8rem 1.5rem', background: '#8b5cf6', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem' }}
                    >
                      Push to Logistics &rarr;
                    </button>
                  )}
                </div>
              ) : (
                <div style={{ color: '#475569' }}>Calculating optimal pathway...</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
