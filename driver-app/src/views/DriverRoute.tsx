import { useEffect, useState } from 'react';
import { getRoute, saveRoute, saveMutation } from '../db';
import { PackageOpen, MapPin, CheckCircle, DatabaseZap } from 'lucide-react';

export default function DriverRoute() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    let data = await getRoute();
    if (data) {
      setItems(data);
    }
  };

  const loadDemoData = async () => {
    const demoItems = [
      { id: 101, address: '42 Ladywood Road', contents: 'Mixed Electronics', destination: 'LACE Triage' },
      { id: 102, address: '18 Edgbaston St', contents: 'CRT TV', destination: 'LACE Triage' }
    ];
    await saveRoute(demoItems);
    setItems(demoItems);
  };

  const markArrived = async (id: number) => {
    await saveMutation(id, 'LACE Triage');
    const updated = items.filter(i => i.id !== id);
    await saveRoute(updated);
    setItems(updated);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2>Route Logistics</h2>
          <p>Offline-first driver collection route.</p>
        </div>
        <button className="btn btn-outline" onClick={loadDemoData}>
          <DatabaseZap size={16} /> Load Demo Data
        </button>
      </div>

      {items.length === 0 ? (
        <div className="glass-card flex items-center justify-center flex-col gap-4" style={{ minHeight: '300px' }}>
          <PackageOpen size={48} color="var(--text-muted)" />
          <p>No active collections. Load demo data to simulate offline routing.</p>
        </div>
      ) : (
        <div className="flex-col gap-4">
          {items.map(item => (
            <div key={item.id} className="glass-card flex justify-between items-center">
              <div>
                <h3 className="flex items-center gap-2"><MapPin size={18} color="var(--primary)" /> {item.address}</h3>
                <p>Contents: {item.contents}</p>
                <span className="badge mt-4">Destination: {item.destination}</span>
              </div>
              <button className="btn btn-success" onClick={() => markArrived(item.id)}>
                <CheckCircle size={16} /> Mark Arrived
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
