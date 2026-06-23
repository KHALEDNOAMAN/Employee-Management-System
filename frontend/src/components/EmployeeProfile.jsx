import React, { useState } from 'react';
const tabs = ['Personal', 'Employment', 'Compensation', 'Documents', 'History', 'Notes'];
const employee = {
  name: 'Khaled Noaman', number: 'EMP-2026-006', position: 'Junior Frontend Developer', department: 'Frontend Development',
  status: 'active', email: 'khaled.noaman@edunova.com', phone: '+90 533 020 20 22', city: 'Istanbul',
  hireDate: '2026-06-01', type: 'Intern', salary: 12000, manager: 'Elif Demir',
};
export default function EmployeeProfile() {
  const [activeTab, setActiveTab] = useState('Personal');
  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: 24 }}>
      <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 24, fontWeight: 700 }}>KN</div>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700 }}>{employee.name}</h1>
            <p style={{ color: '#64748b' }}>{employee.position} - {employee.department}</p>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <span style={{ background: '#f0fdf4', color: '#16a34a', padding: '2px 10px', borderRadius: 12, fontSize: 12 }}>{employee.status}</span>
              <span style={{ background: '#eff6ff', color: '#2563eb', padding: '2px 10px', borderRadius: 12, fontSize: 12 }}>{employee.number}</span>
            </div>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, overflowX: 'auto' }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setActiveTab(t)} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: activeTab === t ? '#2563eb' : '#f1f5f9', color: activeTab === t ? 'white' : '#64748b', fontWeight: 600, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap' }}>{t}</button>
        ))}
      </div>
      <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        {activeTab === 'Personal' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[['Email', employee.email], ['Phone', employee.phone], ['City', employee.city], ['Manager', employee.manager]].map(([l, v]) => (
              <div key={l}><p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>{l}</p><p style={{ fontWeight: 600 }}>{v}</p></div>
            ))}
          </div>
        )}
        {activeTab === 'Employment' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[['Hire Date', employee.hireDate], ['Type', employee.type], ['Department', employee.department], ['Position', employee.position]].map(([l, v]) => (
              <div key={l}><p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>{l}</p><p style={{ fontWeight: 600 }}>{v}</p></div>
            ))}
          </div>
        )}
        {activeTab === 'Compensation' && (
          <div><p style={{ fontSize: 12, color: '#94a3b8' }}>Current Salary</p><p style={{ fontSize: 28, fontWeight: 700 }}>â‚º{employee.salary.toLocaleString()}</p></div>
        )}
        {['Documents', 'History', 'Notes'].includes(activeTab) && (
          <p style={{ color: '#94a3b8', textAlign: 'center', padding: 32 }}>No {activeTab.toLowerCase()} records found</p>
        )}
      </div>
    </div>
  );
}
