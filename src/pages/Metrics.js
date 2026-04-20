import React, { useEffect, useState } from 'react';
import { getMetrics, getPools } from '../api';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

const COLORS = ['#0284c7', '#f59e0b', '#ef4444', '#22c55e', '#8b5cf6'];

function StatCard({ label, value, sub, color }) {
  return (
    <div style={{ background:'#1e293b', borderRadius:8, padding:'18px 22px', flex:1, minWidth:140 }}>
      <div style={{ color:'#64748b', fontSize:12, marginBottom:6 }}>{label}</div>
      <div style={{ color: color || '#e2e8f0', fontSize:28, fontWeight:700 }}>{value ?? '—'}</div>
      {sub && <div style={{ color:'#475569', fontSize:12, marginTop:4 }}>{sub}</div>}
    </div>
  );
}

function PoolBar({ pools }) {
  if (!pools?.pools?.length) return null;
  return (
    <div style={{ background:'#1e293b', borderRadius:8, padding:20, marginBottom:20 }}>
      <h3 style={{ color:'#94a3b8', margin:'0 0 16px', fontSize:15 }}>Container Pool Status</h3>
      <div style={{ display:'flex', gap:12 }}>
        {pools.pools.map(p => (
          <div key={p.level} style={{ flex:1, background:'#0f172a', borderRadius:6, padding:14 }}>
            <div style={{ color:'#64748b', fontSize:12, marginBottom:8 }}>Level {p.level}</div>
            <div style={{ display:'flex', gap:8 }}>
              <div style={{ flex: p.idle, background:'#22c55e', height:8, borderRadius:4, opacity:0.8 }} title={`Idle: ${p.idle}`} />
              <div style={{ flex: p.busy, background:'#f59e0b', height:8, borderRadius:4, opacity:0.8 }} title={`Busy: ${p.busy}`} />
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', marginTop:6, fontSize:11, color:'#475569' }}>
              <span>🟢 {p.idle} idle</span>
              <span>🟡 {p.busy} busy</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Metrics() {
  const [metrics, setMetrics] = useState(null);
  const [pools, setPools] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    setLoading(true);
    try {
      const [m, p] = await Promise.all([getMetrics(), getPools()]);
      setMetrics(m.data);
      setPools(p.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  if (loading) return <p style={{ color:'#64748b' }}>Loading metrics…</p>;

  const sessions = metrics?.sessions || {};
  const decisions = metrics?.decisions || {};

  const levelData = Object.entries(sessions.by_level || {}).map(([k, v]) => ({
    name: `Level ${k}`, value: v,
  }));

  const actionData = Object.entries(decisions.by_action || {}).map(([k, v]) => ({
    name: k.replace('escalate_to_', '→ ').replace('_', ' '), value: v,
  }));

  const services = [
    { name: 'Cerebrum', ...metrics?.cerebrum },
    { name: 'Orchestrator', ...metrics?.orchestrator },
  ];

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', marginBottom:20 }}>
        <h2 style={{ margin:0, color:'#e2e8f0', fontSize:20 }}>Metrics</h2>
        <button onClick={fetch} style={{ marginLeft:'auto', padding:'6px 14px', background:'#334155',
          color:'#e2e8f0', border:'none', borderRadius:6, cursor:'pointer', fontSize:13 }}>Refresh</button>
      </div>

      <div style={{ display:'flex', gap:12, marginBottom:20, flexWrap:'wrap' }}>
        <StatCard label="Total Sessions" value={sessions.total} />
        <StatCard label="Avg Skill Score" value={sessions.avg_skill_score}
          color={sessions.avg_skill_score > 5 ? '#ef4444' : '#22c55e'} />
        <StatCard label="Total Decisions" value={decisions.total} />
        <StatCard label="Cerebrum" value={metrics?.cerebrum?.status || '?'}
          color={metrics?.cerebrum?.status === 'ok' ? '#22c55e' : '#ef4444'} />
        <StatCard label="Orchestrator" value={metrics?.orchestrator?.status || '?'}
          color={metrics?.orchestrator?.status === 'ok' ? '#22c55e' : '#ef4444'} />
      </div>

      <PoolBar pools={pools} />

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:20 }}>
        <div style={{ background:'#1e293b', borderRadius:8, padding:20 }}>
          <h3 style={{ color:'#94a3b8', margin:'0 0 16px', fontSize:15 }}>Sessions by Level</h3>
          {levelData.length ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={levelData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                  {levelData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background:'#1e293b', border:'1px solid #334155', color:'#e2e8f0' }} />
                <Legend wrapperStyle={{ color:'#94a3b8', fontSize:12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <p style={{ color:'#64748b', textAlign:'center', marginTop:40 }}>No data</p>}
        </div>

        <div style={{ background:'#1e293b', borderRadius:8, padding:20 }}>
          <h3 style={{ color:'#94a3b8', margin:'0 0 16px', fontSize:15 }}>Decisions by Action</h3>
          {actionData.length ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={actionData} margin={{ left:-10 }}>
                <XAxis dataKey="name" tick={{ fill:'#64748b', fontSize:11 }} />
                <YAxis tick={{ fill:'#64748b', fontSize:11 }} />
                <Tooltip contentStyle={{ background:'#1e293b', border:'1px solid #334155', color:'#e2e8f0' }} />
                <Bar dataKey="value" fill="#0284c7" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p style={{ color:'#64748b', textAlign:'center', marginTop:40 }}>No decisions yet</p>}
        </div>
      </div>

      <div style={{ background:'#1e293b', borderRadius:8, padding:20 }}>
        <h3 style={{ color:'#94a3b8', margin:'0 0 12px', fontSize:15 }}>Service Status</h3>
        <div style={{ display:'flex', gap:12 }}>
          {services.map(s => (
            <div key={s.name} style={{ background:'#0f172a', borderRadius:6, padding:'10px 16px', flex:1 }}>
              <div style={{ color:'#64748b', fontSize:12 }}>{s.name}</div>
              <div style={{ color: s.status === 'ok' ? '#22c55e' : '#ef4444', fontWeight:700, marginTop:4 }}>
                {s.status || 'unknown'}
              </div>
              {s.rules_loaded !== undefined && <div style={{ color:'#475569', fontSize:12 }}>{s.rules_loaded} rules loaded</div>}
              {s.sessions_active !== undefined && <div style={{ color:'#475569', fontSize:12 }}>{s.sessions_active} active sessions</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
