// src/components/admin/TransactionsFilter.jsx
import React from 'react';

const TransactionsFilter = ({ 
  searchTerm, 
  statusFilter, 
  statusOptions, 
  onSearchChange, 
  onStatusFilterChange
}) => {
  return (
    <div className="mb-4 flex flex-col md:flex-row md:items-center md:space-x-4">
      <input
        type="text"
        placeholder="Search transactions..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="p-2 border rounded w-full md:w-1/3 focus:border-pink-500 focus:ring focus:ring-pink-200 mb-2 md:mb-0"
      />
      <select
        value={statusFilter}
        onChange={(e) => onStatusFilterChange(e.target.value)}
        className="p-2 border rounded w-full md:w-1/4 focus:border-pink-500 focus:ring focus:ring-pink-200"
      >
        <option value="all">All Statuses</option>
        {statusOptions.map((status) => (
          <option key={status} value={status}>
            {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
          </option>
        ))}
      </select>
    </div>
  );
};

export default TransactionsFilter;