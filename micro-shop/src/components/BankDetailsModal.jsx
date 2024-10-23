import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BankDetailsModal = ({ isOpen, onClose, bankDetails, mainColor, lightenedShade, lighterShade }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white p-8 rounded-lg max-w-md w-full"
            style={{ backgroundColor: lighterShade }}
          >
            <h2 className="text-2xl font-serif mb-6" style={{ color: mainColor }}>Bank Details</h2>
            <p>Bank Name: {bankDetails.bank_name}</p>
            <p>Account Name: {bankDetails.account_name}</p>
            <p>Account Number: {bankDetails.account_number}</p>
            <button
              onClick={onClose}
              className="mt-4 hover:opacity-80 transition-opacity duration-300"
              style={{ color: mainColor }}
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BankDetailsModal;