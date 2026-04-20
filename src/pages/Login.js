// src/pages/Login.js
import React, { useState } from 'react';
import { login } from '../api';

export default function Login({ onLogin }) {
  const [user, setUser] = useState('admin');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await login(user, pass);
      onLogin(res.data.token);
    } catch {
      setError('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight:'100vh', background:'#0f172a', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'system-ui,sans-serif' }}>
      <div style={{ background:'#1e293b', padding:40, borderRadius:12, minWidth:360, boxShadow:'0 8px 32px #0005' }}>
        <h1 style={{ color:'#38bdf8', margin:'0 0 8px', fontSize:22 }}>⬡ dynamic-labyrinth</h1>
        <p style={{ color:'#64748b', margin:'0 0 28px', fontSize:13 }}>Honeypot Command Center</p>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom:16 }}>
            <label style={{ color:'#94a3b8', fontSize:13, display:'block', marginBottom:6 }}>Username</label>
            <input value={user} onChange={e => setUser(e.target.value)}
              style={{ width:'100%', padding:'10px 12px', background:'#0f172a', border:'1px solid #334155',
                       borderRadius:6, color:'#e2e8f0', fontSize:14, boxSizing:'border-box' }} />
          </div>
          <div style={{ marginBottom:24 }}>
            <label style={{ color:'#94a3b8', fontSize:13, display:'block', marginBottom:6 }}>Password</label>
            <input type="password" value={pass} onChange={e => setPass(e.target.value)}
              style={{ width:'100%', padding:'10px 12px', background:'#0f172a', border:'1px solid #334155',
                       borderRadius:6, color:'#e2e8f0', fontSize:14, boxSizing:'border-box' }} />
          </div>
          {error && <p style={{ color:'#f87171', fontSize:13, margin:'0 0 16px' }}>{error}</p>}
          <button type="submit" disabled={loading}
            style={{ width:'100%', padding:'11px', background:'#0284c7', color:'#fff', border:'none',
                     borderRadius:6, fontSize:15, fontWeight:600, cursor:'pointer' }}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
