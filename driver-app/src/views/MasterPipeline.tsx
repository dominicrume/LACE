import React, { useState } from 'react';
import { useSimulation } from '../contexts/SimulationContext';
import ResidentPortal from './ResidentPortal';
import AiTriage from './AiTriage';
import DriverPortal from './DriverPortal';
import WarehouseHUD from './WarehouseHUD';
import { useAuth } from '../contexts/AuthContext';

type PipelineStage = 'resident' | 'ai' | 'driver' | 'warehouse';

const STAGES: { id: PipelineStage; label: string; icon: string }[] = [
  { id: 'resident', label: "Emma's Doorstep", icon: '🏠' },
  { id: 'ai', label: 'AI Triage', icon: '🧠' },
  { id: 'driver', label: 'Logistics Route', icon: '🚐' },
  { id: 'warehouse', label: 'Safety Hub', icon: '⚙️' }
];

export default function MasterPipeline() {
  const { activeScenario, setActiveScenario } = useSimulation();
  const [currentStage, setCurrentStage] = useState<PipelineStage>('resident');
  const { logout } = useAuth();

  const handleNext = () => {
    switch (currentStage) {
      case 'resident': setCurrentStage('ai'); break;
      case 'ai': setCurrentStage('driver'); break;
      case 'driver': setCurrentStage('warehouse'); break;
      case 'warehouse': setCurrentStage('resident'); break;
    }
  };

  const currentIndex = STAGES.findIndex(s => s.id === currentStage);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#020617', color: '#fff' }}>
      
      {/* Top Header / Presenter Controls */}
      <div style={{ padding: '0.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', background: '#0f172a' }}>
        <div style={{ fontWeight: 'bold', fontSize: '1rem', letterSpacing: '2px', color: '#38bdf8' }}>LACE v2</div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <select 
            value={activeScenario} 
            onChange={(e) => {
              setActiveScenario(e.target.value as any);
              setCurrentStage('resident'); // reset flow on scenario change
            }}
            style={{ background: '#1e293b', color: '#fff', border: '1px solid #334155', padding: '0.5rem', borderRadius: '4px' }}
          >
            <option value="toaster">Broken Toaster</option>
            <option value="tv">Cracked TV</option>
            <option value="scrap">Scrap Metal</option>
          </select>
          <button onClick={logout} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>Logout</button>
        </div>
      </div>

      {/* The Gamified Pipeline Visualizer */}
      <div style={{ padding: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', borderBottom: '1px solid #1e293b', background: '#020617' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%', maxWidth: '1000px', position: 'relative' }}>
          {STAGES.map((stage, idx) => {
            const isActive = idx === currentIndex;
            const isPast = idx < currentIndex;
            
            return (
              <React.Fragment key={stage.id}>
                {/* Node */}
                <div 
                  onClick={() => setCurrentStage(stage.id)}
                  style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    cursor: 'pointer',
                    zIndex: 2,
                    opacity: isActive || isPast ? 1 : 0.4,
                    transform: isActive ? 'scale(1.1)' : 'scale(1)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{ 
                    width: '50px', height: '50px', 
                    borderRadius: '50%', 
                    background: isActive ? '#38bdf8' : (isPast ? '#10b981' : '#1e293b'),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.4rem',
                    boxShadow: isActive ? '0 0 20px rgba(56, 189, 248, 0.5)' : 'none'
                  }}>
                    {stage.icon}
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: isActive ? 'bold' : 'normal', color: isActive ? '#38bdf8' : (isPast ? '#10b981' : '#94a3b8') }}>
                    {stage.label}
                  </div>
                </div>

                {/* Connector Line */}
                {idx < STAGES.length - 1 && (
                  <div style={{ flex: 1, height: '4px', background: '#1e293b', position: 'relative', borderRadius: '2px' }}>
                    <div style={{ 
                      position: 'absolute', top: 0, left: 0, height: '100%', 
                      background: isPast ? '#10b981' : 'transparent',
                      width: isPast ? '100%' : '0%',
                      transition: 'width 0.5s ease'
                    }} />
                  </div>
                )}
              </React.Fragment>
            )
          })}
        </div>
      </div>

      {/* The Active Terminal (Morphing View) */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, transition: 'opacity 0.4s', opacity: currentStage === 'resident' ? 1 : 0, pointerEvents: currentStage === 'resident' ? 'auto' : 'none' }}>
          <ResidentPortal onComplete={handleNext} />
        </div>
        <div style={{ position: 'absolute', inset: 0, transition: 'opacity 0.4s', opacity: currentStage === 'ai' ? 1 : 0, pointerEvents: currentStage === 'ai' ? 'auto' : 'none' }}>
          <AiTriage onComplete={handleNext} />
        </div>
        <div style={{ position: 'absolute', inset: 0, transition: 'opacity 0.4s', opacity: currentStage === 'driver' ? 1 : 0, pointerEvents: currentStage === 'driver' ? 'auto' : 'none' }}>
          <DriverPortal onComplete={handleNext} />
        </div>
        <div style={{ position: 'absolute', inset: 0, transition: 'opacity 0.4s', opacity: currentStage === 'warehouse' ? 1 : 0, pointerEvents: currentStage === 'warehouse' ? 'auto' : 'none' }}>
          <WarehouseHUD onComplete={handleNext} />
        </div>
      </div>

    </div>
  );
}
