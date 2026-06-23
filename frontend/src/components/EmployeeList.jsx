import React, { useState } from 'react';
const employees = [
  { id: 1, number: 'EMP-2024-001', name: 'Ahmet Yilmaz', dept: 'Technology', position: 'CTO', type: 'Full-time', status: 'active', hireDate: '2024-01-15' },
  { id: 2, number: 'EMP-2024-002', name: 'Elif Demir', dept: 'Frontend', position: 'Senior Dev', type: 'Full-time', status: 'active', hireDate: '2024-02-01' },
  { id: 3, number: 'EMP-2024-003', name: 'Mehmet Kaya', dept: 'Backend', position: 'Senior Dev', type: 'Full-time', status: 'active', hireDate: '2024-02-15' },
  { id: 4, number: 'EMP-2024-004', name: 'Fatma Celik', dept: 'Frontend', position: 'UX Designer', type: 'Full-time', status: 'active', hireDate: '2024-03-01' },
  { id: 5, number: 'EMP-2024-005', name: 'Ayse Ozturk', dept: 'Content', position: 'Writer', type: 'Full-time', status: 'on_leave', hireDate: '2024-03-15' },
  { id: 6, number: 'EMP-2026-006', name: 'Khaled Noaman', dept: 'Frontend', position: 'Intern Dev', type: 'Intern', status: 'active', hireDate: '2026-06-01' },
];
const statusColors = { active: { bg: '#f0fdf4', text: '#16a34a' }, on_leave: { bg: '#fffbeb', text: '#d97706' }, terminated: { bg: '#fef2f2', text: '#dc2626' } };
export default function EmployeeList() {
  const [search, setSearch] = useState('');
  const filtered = employees.filter(e => e.name.toLowerCase().includes(search.toLowerCase()) || e.number.includes(search));
  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <div><h1 style={{ fontSize: 24, fontWeight: 700 }}>ðŸ‘¥ Employee Directory</h1><p style={{ color: '#64748b' }}>{employees.length} employees</p></div>
        <button style={{ background: '#2563eb', color: 'white', border: 'none', padding: '10px 20px', borderRadius: 12, fontWeight: 600 }}>+ Add Employee</button>
      </div>
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or employee number..." style={{ width: '100%', padding: 12, borderRadius: 12, border: '1px solid #d1d5db', marginBottom: 16, fontSize: 14 }} />
      <div style={{ background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ background: '#f8fafc' }}>
            {['Employee #', 'Name', 'Department', 'Position', 'Type', 'Status', 'Hire Date'].map(h => (
              <th key={h} style={{ textAlign: 'left', padding: 12, fontSize: 13, color: '#64748b' }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>{filtered.map(e => {
            const sc = statusColors[e.status] || statusColors.active;
            return (
              <tr key={e.id} style={{ borderTop: '1px solid #f1f5f9', cursor: 'pointer' }}>
                <td style={{ padding: 12, fontSize: 13, fontFamily: 'monospace' }}>{e.number}</td>
                <td style={{ padding: 12, fontWeight: 600 }}>{e.name}</td>
                <td style={{ padding: 12, fontSize: 13 }}>{e.dept}</td>
                <td style={{ padding: 12, fontSize: 13 }}>{e.position}</td>
                <td style={{ padding: 12, fontSize: 13 }}>{e.type}</td>
                <td style={{ padding: 12 }}><span style={{ background: sc.bg, color: sc.text, padding: '2px 8px', borderRadius: 12, fontSize: 12 }}>{e.status}</span></td>
                <td style={{ padding: 12, fontSize: 13, color: '#64748b' }}>{e.hireDate}</td>
              </tr>
            );
          })}</tbody>
        </table>
      </div>
    </div>
  );
}
