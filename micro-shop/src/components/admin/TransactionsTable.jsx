// src/components/admin/TransactionsTable.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { FaFileUpload } from 'react-icons/fa';

const TransactionsTable = ({ 
  transactions, 
  statusOptions, 
  handleUpdateTransactionStatus, 
  handleViewPaymentProof 
}) => {
  if (!transactions.length) {
    return (
      <div className="bg-white shadow-md rounded-lg p-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-lg text-gray-600">No transactions found matching your filters.</p>
          <p className="text-sm text-gray-500 mt-2">Try adjusting your search criteria or status filter.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full bg-white shadow-md rounded-lg overflow-hidden">
        <thead className="bg-gradient-to-r from-pink-100 to-purple-100 text-pink-800">
          <tr>
            <th className="p-3 text-left">Tracking Number</th>
            <th className="p-3 text-left">Name</th>
            <th className="p-3 text-left">Email</th>
            <th className="p-3 text-left">Total Amount</th>
            <th className="p-3 text-left">Status</th>
            <th className="p-3 text-left">Payment Proof</th>
            <th className="p-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <motion.tr
              key={transaction.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="border-b border-pink-100 hover:bg-pink-50"
            >
              <td className="p-3">{transaction.tracking_number}</td>
              <td className="p-3">{transaction.name}</td>
              <td className="p-3">{transaction.email}</td>
              <td className="p-3">₦{transaction.total_amount}</td>
              <td className="p-3">{transaction.status.replace('_', ' ')}</td>
              <td className="p-3">
                {transaction.payment_proof ? (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleViewPaymentProof(transaction.payment_proof)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <FaFileUpload size={18} />
                  </motion.button>
                ) : (
                  'Not uploaded'
                )}
              </td>
              <td className="p-3">
                <select
                  value={transaction.status}
                  onChange={(e) => handleUpdateTransactionStatus(transaction.id, e.target.value)}
                  className="p-2 border rounded"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionsTable;