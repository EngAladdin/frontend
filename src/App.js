import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import Sessions from './pages/Sessions';
import SessionDetail from './pages/SessionDetail';
import Rules from './pages/Rules';
import Metrics from './pages/Metrics';
import Login from './pages/Login';
import { logout } from './api';

function NavBar({ onLogout }) {
  return (
    <nav style={{ background: '#1e293b', padding: '0 24px', display: 'flex', alignItems: 'center', height: 56 }}>
      <span style={{ color: '#38bdf8', fontWeight: 700, fontSize: 18, marginRight: 32, letterSpacing: 1 }}>
        ⬡ dynamic-labyrinth
      </span>
      {[
        { to: '/sessions', label: 'Sessions' },
        { to: '/rules', label: 'Rules' },
        { to: '/metrics', label: 'Metrics' },
      ].map(({ to, label }) => (
        <Link key={to} to={to} style={{ color: '#94a3b8', textDecoration: 'none', marginRight: 24, fontSize: 14 }}>
          {label}
        </Link>
      ))}
      <button
        onClick={onLogout}
        style={{ marginLeft: 'auto', background: 'transparent', border: '1px solid #475569',
                 color: '#94a3b8', cursor: 'pointer', padding: '4px 14px', borderRadius: 4, fontSize: 13 }}>
        Logout
      </button>
    </nav>
  );
}

function ProtectedLayout({ onLogout }) {
  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#e2e8f0', fontFamily: 'system-ui,sans-serif' }}>
      <NavBar onLogout={onLogout} />
      <div style={{ padding: 24 }}>
        <Routes>
          <Route path="/sessions" element={<Sessions />} />
          <Route path="/sessions/:id" element={<SessionDetail />} />
          <Route path="/rules" element={<Rules />} />
          <Route path="/metrics" element={<Metrics />} />
          <Route path="*" element={<Navigate to="/sessions" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  const [authed, setAuthed] = useState(!!localStorage.getItem('dl_token'));

  const handleLogin = (token) => {
    localStorage.setItem('dl_token', token);
    setAuthed(true);
  };

  const handleLogout = async () => {
    try { await logout(); } catch (_) {}
    localStorage.removeItem('dl_token');
    setAuthed(false);
  };

  return (
    <BrowserRouter>
      {authed ? (
        <ProtectedLayout onLogout={handleLogout} />
      ) : (
        <Routes>
          <Route path="*" element={<Login onLogin={handleLogin} />} />
        </Routes>
      )}
    </BrowserRouter>
  );
}
