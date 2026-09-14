import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Truck, Activity, ShieldAlert, BarChart3, Settings, User } from 'lucide-react';

export default function Layout() {
  const [role, setRole] = useState('Operator');
  const navigate = useNavigate();

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRole(e.target.value);
    // Simple auto-routing based on role selection for demo purposes
    switch (e.target.value) {
      case 'Driver': navigate('/'); break;
      case 'Operator': navigate('/operator'); break;
      case 'Technician': navigate('/safety'); break;
      case 'Auditor': navigate('/statistics'); break;
    }
  };

  return (
    <div className="layout flex" style={{ minHeight: '100vh' }}>
      {/* Sidebar Navigation */}
      <aside className="glass-panel flex-col" style={{ width: '280px', margin: '1rem', borderRadius: '24px', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="flex items-center gap-2 mb-8 px-2">
          <div className="logo-orb" style={{ width: 32, height: 32, background: 'var(--primary)', borderRadius: '50%', boxShadow: '0 0 15px var(--primary-glow)' }}></div>
          <h2 style={{ margin: 0, fontSize: '1.25rem', background: 'linear-gradient(90deg, #fff, #a5b4fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>LACE Platform</h2>
        </div>

        {/* Role Switcher (Mock Auth) */}
        <div className="glass-card mb-6" style={{ padding: '1rem' }}>
          <div className="flex items-center gap-2 mb-2">
            <User size={16} color="var(--text-muted)" />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Active Role</span>
          </div>
          <select 
            value={role} 
            onChange={handleRoleChange}
            style={{ width: '100%', padding: '0.5rem', background: 'rgba(0,0,0,0.5)', color: '#fff', border: '1px solid var(--glass-border)', borderRadius: '8px', outline: 'none' }}
          >
            <option>Driver</option>
            <option>Operator</option>
            <option>Technician</option>
            <option>Auditor</option>
          </select>
        </div>

        <nav className="flex-col gap-2" style={{ display: 'flex' }}>
          {(role === 'Driver' || role === 'Auditor') && (
            <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Truck size={18} /> Route Logistics
            </NavLink>
          )}
          
          {(role === 'Operator' || role === 'Auditor') && (
            <NavLink to="/operator" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Activity size={18} /> Robotic Feed
            </NavLink>
          )}

          {(role === 'Technician' || role === 'Auditor') && (
            <NavLink to="/safety" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <ShieldAlert size={18} /> Safety Signoff
            </NavLink>
          )}

          {role === 'Auditor' && (
            <NavLink to="/statistics" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <BarChart3 size={18} /> Scorecard
            </NavLink>
          )}
        </nav>

        <div style={{ marginTop: 'auto', padding: '1rem 0' }}>
          <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'flex-start', border: 'none', opacity: 0.7 }}>
            <Settings size={18} /> Settings
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-col" style={{ flex: 1, padding: '1rem 1rem 1rem 0', height: '100vh', overflow: 'hidden' }}>
        <div className="glass-panel" style={{ height: '100%', borderRadius: '24px', overflowY: 'auto', position: 'relative' }}>
          <Outlet />
        </div>
      </main>

      <style>{`
        .nav-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.85rem 1rem;
          color: var(--text-muted);
          text-decoration: none;
          border-radius: var(--radius-md);
          font-weight: 500;
          transition: all 0.2s ease;
          border: 1px solid transparent;
        }
        .nav-link:hover {
          background: rgba(255,255,255,0.05);
          color: var(--text-main);
        }
        .nav-link.active {
          background: rgba(99, 102, 241, 0.15);
          color: #fff;
          border: 1px solid rgba(99, 102, 241, 0.3);
          box-shadow: 0 0 20px rgba(99, 102, 241, 0.1);
        }
      `}</style>
    </div>
  );
}
