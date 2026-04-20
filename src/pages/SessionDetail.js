import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSession, getSessionExplain, getSessionKG } from '../api';

function StatCard({ label, value, color }) {
  return (
    <div style={{ background:'#1e293b', borderRadius:8, padding:'14px 20px', minWidth:120 }}>
      <div style={{ color:'#64748b', fontSize:12, marginBottom:4 }}>{label}</div>
      <div style={{ color: color || '#e2e8f0', fontSize:22, fontWeight:700 }}>{value}</div>
    </div>
  );
}

function Timeline({ matches }) {
  if (!matches?.length) return <p style={{ color:'#64748b' }}>No rule matches recorded.</p>;
  return (
    <div style={{ position:'relative', paddingLeft:20 }}>
      <div style={{ position:'absolute', left:7, top:0, bottom:0, width:2, background:'#334155' }} />
      {matches.map((m, i) => (
        <div key={i} style={{ display:'flex', gap:12, marginBottom:16, position:'relative' }}>
          <div style={{ width:14, height:14, borderRadius:'50%', background:'#0284c7', border:'2px solid #1e293b',
                        position:'absolute', left:-20, top:3, zIndex:1 }} />
          <div style={{ background:'#1e293b', borderRadius:6, padding:'10px 14px', flex:1 }}>
            <div style={{ color:'#38bdf8', fontWeight:600, fontSize:13 }}>{m.rule_id || m.rule_name}</div>
            <div style={{ color:'#64748b', fontSize:12, marginTop:2 }}>{m.matched_at?.substring(0,19)}</div>
            <div style={{ color:'#94a3b8', fontSize:12, marginTop:4 }}>
              Δ score: +{m.skill_delta} | window count: {m.window_count}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function KGGraph({ triples }) {
  if (!triples?.length) return <p style={{ color:'#64748b' }}>No knowledge graph data.</p>;

  // Build unique nodes and edges for a simple force-graph-style SVG
  const nodeMap = new Map();
  const edges = [];

  triples.forEach(t => {
    if (!nodeMap.has(t.src)) nodeMap.set(t.src, { id: t.src, type: t.src.split(':')[0] });
    if (!nodeMap.has(t.dst)) nodeMap.set(t.dst, { id: t.dst, type: t.dst.split(':')[0] });
    edges.push({ src: t.src, dst: t.dst, rel: t.rel });
  });

  const nodes = Array.from(nodeMap.values());
  const TYPE_COLOR = { session:'#0284c7', event:'#7c3aed', rule:'#dc2626', ip:'#d97706', indicator:'#059669' };

  // Simple circular layout
  const cx = 300, cy = 200, r = 150;
  const posMap = new Map(nodes.map((n, i) => {
    const angle = (2 * Math.PI * i) / nodes.length;
    return [n.id, { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) }];
  }));

  return (
    <div style={{ overflowX:'auto' }}>
      <svg width={600} height={400} style={{ display:'block', margin:'0 auto' }}>
        <defs>
          <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#475569" />
          </marker>
        </defs>
        {edges.map((e, i) => {
          const s = posMap.get(e.src), d = posMap.get(e.dst);
          if (!s || !d) return null;
          return (
            <g key={i}>
              <line x1={s.x} y1={s.y} x2={d.x} y2={d.y}
                stroke="#475569" strokeWidth={1.5} markerEnd="url(#arrow)" opacity={0.6} />
              <text x={(s.x+d.x)/2} y={(s.y+d.y)/2 - 4} fill="#64748b" fontSize={9} textAnchor="middle">
                {e.rel}
              </text>
            </g>
          );
        })}
        {nodes.map(n => {
          const pos = posMap.get(n.id);
          if (!pos) return null;
          const color = TYPE_COLOR[n.type] || '#64748b';
          const label = n.id.length > 20 ? n.id.substring(0, 18) + '…' : n.id;
          return (
            <g key={n.id}>
              <circle cx={pos.x} cy={pos.y} r={18} fill={color} opacity={0.85} />
              <text x={pos.x} y={pos.y + 4} textAnchor="middle" fill="#fff" fontSize={9} fontWeight={600}>
                {n.type[0].toUpperCase()}
              </text>
              <text x={pos.x} y={pos.y + 28} textAnchor="middle" fill="#94a3b8" fontSize={9}>
                {label}
              </text>
            </g>
          );
        })}
      </svg>
      <div style={{ display:'flex', gap:12, justifyContent:'center', marginTop:8, flexWrap:'wrap' }}>
        {Object.entries({ session:'#0284c7', event:'#7c3aed', rule:'#dc2626', ip:'#d97706', indicator:'#059669' }).map(([t,c]) => (
          <div key={t} style={{ display:'flex', alignItems:'center', gap:4 }}>
            <div style={{ width:10, height:10, borderRadius:'50%', background:c }} />
            <span style={{ color:'#64748b', fontSize:11 }}>{t}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SessionDetail() {
  const { id } = useParams();
  const [session, setSession] = useState(null);
  const [explain, setExplain] = useState(null);
  const [kg, setKG] = useState(null);
  const [tab, setTab] = useState('timeline');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getSession(id).catch(() => null),
      getSessionExplain(id).catch(() => null),
      getSessionKG(id).catch(() => null),
    ]).then(([s, e, k]) => {
      setSession(s?.data);
      setExplain(e?.data);
      setKG(k?.data);
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p style={{ color:'#64748b' }}>Loading session…</p>;
  if (!session) return <p style={{ color:'#ef4444' }}>Session not found.</p>;

  const TABS = [
    { key: 'timeline', label: '⏱ Timeline' },
    { key: 'kg', label: '🕸 Knowledge Graph' },
    { key: 'explain', label: '💡 Explanation' },
  ];

  return (
    <div>
      <div style={{ marginBottom:20 }}>
        <Link to="/sessions" style={{ color:'#64748b', textDecoration:'none', fontSize:13 }}>← Sessions</Link>
        <h2 style={{ margin:'8px 0 4px', color:'#e2e8f0', fontFamily:'monospace' }}>{id}</h2>
        <span style={{ color:'#64748b', fontFamily:'monospace', fontSize:13 }}>{session.source_ip}</span>
      </div>

      <div style={{ display:'flex', gap:12, marginBottom:24 }}>
        <StatCard label="Skill Score" value={session.skill_score}
          color={session.skill_score >= 8 ? '#ef4444' : session.skill_score >= 4 ? '#f59e0b' : '#22c55e'} />
        <StatCard label="Level" value={`L${session.current_level}`} />
        <StatCard label="Events" value={session.event_count} />
        <StatCard label="First Seen" value={session.first_seen?.substring(0,10)} />
      </div>

      {explain?.summary && (
        <div style={{ background:'#1e293b', borderRadius:8, padding:'12px 16px', marginBottom:20,
                      borderLeft:'3px solid #0284c7', color:'#94a3b8', fontSize:13 }}>
          {explain.summary}
        </div>
      )}

      <div style={{ display:'flex', gap:0, marginBottom:20, borderBottom:'1px solid #334155' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{ padding:'10px 20px', background:'transparent', border:'none', cursor:'pointer',
                     color: tab === t.key ? '#38bdf8' : '#64748b', fontSize:14,
                     borderBottom: tab === t.key ? '2px solid #38bdf8' : '2px solid transparent' }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'timeline' && <Timeline matches={explain?.rule_matches} />}
      {tab === 'kg' && <KGGraph triples={kg?.triples} />}
      {tab === 'explain' && (
        <div>
          <h3 style={{ color:'#94a3b8', fontSize:15, marginBottom:12 }}>Decisions History</h3>
          {explain?.decisions_history?.length ? (
            explain.decisions_history.map((d, i) => (
              <div key={i} style={{ background:'#1e293b', borderRadius:6, padding:'12px 16px', marginBottom:8 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                  <span style={{ color:'#38bdf8', fontWeight:600, fontSize:13 }}>{d.action}</span>
                  <span style={{ color:'#64748b', fontSize:12 }}>{d.sent_at?.substring(0,19)}</span>
                </div>
                <div style={{ color:'#94a3b8', fontSize:13 }}>{d.explanation}</div>
                <div style={{ color:'#64748b', fontSize:12, marginTop:4 }}>Score after: {d.skill_score_after}</div>
              </div>
            ))
          ) : <p style={{ color:'#64748b' }}>No decisions recorded.</p>}
        </div>
      )}
    </div>
  );
}
