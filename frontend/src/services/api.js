import axios from 'axios';
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3003/api' });
api.interceptors.request.use((config) => { const token = localStorage.getItem('auth_token'); if (token) config.headers.Authorization = `Bearer ${token}`; return config; });
export const employeeApi = { getAll: (params) => api.get('/employees', { params }), getById: (id) => api.get(`/employees/${id}`), create: (data) => api.post('/employees', data), update: (id, data) => api.put(`/employees/${id}`, data), delete: (id) => api.delete(`/employees/${id}`) };
export const departmentApi = { getAll: () => api.get('/departments'), getTree: () => api.get('/departments/tree'), getById: (id) => api.get(`/departments/${id}`) };
export const attendanceApi = { checkIn: (employeeId) => api.post('/attendance/check-in', { employeeId }), checkOut: (employeeId) => api.post('/attendance/check-out', { employeeId }), getByEmployee: (id, params) => api.get(`/attendance/employee/${id}`, { params }) };
export const leaveApi = { create: (data) => api.post('/leave', data), approve: (id, notes) => api.put(`/leave/${id}/approve`, { notes }), reject: (id, notes) => api.put(`/leave/${id}/reject`, { notes }) };
export const reportApi = { summary: () => api.get('/reports/summary'), departments: () => api.get('/reports/departments'), attendance: () => api.get('/reports/attendance') };
export default api;
