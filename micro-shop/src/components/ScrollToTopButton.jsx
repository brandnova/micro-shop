import React from 'react';
import { FaArrowUp } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const ScrollToTopButton = ({ isVisible, onClick, mainColor }) => (
  <AnimatePresence>
    {isVisible && (
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        onClick={onClick}
        className="fixed bottom-8 right-8 text-white p-3 rounded-full shadow-lg hover:opacity-90 transition-opacity duration-300"
        style={{ backgroundColor: mainColor }}
        aria-label="Scroll to top"
      >
        <FaArrowUp />
      </motion.button>
    )}
  </AnimatePresence>
);

export default ScrollToTopButton;