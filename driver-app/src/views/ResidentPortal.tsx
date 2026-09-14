import { useState } from 'react';

export default function ResidentPortal({ onComplete }: { onComplete?: () => void }) {
  const [status, setStatus] = useState<'idle' | 'scanning' | 'success'>('idle');

  const handleScan = () => {
    setStatus('scanning');
    setTimeout(() => {
      setStatus('success');
    }, 2000);
  };

  return (
    <div className="resident-portal full-screen-view" style={{ backgroundColor: '#000', height: '100%', position: 'relative' }}>
      <div className="resident-content" style={{ maxWidth: '400px', margin: '0 auto', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
        
        {/* WhatsApp-style Interface Simulation */}
        <div style={{ background: '#111b21', borderRadius: '24px', overflow: 'hidden', border: '1px solid #2a3942', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', height: '400px' }}>
          <div style={{ background: '#202c33', padding: '1.5rem', textAlign: 'center', borderBottom: '1px solid #2a3942' }}>
            <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#e9edef' }}>LCX Ladywood</h2>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#8696a0' }}>Online</p>
          </div>

          <div style={{ padding: '1.5rem', flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            <div style={{ background: '#202c33', color: '#e9edef', padding: '1rem', borderRadius: '12px 12px 12px 0', alignSelf: 'flex-start', maxWidth: '85%' }}>
              Hi Emma. To arrange a collection, please upload a photo of the item you want to recycle.
            </div>

            {status !== 'idle' && (
              <div style={{ background: '#005c4b', color: '#e9edef', padding: '0.5rem', borderRadius: '12px 12px 0 12px', alignSelf: 'flex-end', maxWidth: '85%' }}>
                <div style={{ width: '200px', height: '150px', background: '#000', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  <img src="/assets/toaster.jpg" alt="Broken Toaster" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              </div>
            )}

            {status === 'scanning' && (
              <div style={{ background: '#202c33', color: '#e9edef', padding: '1rem', borderRadius: '12px 12px 12px 0', alignSelf: 'flex-start', maxWidth: '85%' }}>
                <span style={{ animation: 'pulse 1s infinite' }}>Uploading to LACE network...</span>
              </div>
            )}

            {status === 'success' && (
              <div style={{ background: '#202c33', color: '#e9edef', padding: '1rem', borderRadius: '12px 12px 12px 0', alignSelf: 'flex-start', maxWidth: '85%' }}>
                <strong>Broken Toaster</strong> identified.<br/><br/>
                We have scheduled a collection from your doorstep for tomorrow morning. Thank you for keeping Ladywood clean! ♻️
              </div>
            )}
          </div>

          <div style={{ background: '#202c33', padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button 
              onClick={handleScan}
              disabled={status !== 'idle'}
              style={{ width: '100%', padding: '1rem', borderRadius: '24px', border: 'none', background: '#00a884', color: '#111b21', fontWeight: 700, fontSize: '1.1rem', cursor: 'pointer' }}
            >
              📷 Snap Photo
            </button>
          </div>
        </div>

        {status === 'success' && (
          <button 
            className="btn btn-primary"
            onClick={() => {
              if (onComplete) onComplete();
            }} 
            style={{ 
              marginTop: '2rem', 
              width: '100%', 
              padding: '1.5rem', 
              fontSize: '1.2rem', 
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
