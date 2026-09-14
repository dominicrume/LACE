
import { useQuery } from '@tanstack/react-query';

export default function Statistics() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['statistics'],
    queryFn: async () => {
      const res = await fetch('/api/scorecard', { credentials: 'include' });
      return res.json();
    }
  });

  if (isLoading) return <div className="p-6">Loading Analytics...</div>;

  return (
    <div>
      <div className="mb-6">
        <h2>Operations Analytics</h2>
        <p>LACE Triage Facility Throughput and Safety Metrics</p>
      </div>

      <div className="flex gap-6 mb-6">
        <div className="card" style={{ flex: 1 }}>
          <h3>Total Items Processed</h3>
          <p style={{ fontSize: '2rem', fontWeight: 800, marginTop: '1rem' }}>{stats?.total_items || 0}</p>
        </div>
        <div className="card" style={{ flex: 1, border: '3px solid var(--accent-green)' }}>
          <h3 style={{ color: 'var(--accent-green)' }}>Certified Safe</h3>
          <p style={{ fontSize: '2rem', fontWeight: 800, marginTop: '1rem' }}>{stats?.safe_items || 0}</p>
        </div>
        <div className="card" style={{ flex: 1, border: '3px solid var(--accent-red)' }}>
          <h3 style={{ color: 'var(--accent-red)' }}>Hazmat Aborts</h3>
          <p style={{ fontSize: '2rem', fontWeight: 800, marginTop: '1rem' }}>{stats?.hazmat_items || 0}</p>
        </div>
      </div>

      <div className="card">
        <h3 className="mb-4">Recent Audit Log</h3>
        {/* We would typically use a library like ag-grid or react-table here for production. We simulate the layout logic for the audit. */}
        <table className="data-grid">
          <thead>
            <tr>
              <th>ID</th>
              <th>Category</th>
              <th>Weight (kg)</th>
              <th>Status</th>
              <th>E-Waste Class</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1004</td>
              <td>Laptop</td>
              <td>2.1</td>
              <td><span className="badge success">CERTIFIED SAFE</span></td>
              <td>IT & Telecoms</td>
            </tr>
            <tr>
              <td>1005</td>
              <td>Microwave</td>
              <td>12.5</td>
              <td><span className="badge warning">PENDING PAT</span></td>
              <td>Large Appliance</td>
            </tr>
            <tr>
              <td>1006</td>
              <td>Lithium Battery pack</td>
              <td>0.8</td>
              <td><span className="badge danger">HAZMAT ABORT</span></td>
              <td>Battery</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
