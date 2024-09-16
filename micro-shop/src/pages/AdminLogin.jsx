import React, { useState } from 'react';
import axios from 'axios';

const AdminLogin = ({ onLogin }) => {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/verify-admin/', { token });
      if (response.data.valid) {
        onLogin(token);
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      setError('Invalid token');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-pink-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-pink-800 mb-4">Admin Login</h2>
        <input
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Enter admin token"
          className="w-full p-2 mb-4 border rounded"
          required
        />
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <button type="submit" className="w-full bg-pink-600 text-white py-2 px-4 rounded hover:bg-pink-700">
          Login
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;