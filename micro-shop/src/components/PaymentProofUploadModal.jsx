// src/components/PaymentProofUploadModal.jsx
import React, { useState } from 'react';
import { FaTimes, FaCheckCircle } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const PaymentProofUploadModal = ({ isOpen, onClose }) => {
  const [uploadTrackingNumber, setUploadTrackingNumber] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [message, setMessage] = useState({ type: null, content: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleUploadPaymentProof = async () => {
    if (!uploadTrackingNumber || !uploadFile) {
      setMessage({ type: 'error', content: 'Please provide both tracking number and payment proof file.' });
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append('tracking_number', uploadTrackingNumber);
    formData.append('payment_proof', uploadFile);

    try {
      const response = await axios.post('/api/upload-payment-proof/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.status === 200) {
        setMessage({ type: 'success', content: 'Payment proof uploaded successfully!' });
        setUploadTrackingNumber('');
        setUploadFile(null);
      }
    } catch (error) {
      console.error('Error uploading payment proof:', error);
      setMessage({ type: 'error', content: 'Failed to upload payment proof. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

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
          >
            <h2 className="text-2xl font-serif text-pink-600 mb-6">Upload Payment Proof</h2>
            <input
              type="text"
              value={uploadTrackingNumber}
              onChange={(e) => setUploadTrackingNumber(e.target.value)}
              placeholder="Enter tracking number"
              className="w-full mb-4 p-2 border rounded-full"
            />
            <div className="mb-4">
              <label htmlFor="file-upload" className="cursor-pointer bg-pink-100 text-pink-600 px-4 py-2 rounded-full hover:bg-pink-200 transition-colors duration-300">
                Choose File
              </label>
              <input
                id="file-upload"
                type="file"
                onChange={(e) => setUploadFile(e.target.files[0])}
                accept="image/*,application/pdf"
                className="hidden"
              />
              <span className="ml-2">{uploadFile ? uploadFile.name : 'No file chosen'}</span>
            </div>
            <button
              onClick={handleUploadPaymentProof}
              disabled={isLoading}
              className="w-full bg-pink-500 text-white py-2 rounded-full hover:bg-pink-600 transition-colors duration-300 disabled:bg-pink-300"
            >
              {isLoading ? 'Uploading...' : 'Upload Proof'}
            </button>
            <button
              onClick={onClose}
              className="mt-4 w-full border border-pink-500 text-pink-500 py-2 rounded-full hover:bg-pink-50 transition-colors duration-300"
            >
              Close
            </button>
            {message.content && (
              <div className={`mt-4 p-3 rounded-lg ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                {message.type === 'error' ? (
                  <FaTimes className="inline-block mr-2" />
                ) : (
                  <FaCheckCircle className="inline-block mr-2" />
                )}
                {message.content}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PaymentProofUploadModal;