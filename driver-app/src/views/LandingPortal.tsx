import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const CARDS = [
  {
    id: 'resident',
    title: "Emma's Doorstep",
    description: 'WhatsApp-style Triage',
    icon: '📱',
    username: 'user1',
    color: '#3b82f6', 
    route: '/resident'
  },
  {
    id: 'ai-core',
    title: 'LCX AI Core',
    description: 'Computer Vision Assessment',
    icon: '🧠',
    username: 'admin1',
    color: '#8b5cf6', 
    route: '/ai-core'
  },
  {
    id: 'driver',
    title: 'Logistics Route',
    description: 'Dynamic Collection Clustering',
    icon: '🚐',
    username: 'tech1',
    color: '#10b981', 
    route: '/driver'
  },
  {
    id: 'warehouse',
    title: 'Repair Hub',
    description: 'PAT Safety Certification',
    icon: '🛠️',
    username: 'tech1', 
    color: '#f59e0b', 
    route: '/warehouse'
  }
];

export default function LandingPortal() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSelectJourney = async (card: typeof CARDS[0]) => {
    setLoading(card.id);
    try {
      const formBody = new URLSearchParams();
      formBody.append('username', card.username);
      formBody.append('password', 'password'); 

      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        credentials: 'include',
        body: formBody.toString()
      });

      if (!res.ok) {
        let simulatedRole = 'USER';
        if (card.username === 'tech1') simulatedRole = 'TECH';
        if (card.username === 'admin1') simulatedRole = 'ADMIN';
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
        <h1 className="portal-title">Ladywood Circular Exchange</h1>
        <p className="portal-subtitle">AI-Assisted Doorstep Collection & Repair</p>
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
            {loading === card.id && <div className="portal-card-loader">Authenticating...</div>}
          </button>
        ))}
      </div>
    </div>
  );
}
