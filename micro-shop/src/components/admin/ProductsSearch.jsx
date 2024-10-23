import React from 'react';

const ProductsSearch = ({ searchTerm, onSearchChange }) => {
  return (
    <div className="mb-4">
      <input
        type="text"
        placeholder="Search products by name, category or description..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="p-2 border rounded w-full md:w-1/2 focus:border-pink-500 focus:ring focus:ring-pink-200"
      />
    </div>
  );
};

export default ProductsSearch;