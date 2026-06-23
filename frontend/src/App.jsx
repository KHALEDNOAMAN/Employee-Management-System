import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import EmployeeList from './components/EmployeeList';
import EmployeeProfile from './components/EmployeeProfile';
import DepartmentTree from './components/DepartmentTree';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/ems/dashboard" />} />
        <Route path="/ems/dashboard" element={<Dashboard />} />
        <Route path="/ems/employees" element={<EmployeeList />} />
        <Route path="/ems/employees/:id" element={<EmployeeProfile />} />
        <Route path="/ems/departments" element={<DepartmentTree />} />
      </Routes>
    </BrowserRouter>
  );
}
