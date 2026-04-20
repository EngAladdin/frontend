// src/pages/Rules.js
import React, { useEffect, useState } from 'react';
import { getRules, deleteRule } from '../api';

export default function Rules() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await getRules();
      setRules(res.data.rules || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const handleDisable = async (id) => {
    if (!window.confirm(`Disable rule "${id}"?`)) return;
    try { await deleteRule(id); fetch(); } catch { alert('Failed'); }
  };

  const filtered = rules.filter(r =>
    r.id.toLowerCase().includes(search.toLowerCase()) ||
    r.name?.toLowerCase().includes(search.toLowerCase())
  );

  const ACTION_COLOR = {
    escalate_to_level_2: '#f59e0b',
    escalate_to_level_3: '#ef4444',
    flag: '#8b5cf6',
    log: '#22c55e',
  };

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', marginBottom:20, gap:12 }}>
        <h2 style={{ margin:0, color:'#e2e8f0', fontSize:20 }}>Rules <span style={{ color:'#64748b', fontWeight:400, fontSize:14 }}>({filtered.length})</span></h2>
        <input placeholder="Search rules…" value={search} onChange={e => setSearch(e.target.value)}
          style={{ marginLeft:'auto', padding:'7px 12px', background:'#1e293b', border:'1px solid #334155',
                   color:'#e2e8f0', borderRadius:6, fontSize:13, width:220 }} />
        <button onClick={fetch} style={{ padding:'7px 14px', background:'#334155', color:'#e2e8f0',
          border:'none', borderRadius:6, cursor:'pointer', fontSize:13 }}>Refresh</button>
      </div>

      {loading ? <p style={{ color:'#64748b' }}>Loading…</p> : (
        <div style={{ display:'grid', gap:12 }}>
          {filtered.map(r => {
            const defn = typeof r.definition === 'object' ? r.definition : {};
            const action = defn.action || '';
            return (
              <div key={r.id} style={{ background:'#1e293b', borderRadius:8, padding:'14px 18px',
                                       borderLeft:`3px solid ${ACTION_COLOR[action] || '#475569'}`,
                                       opacity: r.enabled ? 1 : 0.5 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
                  <span style={{ color:'#e2e8f0', fontWeight:600, fontSize:14 }}>{r.name}</span>
                  <code style={{ color:'#64748b', fontSize:11, background:'#0f172a', padding:'2px 6px', borderRadius:4 }}>{r.id}</code>
                  <span style={{ color: ACTION_COLOR[action] || '#64748b', fontSize:12, marginLeft:'auto' }}>
                    {action}
                  </span>
                  {r.enabled ? (
                    <button onClick={() => handleDisable(r.id)}
                      style={{ padding:'3px 10px', background:'#7f1d1d', color:'#fca5a5', border:'none',
                               borderRadius:4, cursor:'pointer', fontSize:12 }}>Disable</button>
                  ) : (
                    <span style={{ color:'#64748b', fontSize:12, padding:'3px 10px' }}>Disabled</span>
                  )}
                </div>
                <div style={{ color:'#64748b', fontSize:13 }}>{r.description}</div>
                {defn.aggregation && (
                  <div style={{ color:'#475569', fontSize:12, marginTop:4 }}>
                    Agg: {defn.aggregation.count_threshold}× {defn.aggregation.value} in {defn.aggregation.window_seconds}s
                  </div>
                )}
                <div style={{ display:'flex', gap:8, marginTop:6, flexWrap:'wrap' }}>
                  {(defn.protocols || []).map(p => (
                    <span key={p} style={{ background:'#0f172a', color:'#38bdf8', fontSize:11,
                                           padding:'2px 8px', borderRadius:10 }}>{p}</span>
                  ))}
                  <span style={{ color:'#475569', fontSize:12 }}>Δ +{defn.skill_delta} score</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
