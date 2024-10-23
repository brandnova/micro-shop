// src/components/admin/Sidebar.jsx
import React from 'react';
import { FaBox, FaExchangeAlt, FaTimes, FaBars, FaCog } from 'react-icons/fa';
import { motion } from 'framer-motion';

const Sidebar = ({ sidebarOpen, setSidebarOpen, activeSection, setActiveSection, setShowSiteSettingsModal }) => {
  return (
    <motion.div
      initial={{ width: sidebarOpen ? 256 : 55 }}
      animate={{ width: sidebarOpen ? 256 : 55 }}
      transition={{ duration: 0.3 }}
      className="bg-gradient-to-b from-pink-600 to-purple-700 text-white"
    >
      <div className="p-4 flex justify-between items-center">
        <h2 className={`${sidebarOpen ? 'block' : 'hidden'} text-2xl font-bold`}>Admin</h2>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white focus:outline-none">
          {sidebarOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
      </div>
      <nav className="mt-8">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setActiveSection('products')}
          className={`flex items-center w-full p-4 ${activeSection === 'products' ? 'bg-pink-700' : 'hover:bg-pink-500'}`}
        >
          <FaBox size={20} />
          {sidebarOpen && <span className="ml-4">Manage Products</span>}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setActiveSection('transactions')}
          className={`flex items-center w-full p-4 ${activeSection === 'transactions' ? 'bg-pink-700' : 'hover:bg-pink-500'}`}
        >
          <FaExchangeAlt size={20} />
          {sidebarOpen && <span className="ml-4">View Transactions</span>}
        </motion.button>
      </nav>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowSiteSettingsModal(true)}
        className="flex items-center w-full p-4 hover:bg-pink-500"
      >
        <FaCog size={20} />
        {sidebarOpen && <span className="ml-4">Site Settings</span>}
      </motion.button>
    </motion.div>
  );
};

export default Sidebar;