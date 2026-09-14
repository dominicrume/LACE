import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const CARDS = [
  {
    id: 'resident',
    title: 'The Resident',
    description: 'Report E-Waste for Collection',
    icon: '🏠',
    username: 'user1', // Not strictly in DB right now, but we can use a dummy or skip auth for resident
    color: '#3b82f6', // blue
    route: '/resident'
  },
  {
    id: 'driver',
    title: 'The Driver',
    description: 'Navigate Collection Route',
    icon: '🚐',
    username: 'tech1', // Driver is tech facing
    color: '#10b981', // green
    route: '/driver'
  },
  {
    id: 'warehouse',
    title: 'The Warehouse',
    description: 'AI Telemetry & PAT Safety',
    icon: '🤖',
    username: 'admin1', // Admin facing
    color: '#f59e0b', // amber
    route: '/warehouse'
  },
  {
    id: 'auditor',
    title: 'The Auditor',
    description: 'Verify Cryptographic Ledger',
    icon: '🏛️',
    username: 'gov1', // Gov facing
    color: '#8b5cf6', // purple
    route: '/auditor'
  }
];

export default function LandingPortal() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSelectJourney = async (card: typeof CARDS[0]) => {
    setLoading(card.id);
    try {
      // Magic Authentication
      const formBody = new URLSearchParams();
      formBody.append('username', card.username);
      formBody.append('password', 'password'); // all dummy accounts use 'password'

      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        credentials: 'include',
        body: formBody.toString()
      });

      if (!res.ok) {
        // Fallback for purely visual testing if backend is unreachable
        console.warn("Backend auth failed. Simulating local auth.");
        let simulatedRole = 'USER';
        if (card.username === 'tech1') simulatedRole = 'TECH';
        if (card.username === 'admin1') simulatedRole = 'ADMIN';
        if (card.username === 'gov1') simulatedRole = 'GOVERNMENT';
        login(simulatedRole as any);
      } else {
        const data = await res.json();
        login(data.role.toUpperCase());
      }
      
      navigate(card.route);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="landing-portal">
      <div className="portal-header">
        <h1 className="portal-title">Experience LACE</h1>
        <p className="portal-subtitle">Choose your journey.</p>
      </div>

      <div className="portal-grid">
        {CARDS.map((card) => (
          <button 
            key={card.id}
            className={`portal-card ${loading === card.id ? 'loading' : ''}`}
            onClick={() => handleSelectJourney(card)}
            disabled={loading !== null}
            style={{ '--card-color': card.color } as any}
          >
            <div className="portal-card-icon">{card.icon}</div>
            <h2 className="portal-card-title">{card.title}</h2>
            <p className="portal-card-desc">{card.description}</p>
            {loading === card.id && <div className="portal-card-loader">Authenticating Magic...</div>}
          </button>
        ))}
      </div>
    </div>
  );
}
