
import { Outlet, NavLink } from 'react-router-dom';
import { Truck, Navigation, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function MobileLayout() {
  const { logout } = useAuth();

  return (
    <div style={{ paddingBottom: '80px' }}>
      {/* Mobile Top Header */}
      <header className="card flex items-center justify-between" style={{ padding: '1rem', borderTop: 'none', borderLeft: 'none', borderRight: 'none', position: 'sticky', top: 0, zIndex: 10, background: 'var(--bg-primary)' }}>
        <div className="flex items-center gap-2">
          <Truck size={24} color="var(--accent-blue)" />
          <h2 style={{ margin: 0, fontSize: '1.25rem' }}>LACE Route</h2>
        </div>
        <button className="btn btn-danger" style={{ padding: '0.5rem' }} onClick={logout}>
          <LogOut size={16} />
        </button>
      </header>

      {/* Main View Area */}
      <main className="p-6">
        <Outlet />
      </main>

      {/* Persistent Bottom Navigation for Drivers */}
      <nav className="bottom-nav">
        <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
          <Navigation size={24} />
          <span style={{ fontSize: '0.75rem', marginTop: '4px', fontWeight: 800 }}>Manifest</span>
        </NavLink>
        <div className="nav-link" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 0.5 }}>
          <Settings size={24} />
          <span style={{ fontSize: '0.75rem', marginTop: '4px', fontWeight: 800 }}>Settings</span>
        </div>
      </nav>
    </div>
  );
}
