import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; 
import axios from 'axios';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import HomePage from './pages/HomePage';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      verifyToken(token);
    }
  }, []);

  const verifyToken = async (token) => {
    try {
      const response = await axios.post('/api/verify-admin/', { token });
      setIsAuthenticated(response.data.valid);
    } catch (error) {
      console.error('Error verifying token:', error);
      setIsAuthenticated(false);
    }
  };

  const handleLogin = (token) => {
    localStorage.setItem('adminToken', token);
    setIsAuthenticated(true);
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />  
        <Route path="/admin" element={
          isAuthenticated ? <AdminDashboard /> : <AdminLogin onLogin={handleLogin} />
        } />
      </Routes>
    </Router>
  );
};

export default App;
