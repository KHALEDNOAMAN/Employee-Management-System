import React, { useState } from 'react';
const departments = [
  { id: 1, name: 'Technology', code: 'TECH', employees: 12, budget: 2500000, children: [
    { id: 2, name: 'Frontend Development', code: 'TECH-FE', employees: 5, budget: 800000, children: [] },
    { id: 3, name: 'Backend Development', code: 'TECH-BE', employees: 4, budget: 900000, children: [] },
    { id: 4, name: 'DevOps', code: 'TECH-DO', employees: 3, budget: 500000, children: [] },
  ]},
  { id: 5, name: 'Content', code: 'CONT', employees: 3, budget: 600000, children: [] },
  { id: 6, name: 'Marketing', code: 'MRKT', employees: 2, budget: 800000, children: [] },
  { id: 7, name: 'Human Resources', code: 'HR', employees: 2, budget: 400000, children: [] },
  { id: 8, name: 'Finance', code: 'FIN', employees: 2, budget: 350000, children: [] },
  { id: 9, name: 'Operations', code: 'OPS', employees: 1, budget: 300000, children: [] },
];
function DeptNode({ dept, depth = 0 }) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = dept.children && dept.children.length > 0;
  return (
    <div style={{ marginLeft: depth * 24 }}>
      <div onClick={() => setExpanded(!expanded)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', background: 'white', borderRadius: 12, marginBottom: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.05)', cursor: hasChildren ? 'pointer' : 'default' }}>
        {hasChildren && <span style={{ fontSize: 12 }}>{expanded ? 'â–¼' : 'â–¶'}</span>}
        <span style={{ fontWeight: 600 }}>{dept.name}</span>
        <span style={{ fontSize: 12, color: '#94a3b8', fontFamily: 'monospace' }}>{dept.code}</span>
        <span style={{ marginLeft: 'auto', fontSize: 13 }}>ðŸ‘¥ {dept.employees}</span>
        <span style={{ fontSize: 13, color: '#64748b' }}>â‚º{(dept.budget/1000).toFixed(0)}K</span>
      </div>
      {expanded && hasChildren && dept.children.map(child => <DeptNode key={child.id} dept={child} depth={depth + 1} />)}
    </div>
  );
}
export default function DepartmentTree() {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>ðŸ¢ Department Hierarchy</h1>
      <p style={{ color: '#64748b', marginBottom: 24 }}>Organization structure and team distribution</p>
      {departments.map(d => <DeptNode key={d.id} dept={d} />)}
    </div>
  );
}
