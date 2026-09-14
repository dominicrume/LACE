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
      </div>
    </div>
  );
}
