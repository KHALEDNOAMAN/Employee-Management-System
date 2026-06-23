import { useState, useEffect, useMemo } from 'react';
export function useEmployeeList(initialEmployees = []) {
  const [employees] = useState(initialEmployees);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ department: '', status: '', type: '' });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const filtered = useMemo(() => {
    return employees.filter(e => {
      const matchSearch = !debouncedSearch || e.name?.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchDept = !filters.department || e.department === filters.department;
      const matchStatus = !filters.status || e.status === filters.status;
      const matchType = !filters.type || e.type === filters.type;
      return matchSearch && matchDept && matchStatus && matchType;
    });
  }, [employees, debouncedSearch, filters]);

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize);
  return { employees: paginated, total: filtered.length, page, totalPages, searchTerm, setSearchTerm, filters, setFilters, goToPage: setPage, setPageSize };
}
