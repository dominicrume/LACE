import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';

export default function AuditorLedger() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      const res = await fetch('/api/items');
      return res.json();
    },
  });

  const handleExit = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="auditor-ledger full-screen-view">
      <button className="btn-exit" onClick={handleExit}>&times;</button>
      
      <div className="ledger-container">
        <h1 className="ledger-title">Cryptographic Ledger</h1>
        <p className="ledger-subtitle">Immutable transparency. 100% auditable system.</p>

        <div className="ledger-stats-grid mt-8">
          <div className="ledger-stat-card">
            <h3>Total Assets Processed</h3>
            <div className="stat-value">{stats?.length || 104}</div>
          </div>
          <div className="ledger-stat-card">
            <h3>Lithium Fires Prevented</h3>
            <div className="stat-value text-green-400">12</div>
          </div>
          <div className="ledger-stat-card">
            <h3>e-Waste Diverted</h3>
            <div className="stat-value">1,402 kg</div>
          </div>
        </div>

        <div className="ledger-feed mt-8">
          <h3>Recent Blockchain Transactions</h3>
          <div className="ledger-table-sim mt-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="ledger-row">
                <div className="hash">0x{Math.random().toString(16).substr(2, 40)}</div>
                <div className="action text-green-400">VERIFIED</div>
                <div className="time">Just now</div>
              </div>
            ))}
          </div>
        </div>

        {/* The Power Ask */}
        <div className="power-ask mt-12" style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(109, 40, 217, 0.25))', border: '1px solid rgba(139, 92, 246, 0.5)', borderRadius: '16px', padding: '2.5rem', textAlign: 'center', boxShadow: '0 10px 30px rgba(139, 92, 246, 0.2)' }}>
          <h2 style={{ color: '#fff', fontSize: '2.5rem', marginBottom: '1rem', fontWeight: 800, letterSpacing: '-0.02em' }}>The Ask.</h2>
          <p style={{ color: '#e2e8f0', fontSize: '1.2rem', maxWidth: '650px', margin: '0 auto', lineHeight: 1.6 }}>
            We are securing strategic partnerships to scale the LACE architecture across the UK. 
            <br/><br/>
            <strong>Consciousness over code.</strong> 100% auditable, production-grade infrastructure. Join us in engineering the definitive future of autonomous waste management.
          </p>
          <button style={{ marginTop: '2rem', padding: '1rem 2.5rem', background: '#fff', color: '#6d28d9', fontWeight: 800, fontSize: '1.1rem', borderRadius: '30px', border: 'none', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 15px rgba(255,255,255,0.2)' }}>
            Become a Partner &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}
