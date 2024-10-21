// src/components/LoadingSpinner.jsx
import React from 'react';

const LoadingSpinner = () => (
  <div className="min-h-screen bg-pink-50 flex items-center justify-center">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-pink-600"></div>
      <p className="mt-4 text-xl text-pink-600">Loading our elegant collection...</p>
    </div>
  </div>
);

export default LoadingSpinner;