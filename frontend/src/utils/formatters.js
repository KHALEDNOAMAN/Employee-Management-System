export const formatDate = (d) => new Date(d).toLocaleDateString('tr-TR');
export const formatCurrency = (v) => `â‚º${parseFloat(v).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`;
export const formatTenure = (hireDate) => { const months = Math.floor((Date.now() - new Date(hireDate)) / (30.44 * 24 * 60 * 60 * 1000)); return months < 12 ? `${months} months` : `${Math.floor(months/12)} years ${months%12} months`; };
export const getStatusColor = (s) => ({ active: '#22c55e', on_leave: '#f59e0b', terminated: '#ef4444', resigned: '#6b7280' }[s] || '#94a3b8');
