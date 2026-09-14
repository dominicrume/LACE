import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QrCode, CheckCircle, XCircle } from 'lucide-react';

export default function SafetySignoff() {
  const queryClient = useQueryClient();
  const [scanId, setScanId] = useState('');
  const [activeItem, setActiveItem] = useState<any>(null);

  // Fetch all pending items (to simulate database lookup)
  const { data: pendingItems, isLoading } = useQuery({
    queryKey: ['safety', 'pending'],
    queryFn: async () => {
      const res = await fetch('/api/safety/pending', { credentials: 'include' });
      return res.json();
    }
  });

  const signoffMutation = useMutation({
    mutationFn: async ({ itemId, isSafe }: { itemId: number, isSafe: boolean }) => {
      const res = await fetch(`/api/safety/signoff/${itemId}?is_safe=${isSafe}`, {
        method: 'POST',
        credentials: 'include'
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['safety', 'pending'] });
      setActiveItem(null);
      setScanId('');
    }
  });

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingItems) return;
    
    // Find item matching the ID (simulating a barcode scan lookup)
    const item = pendingItems.find((i: any) => i.id.toString() === scanId);
    if (item) {
      setActiveItem(item);
    } else {
      alert("Item not found in pending queue.");
    }
  };

  // Keyboard wedge scanner global listener
  useEffect(() => {
    let barcodeBuffer = '';
    let timeout: any = null;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an actual input field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === 'Enter') {
        if (barcodeBuffer.length > 0) {
          e.preventDefault();
          setScanId(barcodeBuffer);
          
          const item = pendingItems?.find((i: any) => i.id.toString() === barcodeBuffer);
          if (item) {
            setActiveItem(item);
          } else {
            alert("Item not found in pending queue.");
          }
          barcodeBuffer = '';
        }
        return;
      }

      if (e.key.length === 1) {
        barcodeBuffer += e.key;
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => {
          barcodeBuffer = '';
        }, 100); // 100ms timeout separates fast scanner from slow human typing
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (timeout) clearTimeout(timeout);
    };
  }, [pendingItems]);

  return (
    <div>
      <div className="mb-6">
        <h2>WEEE PAT Testing</h2>
        <p>Scan an item's barcode to pull up its testing manifest.</p>
      </div>

      <div className="flex gap-6">
        {/* Scanner Panel */}
        <div className="card" style={{ flex: 1, height: 'fit-content' }}>
          <div className="text-center mb-6">
            <QrCode size={64} className="mx-auto" color="var(--text-secondary)" />
            <h3 className="mt-4">SCAN ITEM</h3>
          </div>
          <form onSubmit={handleScan} className="flex gap-2">
            <input 
              type="text" 
              className="input-solid"
              placeholder="Enter ID manually..." 
              value={scanId}
              onChange={(e) => setScanId(e.target.value)}
              autoFocus
            />
            <button type="submit" className="btn btn-primary">LOOKUP</button>
          </form>
        </div>

        {/* Action Panel */}
        <div className="card" style={{ flex: 2 }}>
          {activeItem ? (
            <div className="flex-col gap-6">
              <div>
                <div className="badge warning">PENDING SIGNOFF</div>
                <h2 className="mt-2">{activeItem.category} (ID: {activeItem.id})</h2>
                <p>Weight: {activeItem.weight_kg}kg</p>
              </div>

              <div style={{ padding: '1rem', border: '3px solid var(--border-color)' }}>
                <h4 className="mb-2">Physical Condition Notes</h4>
                <p>{activeItem.notes || "No structural damage reported by robot."}</p>
              </div>

              <div className="flex gap-4 mt-4">
                <button 
                  className="btn btn-success" 
                  style={{ flex: 1 }}
                  onClick={() => signoffMutation.mutate({ itemId: activeItem.id, isSafe: true })}
                >
                  <CheckCircle size={24} /> PASS (SAFE)
                </button>
                <button 
                  className="btn btn-danger" 
                  style={{ flex: 1 }}
                  onClick={() => signoffMutation.mutate({ itemId: activeItem.id, isSafe: false })}
                >
                  <XCircle size={24} /> FAIL (HAZARDOUS)
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full" style={{ minHeight: '300px', color: 'var(--text-secondary)' }}>
              <h3>Awaiting scan...</h3>
            </div>
          )}
        </div>
      </div>
      
      {/* Quick reference list for testing purposes */}
      <div className="mt-6 p-6" style={{ background: 'var(--bg-primary)', border: '2px dashed var(--border-color)' }}>
        <h4>Demo Helper: Available Pending IDs to Scan</h4>
        {isLoading ? <p>Loading...</p> : (
          <div className="flex gap-2 mt-2" style={{ flexWrap: 'wrap' }}>
            {pendingItems?.map((i: any) => (
              <div key={i.id} className="badge" style={{ cursor: 'pointer' }} onClick={() => setScanId(i.id.toString())}>
                ID: {i.id} ({i.category})
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
