// src/components/OrderTrackingModal.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TruckIcon, 
  PackageIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon, 
  CreditCardIcon,
  ShoppingBagIcon
} from 'lucide-react';

const statusIcons = {
  pending: <ClockIcon className="text-yellow-500" />,
  payment_uploaded: <CreditCardIcon className="text-blue-500" />,
  payment_confirmed: <CheckCircleIcon className="text-green-500" />,
  processing: <PackageIcon className="text-purple-500" />,
  shipped: <TruckIcon className="text-indigo-500" />,
  delivered: <ShoppingBagIcon className="text-green-600" />,
  cancelled: <XCircleIcon className="text-red-500" />
};

const OrderTrackingModal = ({ isOpen, onClose, trackingNumber, orderStatus }) => {
  return (
    <AnimatePresence>
      {isOpen && orderStatus && (
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
          >
            <h2 className="text-2xl font-serif text-pink-600 mb-6">Order Status</h2>
            <div className="flex items-center mb-4">
              <div className="mr-4">
                {statusIcons[orderStatus.status]}
              </div>
              <div>
                <p className="font-semibold">{orderStatus.status.replace('_', ' ').charAt(0).toUpperCase() + orderStatus.status.replace('_', ' ').slice(1)}</p>
                <p className="text-sm text-gray-500">Last Updated: {new Date(orderStatus.created_at).toLocaleString()}</p>
              </div>
            </div>
            <p className="mb-2">Tracking Number: {trackingNumber}</p>
            <div className="mt-6 bg-gray-100 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Order Timeline</h3>
              <div className="space-y-4">
                {['pending', 'payment_uploaded', 'payment_confirmed', 'processing', 'shipped', 'delivered'].map((status, index) => (
                  <div key={status} className={`flex items-center ${orderStatus.status === status ? 'text-pink-600' : 'text-gray-400'}`}>
                    <div className="mr-4">{statusIcons[status]}</div>
                    <p>{status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}</p>
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={onClose}
              className="mt-6 w-full bg-pink-500 text-white py-2 rounded-full hover:bg-pink-600 transition-colors duration-300"
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OrderTrackingModal;