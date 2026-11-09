import { useMemo, useState } from 'react';

export function useCustomers(customers, searchTerm) {
  // Track the active sorting column and direction
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' | 'desc'

  // 1. Filter items based on the search query across columns
  const filteredCustomers = useMemo(() => {
    const searchLower = searchTerm.trim().toLowerCase();
    if (!searchLower) return customers;

    return customers.filter((customer) =>
      [
        customer.name,
        customer.company,
        customer.email,
        customer.country,
        customer.phone,
        customer.status,
      ]
        .map((val) => (val || '').toString().toLowerCase())
        .some((value) => value.includes(searchLower))
    );
  }, [customers, searchTerm]);

  // 2. Sort items when a table column header is clicked
  const sortedCustomers = useMemo(() => {
    let result = [...filteredCustomers];

    if (sortField) {
      result.sort((a, b) => {
        const valA = (a[sortField] || '').toString().toLowerCase();
        const valB = (b[sortField] || '').toString().toLowerCase();

        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [filteredCustomers, sortField, sortDirection]);

  // Toggles sort field and flips directions smoothly
  const handleSort = (field) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortField(null);
        setSortDirection('asc');
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return {
    sortedCustomers,
    sortField,
    sortDirection,
    handleSort,
  };
}
