import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const OrderConfirmationModal = ({ isOpen, onClose, trackingNumber, bankDetails, mainColor, lightenedShade, lighterShade }) => {
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
            <h2 className="text-2xl font-serif mb-6" style={{ color: mainColor }}>Order Confirmed</h2>
            <p className="mb-4">Your order has been received and the admin will contact you shortly.</p>
            <p className="mb-4">Your tracking number is: <strong style={{ color: mainColor }}>{trackingNumber}</strong></p>
            <p className="mb-4">Please use this tracking number to check your order status and upload payment proof.</p>
            <p className="mb-4">To get priority attention, please make the payment using the following bank details:</p>
            <h3 className="font-semibold mb-2" style={{ color: mainColor }}>Payment Details:</h3>
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

export default OrderConfirmationModal;