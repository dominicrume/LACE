import { useState, useRef, useEffect } from 'react';
import { useSimulation } from '../contexts/SimulationContext';

const SCENARIOS = {
  toaster: { name: 'Broken Toaster', img1: '/assets/toaster.jpg', img2: '/assets/toaster_close.jpg' },
  tv: { name: 'Smashed TV', img1: '/assets/smashed-tv.jpg', img2: '/assets/tv_close.jpg' },
  scrap: { name: 'Scrap Metal', img1: '/assets/scrap-metal.jpg', img2: '/assets/scrap_close.jpg' }
};

export default function ResidentPortal({ onComplete }: { onComplete?: () => void }) {
  const { activeScenario } = useSimulation();
  const scenarioData = activeScenario ? SCENARIOS[activeScenario as keyof typeof SCENARIOS] : SCENARIOS.toaster;
  
  const [status, setStatus] = useState<'idle' | 'scanning_1' | 'photo_1_done' | 'scanning_2' | 'success'>('idle');
  
  // Auto scroll to bottom
  const chatRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [status]);

  const handleScan = () => {
    if (status === 'idle') {
      setStatus('scanning_1');
      setTimeout(() => setStatus('photo_1_done'), 1500);
    } else if (status === 'photo_1_done') {
      setStatus('scanning_2');
      setTimeout(() => setStatus('success'), 1500);
    }
  };

  return (
    <div className="resident-portal full-screen-view" style={{ backgroundColor: '#000', height: '100%', position: 'relative' }}>
      <div className="resident-content" style={{ maxWidth: '400px', margin: '0 auto', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
        
        {/* WhatsApp-style Interface Simulation */}
        <div style={{ background: '#111b21', borderRadius: '24px', overflow: 'hidden', border: '1px solid #2a3942', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', height: '480px' }}>
          <div style={{ background: '#202c33', padding: '1rem', textAlign: 'center', borderBottom: '1px solid #2a3942' }}>
            <h2 style={{ margin: 0, fontSize: '1.1rem', color: '#e9edef' }}>LCX Ladywood</h2>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#8696a0' }}>Online</p>
          </div>

          <div ref={chatRef} style={{ padding: '1rem', flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.8rem', scrollBehavior: 'smooth' }}>
            
            <div style={{ background: '#202c33', color: '#e9edef', padding: '0.8rem', borderRadius: '12px 12px 12px 0', alignSelf: 'flex-start', maxWidth: '85%' }}>
              Hi Nadia. To arrange a collection, please upload a photo of the item you want to recycle.
            </div>

            {/* Photo 1 Sequence */}
            {(status === 'scanning_1' || status === 'photo_1_done' || status === 'scanning_2' || status === 'success') && (
              <div style={{ background: '#005c4b', padding: '0.4rem', borderRadius: '12px 12px 0 12px', alignSelf: 'flex-end', maxWidth: '85%', animation: 'slideUp 0.3s' }}>
                <div style={{ width: '180px', height: '120px', background: '#000', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  <img src={scenarioData.img1} alt={scenarioData.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              </div>
            )}
            
            {status === 'scanning_1' && (
              <div style={{ background: '#202c33', color: '#e9edef', padding: '0.8rem', borderRadius: '12px 12px 12px 0', alignSelf: 'flex-start', maxWidth: '85%' }}>
                <span style={{ animation: 'pulse 1s infinite' }}>Uploading photo...</span>
              </div>
            )}

            {status === 'photo_1_done' && (
              <div style={{ background: '#202c33', color: '#e9edef', padding: '0.8rem', borderRadius: '12px 12px 12px 0', alignSelf: 'flex-start', maxWidth: '85%', animation: 'slideUp 0.3s' }}>
                Great! Now please upload a close-up photo of the damage (e.g. plug, casing, or screen) so our AI can triage it.
              </div>
            )}

            {/* Photo 2 Sequence */}
            {(status === 'scanning_2' || status === 'success') && (
              <div style={{ background: '#005c4b', padding: '0.4rem', borderRadius: '12px 12px 0 12px', alignSelf: 'flex-end', maxWidth: '85%', animation: 'slideUp 0.3s' }}>
                <div style={{ width: '180px', height: '120px', background: '#000', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  <img src={scenarioData.img2} alt={`${scenarioData.name} Damage Detail`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              </div>
            )}

            {status === 'scanning_2' && (
              <div style={{ background: '#202c33', color: '#e9edef', padding: '0.8rem', borderRadius: '12px 12px 12px 0', alignSelf: 'flex-start', maxWidth: '85%' }}>
                <span style={{ animation: 'pulse 1s infinite' }}>Analyzing with LACE Network...</span>
              </div>
            )}

            {status === 'success' && (
              <div style={{ background: '#202c33', color: '#e9edef', padding: '0.8rem', borderRadius: '12px 12px 12px 0', alignSelf: 'flex-start', maxWidth: '85%', animation: 'slideUp 0.3s' }}>
                <strong>{scenarioData.name}</strong> identified.<br/><br/>
                We have scheduled a collection from your doorstep for tomorrow morning. Thank you for keeping Ladywood clean! ♻️
              </div>
            )}
          </div>

          <div style={{ background: '#202c33', padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center', borderTop: '1px solid #2a3942' }}>
            {status !== 'success' && (
              <button 
                onClick={handleScan}
                disabled={status === 'scanning_1' || status === 'scanning_2'}
                style={{ width: '100%', padding: '1rem', borderRadius: '24px', border: 'none', background: '#00a884', color: '#111b21', fontWeight: 700, fontSize: '1rem', cursor: (status === 'scanning_1' || status === 'scanning_2') ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}
              >
                {status === 'idle' && '📷 Snap Photo 1 (Wide)'}
                {(status === 'scanning_1' || status === 'scanning_2') && 'Uploading...'}
                {status === 'photo_1_done' && '📷 Snap Photo 2 (Close-up)'}
              </button>
            )}
            {status === 'success' && (
              <div style={{ width: '100%', textAlign: 'center', color: '#8696a0', fontSize: '0.9rem' }}>Chat Closed</div>
            )}
          </div>
        </div>

        {status === 'success' && (
          <button 
            className="btn btn-primary"
            onClick={() => {
              if (onComplete) onComplete();
              // Reset state when transferring so if they loop back it's clean
              setTimeout(() => setStatus('idle'), 1000);
            }} 
            style={{ 
              marginTop: '1rem', 
              width: '100%', 
              padding: '1.2rem', 
              fontSize: '1.1rem', 
              animation: 'slideUp 0.5s ease-out',
              background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)'
            }}
          >
            Transfer to AI Triage &rarr;
          </button>
        )}

      </div>
    </div>
  );
}
