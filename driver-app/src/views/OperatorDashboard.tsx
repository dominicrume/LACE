import { useState, useEffect, useRef } from 'react';
import { Activity, Cpu, AlertOctagon } from 'lucide-react';

export default function OperatorDashboard() {
  const [telemetry, setTelemetry] = useState<any>(null);
  const [wsStatus, setWsStatus] = useState('CONNECTING');
  const [eStopActive, setEStopActive] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Connect to WebSocket
    const ws = new WebSocket('ws://${window.location.host}/ws/telemetry');
    wsRef.current = ws;

    ws.onopen = () => setWsStatus('CONNECTED');
    ws.onmessage = (event) => {
      setTelemetry(JSON.parse(event.data));
    };
    ws.onclose = () => setWsStatus('DISCONNECTED');
    ws.onerror = () => setWsStatus('ERROR');

    return () => {
      ws.close();
    };
  }, []);

  const triggerEStop = () => {
    setEStopActive(true);
    // In a real system, send abort via socket
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ command: 'EMERGENCY_STOP' }));
    }
  };

  // Simplified Status Logic
  let systemColor = 'var(--accent-green)';
  let systemState = 'OPERATING NORMALLY';

  if (eStopActive) {
    systemColor = 'var(--accent-red)';
    systemState = 'EMERGENCY STOP ENGAGED';
  } else if (wsStatus !== 'CONNECTED') {
    systemColor = 'var(--accent-yellow)';
    systemState = 'CONNECTING TO CELL...';
  } else if (telemetry) {
    // If Z-axis force is high, warn
    if (Math.abs(telemetry.force_vector[2]) > 15) {
      systemColor = 'var(--accent-yellow)';
      systemState = 'WARNING: HIGH FORCE VECTOR DETECTED';
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2>Triage Cell Control</h2>
          <p>Real-time Kinova Arm & YOLOv8 Vision Integration</p>
        </div>
        <div className="badge" style={{ backgroundColor: systemColor, color: 'white', padding: '0.5rem 1rem' }}>
          {systemState}
        </div>
      </div>

      <div className="flex gap-6 mb-6" style={{ alignItems: 'stretch' }}>
        
        {/* Simplified Status Panel */}
        <div className="card flex-col gap-4" style={{ flex: 1 }}>
          <h3 className="flex items-center gap-2"><Activity size={20} /> Sensor Array</h3>
          
          <div className="flex-col gap-2 mt-4">
            <div className="flex justify-between">
              <span style={{ fontWeight: 800 }}>WebSocket Link:</span> 
              <span>{wsStatus}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ fontWeight: 800 }}>Vision Engine:</span> 
              <span>{telemetry ? 'ONLINE (30 FPS)' : 'OFFLINE'}</span>
            </div>
          </div>
          
          <div className="mt-4 p-6" style={{ border: `3px solid ${systemColor}`, textAlign: 'center' }}>
            <Cpu size={48} color={systemColor} className="mx-auto mb-2" />
            <h4>CELL 2 STATUS: {systemState}</h4>
          </div>
        </div>

        {/* E-STOP Panel */}
        <div className="card flex items-center justify-center" style={{ flex: 1, backgroundColor: eStopActive ? 'var(--accent-red)' : 'var(--bg-secondary)' }}>
          {eStopActive ? (
            <div className="text-center" style={{ color: 'white' }}>
              <AlertOctagon size={64} className="mx-auto mb-4" />
              <h2>SYSTEM HALTED</h2>
              <p style={{ color: 'white' }}>Technician reset required.</p>
            </div>
          ) : (
            <button className="btn btn-estop" onClick={triggerEStop}>
              <AlertOctagon size={32} /> EMERGENCY STOP
            </button>
          )}
        </div>
      </div>

      {/* Detection Stream */}
      <div className="card">
        <h3>Live Classifications</h3>
        {telemetry ? (
          <div className="flex gap-4 mt-4">
            {telemetry.yolo_detections.map((d: any, idx: number) => (
              <div key={idx} className="badge" style={{ fontSize: '1.2rem', padding: '1rem' }}>
                {d.class} ({(d.confidence * 100).toFixed(0)}%)
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4">Waiting for telemetry stream...</p>
        )}
      </div>

    </div>
  );
}
