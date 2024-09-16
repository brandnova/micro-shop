import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BankDetailsModal = ({ onClose }) => {
  const [bankDetails, setBankDetails] = useState({
    bank_name: '',
    account_name: '',
    account_number: '',
  });

  useEffect(() => {
    fetchBankDetails();
  }, []);

  const fetchBankDetails = async () => {
    try {
      const response = await axios.get('/api/bank-details/');
      if (response.data.length > 0) {
        setBankDetails(response.data[0]);
      }
    } catch (error) {
      console.error('Error fetching bank details:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBankDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (bankDetails.id) {
        await axios.put(`/api/bank-details/${bankDetails.id}/`, bankDetails);
      } else {
        await axios.post('/api/bank-details/', bankDetails);
      }
      onClose();
    } catch (error) {
      console.error('Error saving bank details:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg">
        <h2 className="text-2xl font-bold text-pink-800 mb-4">Edit Bank Details</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="bank_name"
            value={bankDetails.bank_name}
            onChange={handleInputChange}
            placeholder="Bank Name"
            className="w-full p-2 mb-4 border rounded"
            required
          />
          <input
            type="text"
            name="account_name"
            value={bankDetails.account_name}
            onChange={handleInputChange}
            placeholder="Account Name"
            className="w-full p-2 mb-4 border rounded"
            required
          />
          <input
            type="text"
            name="account_number"
            value={bankDetails.account_number}
            onChange={handleInputChange}
            placeholder="Account Number"
            className="w-full p-2 mb-4 border rounded"
            required
          />
          <div className="flex justify-end">
            <button type="button" onClick={onClose} className="mr-2 px-4 py-2 bg-gray-300 rounded">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BankDetailsModal;