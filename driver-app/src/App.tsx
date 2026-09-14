import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import DesktopLayout from './layouts/DesktopLayout';

import DriverRoute from './views/DriverRoute';
import OperatorDashboard from './views/OperatorDashboard';
import SafetySignoff from './views/SafetySignoff';
import Statistics from './views/Statistics';

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false, staleTime: 1000 * 60 } },
});

// A simple login screen to mock real authentication selection
function LoginScreen() {
  const { login } = useAuth();
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const formBody = new URLSearchParams();
      formBody.append('username', username);
      formBody.append('password', password);

      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        credentials: 'include',
        body: formBody.toString()
      });

      if (!res.ok) {
        throw new Error('Invalid credentials');
      }

      const data = await res.json();
      login(data.role.toUpperCase());
    } catch (err: any) {
      setError(err.message);
    }
  };
  
  return (
    <div className="flex items-center justify-center" style={{ minHeight: '100vh' }}>
      <div style={{ position: 'absolute', top: '2rem', left: '2rem' }}>
        <h1 style={{ background: 'linear-gradient(135deg, #22d3ee, #10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>LACE v2</h1>
      </div>
      
      <form onSubmit={handleSubmit} className="card flex-col gap-6" style={{ maxWidth: '420px', width: '100%', padding: '2.5rem' }}>
        <div>
          <h2>Enterprise Portal</h2>
          <p>Sign in to the Ladywood Automated Circular Exchange.</p>
        </div>
        
        {error && <div className="badge danger" style={{ width: '100%', justifyContent: 'center' }}>{error}</div>}
        
        <div className="flex-col gap-4">
          <input 
            className="input-solid" 
            placeholder="Username (e.g. admin1, tech1, gov1)" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
          />
          <input 
            type="password"
            className="input-solid" 
            placeholder="Password (password)" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
          />
          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem', marginTop: '0.5rem' }}>Secure Login</button>
        </div>
      </form>
    </div>
  );
}

function RouterFlow() {
  const { role } = useAuth();

  if (!role) {
    return <LoginScreen />;
  }

  // Omnichannel Unified Experience
  return (
    <Routes>
      <Route path="/" element={<DesktopLayout />}>
        {/* Default redirects */}
        <Route index element={<Navigate to={role === 'GOVERNMENT' ? "/statistics" : role === 'USER' ? "/mobile-route" : "/operator"} replace />} />
        
        {/* All core views are mounted. DesktopLayout controls sidebar visibility based on role */}
        <Route path="operator" element={<OperatorDashboard />} />
        <Route path="safety" element={<SafetySignoff />} />
        <Route path="statistics" element={<Statistics />} />
        <Route path="mobile-route" element={<DriverRoute />} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <RouterFlow />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
