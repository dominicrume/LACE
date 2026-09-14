import { useState } from 'react';
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
    <div className="warehouse-hud full-screen-view" style={{ height: '100%', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      
      <div style={{ maxWidth: '800px', width: '100%', textAlign: 'center', marginBottom: '1rem' }}>
        <h1 style={{ fontSize: '2.5rem', color: '#f59e0b', marginBottom: '0.5rem' }}>Local Repair Hub</h1>
        <p style={{ fontSize: '1.2rem', color: '#94a3b8' }}>"Safety and compliance are non-negotiable. All electrical goods undergo strict visual inspection and PAT testing by qualified technicians."</p>
      </div>

      <div className="hud-panel safety-panel" style={{ width: '100%', maxWidth: '800px', minHeight: '300px' }}>
        <h2 style={{ textAlign: 'center', fontSize: '1.5rem', marginBottom: '0.5rem' }}>{ITEM_NAMES[activeScenario]} PAT TEST STATION</h2>
        <p className="text-gray-400 mb-4" style={{ textAlign: 'center' }}>Awaiting technician barcode scan...</p>
        
        <div className="pat-status-box" data-status={safetyStatus} style={{ minHeight: '150px' }}>
          {safetyStatus === 'idle' && 'WAITING FOR SCAN...'}
          {safetyStatus === 'testing' && 'PERFORMING ELECTRICAL INSULATION TEST...'}
          {safetyStatus === 'pass' && (
            <div className="flex-col items-center w-full">
              <div className="mb-2" style={{ color: '#10b981', fontSize: '1.2rem', fontWeight: 'bold' }}>CERTIFIED SAFE ✅ (READY FOR REFURBISHMENT)</div>
              
              <div style={{ background: '#022c22', padding: '1rem', borderRadius: '8px', border: '1px solid #059669', width: '100%', maxWidth: '600px', margin: '1rem auto', textAlign: 'left' }}>
                <h3 style={{ color: '#10b981', margin: 0, marginBottom: '0.8rem', fontSize: '1.1rem' }}>Value Realized: Circular Economy Marketplace</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#a7f3d0', fontSize: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <li>♻️ <span style={{ opacity: 0.8 }}>Ecological:</span> 100% item diverted from landfill</li>
                  <li>💰 <span style={{ opacity: 0.8 }}>Financial:</span> Est. Resale Revenue <strong style={{ color: '#fff' }}>+£45.00</strong></li>
                  <li>🌍 <span style={{ opacity: 0.8 }}>Social:</span> Corporate ESG Impact Score <strong style={{ color: '#fff' }}>+120 pts</strong></li>
                </ul>
              </div>

              <button onClick={() => onComplete && onComplete()} style={{ marginTop: '0.5rem', padding: '0.8rem 2rem', fontSize: '1.1rem', background: '#10b981', color: '#111827', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                FINISH CYCLE &rarr;
              </button>
            </div>
          )}
          {safetyStatus === 'fail' && (
            <div className="flex-col items-center w-full">
              <div className="mb-2" style={{ color: '#ef4444', fontSize: '1.2rem', fontWeight: 'bold' }}>HAZARDOUS ❌ (ROUTED FOR DECONSTRUCTION)</div>
              
              <div style={{ background: '#450a0a', padding: '1rem', borderRadius: '8px', border: '1px solid #dc2626', width: '100%', maxWidth: '600px', margin: '1rem auto', textAlign: 'left' }}>
                <h3 style={{ color: '#ef4444', margin: 0, marginBottom: '0.8rem', fontSize: '1.1rem' }}>Value Realized: Material Recovery Facility</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#fecaca', fontSize: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <li>🔧 <span style={{ opacity: 0.8 }}>Safety:</span> Faulty appliance isolated from consumer market</li>
                  <li>🏗️ <span style={{ opacity: 0.8 }}>Recovery:</span> 1.2kg Copper & 0.8kg Steel Extracted</li>
                  <li>💵 <span style={{ opacity: 0.8 }}>Financial:</span> Raw Commodity Sale Value <strong style={{ color: '#fff' }}>+£8.50</strong></li>
                </ul>
              </div>

              <button onClick={() => onComplete && onComplete()} style={{ marginTop: '0.5rem', padding: '0.8rem 2rem', fontSize: '1.1rem', background: '#ef4444', color: '#111827', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                FINISH CYCLE &rarr;
              </button>
            </div>
          )}
        </div>

        {safetyStatus !== 'pass' && safetyStatus !== 'fail' && (
          <div className="pat-controls mt-6 flex gap-4 justify-center">
            <button className="btn btn-outline" style={{ fontSize: '1rem', padding: '0.8rem 1.5rem' }} onClick={() => handleTest('pass')}>Simulate: PASS</button>
            <button className="btn btn-outline" style={{ fontSize: '1rem', padding: '0.8rem 1.5rem' }} onClick={() => handleTest('fail')}>Simulate: FAIL</button>
            <button 
              className="btn btn-outline"
              style={{ fontSize: '1rem', padding: '0.8rem 1.5rem' }}
              onClick={() => {
                setSafetyStatus('idle');
                playSound('scan');
              }}
            >
              RESET TO WAITING
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
