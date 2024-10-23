// src/components/LoadingSpinner.jsx
import React from 'react';

const LoadingSpinner = ({ mainColor, lighterShade }) => (
  <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: lighterShade }}>
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2" style={{ borderColor: mainColor }}></div>
      <p className="mt-4 text-xl" style={{ color: mainColor }}>Loading our elegant collection...</p>
    </div>
  </div>
);

export default LoadingSpinner;