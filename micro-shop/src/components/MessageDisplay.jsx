import React from 'react';
import { motion } from 'framer-motion';
import { FaTimes, FaCheckCircle, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';

const MessageDisplay = ({ type, message, onClose }) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FaCheckCircle className="text-green-500 text-2xl mr-2" />;
      case 'error':
        return <FaExclamationTriangle className="text-red-500 text-2xl mr-2" />;
      case 'info':
        return <FaInfoCircle className="text-blue-500 text-2xl mr-2" />;
      default:
        return null;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-100';
      case 'error':
        return 'bg-red-100';
      case 'info':
        return 'bg-blue-100';
      default:
        return 'bg-gray-100';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 ${getBackgroundColor()} p-4 rounded-lg shadow-lg flex items-center justify-between max-w-md w-full`}
    >
      <div className="flex items-center">
        
        {getIcon()}
        <p className={`text-${type === 'error' ? 'red' : type === 'success' ? 'green' : 'blue'}-700`}>{message}</p>
      </div>
      <button
        onClick={onClose}
        className="text-gray-500 hover:text-gray-700 transition-colors duration-300"
        aria-label="Close message"
      >
        <FaTimes />
      </button>
    </motion.div>
  );
};

export default MessageDisplay;