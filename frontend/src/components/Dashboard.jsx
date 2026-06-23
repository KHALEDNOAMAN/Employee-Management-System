import React from 'react';
const cards = [
  { title: 'Total Employees', value: '20', icon: 'ðŸ‘¥', change: '+3 this month', color: '#3b82f6' },
  { title: 'Active Today', value: '17', icon: 'âœ…', change: '85% attendance', color: '#22c55e' },
  { title: 'On Leave', value: '2', icon: 'ðŸ–ï¸', change: '1 pending approval', color: '#f59e0b' },
  { title: 'Open Positions', value: '4', icon: 'ðŸ“‹', change: '2 interviews scheduled', color: '#8b5cf6' },
];
const recentHires = [
  { name: 'Khaled Noaman', dept: 'Frontend Dev', date: '2026-06-01' },
  { name: 'Pelin Acar', dept: 'DevOps', date: '2026-05-01' },
  { name: 'Kerem Kilic', dept: 'Frontend Dev', date: '2026-04-01' },
];
export default function Dashboard() {
  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>ðŸ‘¥ HR Dashboard</h1>
      <p style={{ color: '#64748b', marginBottom: 24 }}>Employee overview and workforce analytics</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 32 }}>
        {cards.map(c => (
          <div key={c.title} style={{ background: 'white', borderRadius: 16, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: `4px solid ${c.color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: 24 }}>{c.icon}</span></div>
            <p style={{ color: '#64748b', fontSize: 13, marginTop: 8 }}>{c.title}</p>
            <p style={{ fontSize: 28, fontWeight: 700 }}>{c.value}</p>
            <p style={{ fontSize: 12, color: '#22c55e', marginTop: 4 }}>{c.change}</p>
          </div>
        ))}
      </div>
      <div style={{ background: 'white', borderRadius: 16, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>ðŸ†• Recent Hires</h2>
        {recentHires.map(h => (
          <div key={h.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
            <div><p style={{ fontWeight: 600 }}>{h.name}</p><p style={{ fontSize: 13, color: '#64748b' }}>{h.dept}</p></div>
            <span style={{ fontSize: 13, color: '#94a3b8' }}>{h.date}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
