import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SimulationProvider } from './contexts/SimulationContext';

import LandingPortal from './views/LandingPortal';
import MasterPipeline from './views/MasterPipeline';
import AuditorLedger from './views/AuditorLedger';

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false, staleTime: 1000 * 60 } },
});

// A wrapper to ensure users can't navigate to a portal if they aren't logged in
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { role } = useAuth();
  if (!role) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <div key={location.pathname} className="page-transition">
      <Routes location={location}>
        <Route path="/" element={<LandingPortal />} />
        
        <Route 
          path="/*" 
          element={
            <ProtectedRoute>
              <div className="page-transition">
                <MasterPipeline />
              </div>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/ledger" 
          element={
            <ProtectedRoute>
              <div className="page-transition">
                <AuditorLedger />
              </div>
            </ProtectedRoute>
          } 
        />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SimulationProvider>
          <BrowserRouter>
            <AnimatedRoutes />
          </BrowserRouter>
        </SimulationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
