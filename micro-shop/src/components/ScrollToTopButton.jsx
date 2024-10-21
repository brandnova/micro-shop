// src/components/ScrollToTopButton.jsx
import React from 'react';
import { FaArrowUp } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const ScrollToTopButton = ({ isVisible, onClick }) => (
  <AnimatePresence>
    {isVisible && (
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        onClick={onClick}
        className="fixed bottom-8 right-8 bg-pink-500 text-white p-3 rounded-full shadow-lg hover:bg-pink-600 transition-colors duration-300"
        aria-label="Scroll to top"
      >
        <FaArrowUp />
      </motion.button>
    )}
  </AnimatePresence>
);

export default ScrollToTopButton;