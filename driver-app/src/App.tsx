import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { AuthProvider, useAuth } from './contexts/AuthContext';

import LandingPortal from './views/LandingPortal';
import ResidentPortal from './views/ResidentPortal';
import DriverPortal from './views/DriverPortal';
import WarehouseHUD from './views/WarehouseHUD';
import AiTriage from './views/AiTriage';

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

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPortal />} />
            
            <Route path="/resident" element={
              <ProtectedRoute><ResidentPortal /></ProtectedRoute>
            } />
            
            <Route path="/driver" element={
              <ProtectedRoute><DriverPortal /></ProtectedRoute>
            } />
            
            <Route path="/warehouse" element={
              <ProtectedRoute><WarehouseHUD /></ProtectedRoute>
            } />
            
            <Route path="/ai-core" element={
              <ProtectedRoute><AiTriage /></ProtectedRoute>
            } />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
