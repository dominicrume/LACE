
import { Outlet, NavLink } from 'react-router-dom';
import { Activity, ShieldAlert, BarChart3, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function DesktopLayout() {
  const { role, logout } = useAuth();

  return (
    <div className="flex" style={{ minHeight: '100vh' }}>
      {/* Heavy Brutalist Sidebar */}
      <aside className="card flex-col justify-between" style={{ width: '280px', borderTop: 'none', borderLeft: 'none', borderBottom: 'none', borderRadius: 0, boxShadow: '4px 0 0 var(--border-color)', zIndex: 10 }}>
        
        <div className="flex-col gap-6">
          <div className="flex items-center gap-2 mb-4">
            <div style={{ width: 32, height: 32, background: 'var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 16, height: 16, background: 'var(--bg-primary)', border: '2px solid var(--border-color)' }}></div>
            </div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--border-color)' }}>LACE</h1>
          </div>
          
          <div className="badge" style={{ marginBottom: '1rem', width: 'fit-content' }}>ROLE: {role}</div>

          <nav className="flex-col gap-4">
            {(role === 'TECH' || role === 'ADMIN') && (
              <>
                <NavLink to="/mobile-route" className={({ isActive }) => `btn ${isActive ? 'btn-primary' : ''}`} style={{ justifyContent: 'flex-start' }}>
                  <Activity size={18} /> Driver Route
                </NavLink>
                <NavLink to="/operator" className={({ isActive }) => `btn ${isActive ? 'btn-primary' : ''}`} style={{ justifyContent: 'flex-start' }}>
                  <Activity size={18} /> Telemetry
                </NavLink>
                <NavLink to="/safety" className={({ isActive }) => `btn ${isActive ? 'btn-primary' : ''}`} style={{ justifyContent: 'flex-start' }}>
                  <ShieldAlert size={18} /> PAT Testing
                </NavLink>
              </>
            )}

            {(role === 'ADMIN' || role === 'GOVERNMENT') && (
              <NavLink to="/statistics" className={({ isActive }) => `btn ${isActive ? 'btn-primary' : ''}`} style={{ justifyContent: 'flex-start' }}>
                <BarChart3 size={18} /> Analytics Scorecard
              </NavLink>
            )}
          </nav>
        </div>

        <button className="btn btn-danger" onClick={logout} style={{ marginTop: '2rem' }}>
          <LogOut size={18} /> Logout
        </button>

      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '2rem', background: 'var(--bg-secondary)', overflowY: 'auto' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
