import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSessions, exportSessionsCSV } from '../api';

const LEVEL_COLOR = { 1: '#22c55e', 2: '#f59e0b', 3: '#ef4444' };

function Badge({ level }) {
  return (
    <span style={{ background: LEVEL_COLOR[level] || '#64748b', color: '#fff', fontSize: 11,
                   padding: '2px 8px', borderRadius: 12, fontWeight: 700 }}>
      L{level}
    </span>
  );
}

export default function Sessions() {
  const [sessions, setSessions] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ min_score: 0, level: '' });
  const [page, setPage] = useState(0);
  const limit = 50;

  const fetch = async () => {
    setLoading(true);
    try {
      const params = { limit, offset: page * limit, min_score: filter.min_score };
      if (filter.level) params.level = filter.level;
      const res = await getSessions(params);
      setSessions(res.data.sessions || []);
      setTotal(res.data.total || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, [page, filter]);

  const handleExport = async () => {
    try {
      const res = await exportSessionsCSV();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url; a.download = 'sessions.csv'; a.click();
    } catch (e) { alert('Export failed'); }
  };

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', marginBottom:20, gap:12 }}>
        <h2 style={{ margin:0, color:'#e2e8f0', fontSize:20 }}>Sessions <span style={{ color:'#64748b', fontWeight:400, fontSize:14 }}>({total})</span></h2>
        <div style={{ marginLeft:'auto', display:'flex', gap:8 }}>
          <select value={filter.level} onChange={e => setFilter(f => ({...f, level: e.target.value}))}
            style={{ padding:'6px 10px', background:'#1e293b', border:'1px solid #334155', color:'#e2e8f0', borderRadius:6, fontSize:13 }}>
            <option value="">All levels</option>
            {[1,2,3].map(l => <option key={l} value={l}>Level {l}</option>)}
          </select>
          <input type="number" placeholder="Min score" min={0} value={filter.min_score}
            onChange={e => setFilter(f => ({...f, min_score: +e.target.value}))}
            style={{ width:100, padding:'6px 10px', background:'#1e293b', border:'1px solid #334155', color:'#e2e8f0', borderRadius:6, fontSize:13 }} />
          <button onClick={handleExport}
            style={{ padding:'6px 14px', background:'#0369a1', color:'#fff', border:'none', borderRadius:6, cursor:'pointer', fontSize:13 }}>
            Export CSV
          </button>
          <button onClick={fetch} style={{ padding:'6px 14px', background:'#334155', color:'#e2e8f0', border:'none', borderRadius:6, cursor:'pointer', fontSize:13 }}>
            Refresh
          </button>
        </div>
      </div>

      {loading ? <p style={{ color:'#64748b' }}>Loading…</p> : (
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
          <thead>
            <tr style={{ borderBottom:'1px solid #334155', color:'#64748b', textAlign:'left' }}>
              {['Session ID','Source IP','Level','Score','Events','Last Seen'].map(h => (
                <th key={h} style={{ padding:'8px 12px', fontWeight:600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sessions.map(s => (
              <tr key={s.session_id} style={{ borderBottom:'1px solid #1e293b' }}
                onMouseEnter={e => e.currentTarget.style.background='#1e293b'}
                onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                <td style={{ padding:'10px 12px' }}>
                  <Link to={`/sessions/${s.session_id}`}
                    style={{ color:'#38bdf8', textDecoration:'none', fontFamily:'monospace', fontSize:12 }}>
                    {s.session_id}
                  </Link>
                </td>
                <td style={{ padding:'10px 12px', fontFamily:'monospace', color:'#94a3b8' }}>{s.source_ip}</td>
                <td style={{ padding:'10px 12px' }}><Badge level={s.current_level} /></td>
                <td style={{ padding:'10px 12px', color: s.skill_score >= 8 ? '#ef4444' : s.skill_score >= 4 ? '#f59e0b' : '#22c55e', fontWeight:700 }}>
                  {s.skill_score}
                </td>
                <td style={{ padding:'10px 12px', color:'#94a3b8' }}>{s.event_count}</td>
                <td style={{ padding:'10px 12px', color:'#64748b', fontSize:12 }}>{s.last_seen?.substring(0,19)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div style={{ display:'flex', gap:8, marginTop:16, justifyContent:'center' }}>
        <button disabled={page === 0} onClick={() => setPage(p => p - 1)}
          style={{ padding:'6px 16px', background:'#334155', color:'#e2e8f0', border:'none', borderRadius:6, cursor:'pointer' }}>
          ← Prev
        </button>
        <span style={{ color:'#64748b', padding:'6px 8px', fontSize:13 }}>Page {page + 1}</span>
        <button disabled={(page + 1) * limit >= total} onClick={() => setPage(p => p + 1)}
          style={{ padding:'6px 16px', background:'#334155', color:'#e2e8f0', border:'none', borderRadius:6, cursor:'pointer' }}>
          Next →
        </button>
      </div>
    </div>
  );
}
