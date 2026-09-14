import React, { useState, useRef, useEffect } from 'react';
import { useSimulation } from '../contexts/SimulationContext';

const ITEM_NAMES = {
  toaster: 'Broken Toaster',
  tv: 'Smashed TV',
  scrap: 'Scrap Metal'
};

function StickySwipe({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleMove = (clientX: number) => {
    if (!isDragging.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, clientX - rect.left);
    const newProgress = Math.min(100, (x / rect.width) * 100);
    setProgress(newProgress);
    if (newProgress >= 90) {
      isDragging.current = false;
      setProgress(100);
      onComplete();
    }
  };

  const handleEnd = () => {
    isDragging.current = false;
    if (progress < 90) {
      // Snap back
      setProgress(0);
    }
  };

  useEffect(() => {
    const handleMouseUp = () => handleEnd();
    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX);
    const handleTouchEnd = () => handleEnd();
    const handleTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX);

    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('touchend', handleTouchEnd);
    document.addEventListener('touchmove', handleTouchMove);

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchmove', handleTouchMove);
    };
  });

  return (
    <div 
      ref={containerRef}
      style={{ 
        position: 'relative', width: '100%', maxWidth: '400px', height: '64px', 
        background: '#1e293b', borderRadius: '32px', overflow: 'hidden', 
        display: 'flex', alignItems: 'center', cursor: 'grab', userSelect: 'none',
        boxShadow: 'inset 0 4px 6px rgba(0,0,0,0.3)',
        transition: isDragging.current ? 'none' : 'background 0.3s'
      }}
      onMouseDown={(e) => { isDragging.current = true; handleMove(e.clientX); }}
      onTouchStart={(e) => { isDragging.current = true; handleMove(e.touches[0].clientX); }}
    >
      <div style={{ position: 'absolute', width: '100%', textAlign: 'center', color: '#94a3b8', fontWeight: 'bold', pointerEvents: 'none', animation: progress === 0 ? 'pulse 2s infinite' : 'none' }}>
        &gt;&gt; SWIPE NOW &gt;&gt;
      </div>
      
      {/* The filled progress background */}
      <div style={{ position: 'absolute', height: '100%', width: `${progress}%`, background: 'rgba(59, 130, 246, 0.2)', transition: isDragging.current ? 'none' : 'width 0.3s' }} />

      {/* The thumb */}
      <div style={{ 
        width: '56px', height: '56px', background: '#3b82f6', borderRadius: '50%', 
        display: 'flex', alignItems: 'center', justifyContent: 'center', 
        position: 'absolute', left: `calc(${progress}% - ${progress > 0 ? 56 * (progress/100) : 0}px + 4px)`,
        transition: isDragging.current ? 'none' : 'left 0.3s',
        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.5)'
      }}>
        <span style={{ color: '#fff', fontSize: '1.5rem', transform: `translateX(${progress === 100 ? 5 : 0}px)`, transition: 'transform 0.2s' }}>
          {progress === 100 ? '✓' : '🚐'}
        </span>
      </div>
    </div>
  );
}

export default function DriverPortal({ onComplete }: { onComplete?: () => void }) {
  const { activeScenario } = useSimulation();
  const [collected, setCollected] = useState(false);

  const itemName = ITEM_NAMES[activeScenario];

  return (
    <div className="driver-portal full-screen-view" style={{ height: '100%' }}>

      <div className="driver-map-sim">
        <div className="route-path"></div>
        {/* Dynamic Route Clustering explicitly for Emma */}
        <div className="route-marker" style={{ top: '30%', left: '40%', opacity: 0.5, transform: 'scale(0.8)' }}>📍 Neighbor 1</div>
        <div className="route-marker" style={{ top: '70%', left: '60%', opacity: 0.5, transform: 'scale(0.8)' }}>📍 Neighbor 2</div>
        <div className="route-marker beacon-pulse" style={{ top: '50%', left: '50%', zIndex: 10 }}>📍 Emma's House, Ladywood</div>
        
        <div style={{ position: 'absolute', top: '1rem', left: '1rem', background: 'rgba(0,0,0,0.85)', padding: '1rem', borderRadius: '12px', borderLeft: '4px solid #10b981' }}>
          <h3 style={{ color: '#10b981', margin: 0 }}>Smart Collection Route</h3>
          <p style={{ margin: 0, color: '#94a3b8' }}>Saving 3 car trips to the tip by collecting from Emma and 2 neighbors.</p>
        </div>
      </div>

      <div className="driver-bottom-panel" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#0f172a', borderTop: '1px solid #1e293b' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: '#fff' }}>Pickup: {itemName}</h2>
        <p className="text-gray-400 mb-8" style={{ fontSize: '1.1rem' }}>Emma reported item ready at doorstep.</p>
        
        {!collected ? (
          <StickySwipe onComplete={() => {
            // Add a tiny delay so they see the checkmark lock in
            setTimeout(() => setCollected(true), 400);
          }} />
        ) : (
          <div className="badge success" style={{ padding: '1.5rem', justifyContent: 'center', fontSize: '1.4rem', width: '100%', maxWidth: '500px', textAlign: 'center', background: 'rgba(16, 185, 129, 0.1)', border: '2px solid #10b981', borderRadius: '16px' }}>
            <div style={{ color: '#10b981', fontWeight: 'bold', marginBottom: '0.5rem' }}>ITEM COLLECTED ✅</div>
            <div style={{ fontSize: '1rem', color: '#94a3b8', marginBottom: '1rem' }}>Item is routed directly to the Local Repair Hub.</div>
            <button 
              onClick={() => onComplete && onComplete()}
              style={{ background: '#10b981', color: '#fff', border: 'none', padding: '0.5rem 1.5rem', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Transfer to Hub &rarr;
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
