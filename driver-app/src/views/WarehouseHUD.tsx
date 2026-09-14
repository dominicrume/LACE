import React, { useState } from 'react';
import { useSimulation } from '../contexts/SimulationContext';

const ITEM_NAMES = {
  toaster: 'TOASTER',
  tv: 'SMASHED TV',
  scrap: 'SCRAP METAL'
};

export default function WarehouseHUD({ onComplete }: { onComplete?: () => void }) {
  const { activeScenario } = useSimulation();
  const [safetyStatus, setSafetyStatus] = useState<'idle' | 'testing' | 'pass' | 'fail'>('idle');

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

  const handleTest = (result: 'pass' | 'fail') => {
    setSafetyStatus('testing');
    playSound('scan');
    setTimeout(() => {
      setSafetyStatus(result);
      playSound(result);
    }, 1500);
  };

  return (
    <div className="warehouse-hud full-screen-view" style={{ height: '100%' }}>
      
      <div style={{ maxWidth: '800px', width: '100%', textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '3rem', color: '#f59e0b', marginBottom: '1rem' }}>Local Repair Hub</h1>
        <p style={{ fontSize: '1.2rem', color: '#94a3b8' }}>"Safety and compliance are non-negotiable. All electrical goods undergo strict visual inspection and PAT testing by qualified technicians."</p>
      </div>

      <div className="hud-panel safety-panel" style={{ width: '100%', maxWidth: '800px', minHeight: '400px' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2rem' }}>{ITEM_NAMES[activeScenario]} PAT TEST STATION</h2>
        <p className="text-gray-400 mb-6" style={{ textAlign: 'center' }}>Awaiting technician barcode scan...</p>
        
        <div className="pat-status-box" data-status={safetyStatus} style={{ minHeight: '150px' }}>
          {safetyStatus === 'idle' && 'WAITING FOR SCAN...'}
          {safetyStatus === 'testing' && 'PERFORMING ELECTRICAL INSULATION TEST...'}
          {safetyStatus === 'pass' && (
            <div className="flex-col items-center">
              <div className="mb-2">CERTIFIED SAFE ✅ (READY FOR REPAIR)</div>
              <button onClick={() => onComplete && onComplete()} style={{ marginTop: '1rem', padding: '0.5rem 2rem', fontSize: '1rem', background: 'transparent', border: '1px solid #10b981', color: '#10b981', borderRadius: '4px', cursor: 'pointer' }}>
                FINISH CYCLE
              </button>
            </div>
          )}
          {safetyStatus === 'fail' && (
            <div className="flex-col items-center">
              <div className="mb-2">HAZARDOUS ❌ (DO NOT REPAIR)</div>
              <div style={{ fontSize: '1.2rem', color: '#fca5a5' }}>
                Please isolate unit immediately. Click Reset below to await next scan.
              </div>
            </div>
          )}
        </div>

        <div className="pat-controls mt-8 flex gap-6 justify-center">
          <button className="btn btn-outline" style={{ fontSize: '1.2rem', padding: '1rem 2rem' }} onClick={() => handleTest('pass')}>Simulate: PASS</button>
          <button className="btn btn-outline" style={{ fontSize: '1.2rem', padding: '1rem 2rem' }} onClick={() => handleTest('fail')}>Simulate: FAIL</button>
          <button 
            className={`btn ${safetyStatus === 'fail' ? 'btn-danger' : 'btn-outline'}`} 
            style={{ fontSize: '1.2rem', padding: '1rem 2rem', ...(safetyStatus === 'fail' ? { animation: 'pulse-red 2s infinite' } : {}) }}
            onClick={() => {
              setSafetyStatus('idle');
              if (safetyStatus !== 'idle') playSound('scan');
            }}
          >
            RESET TO WAITING
          </button>
        </div>
      </div>
    </div>
  );
}
