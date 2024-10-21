// src/components/OrderManagementSection.jsx
import React from 'react';
import { FaSearch, FaUpload } from 'react-icons/fa';

const OrderManagementSection = ({ trackingNumber, setTrackingNumber, handleTrackOrder, setIsUploadOpen }) => (
  <section className="mb-16 bg-pink-100 rounded-lg p-8">
    <h2 className="text-2xl font-serif text-pink-600 mb-4">Order Management</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <h3 className="font-semibold mb-2">Track Your Order</h3>
        <div className="flex">
          <input
            type="text"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            placeholder="Enter tracking number"
            className="flex-grow p-2 border rounded-l"
          />
          <button
            onClick={handleTrackOrder}
            className="bg-pink-500 text-white px-4 py-2 rounded-r hover:bg-pink-600 transition-colors duration-300"
          >
            <FaSearch />
          </button>
        </div>
      </div>
      <div>
        <h3 className="font-semibold mb-2">Upload Payment Proof</h3>
        <button
          onClick={() => setIsUploadOpen(true)}
          className="w-full bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600 transition-colors duration-300"
        >
          <FaUpload className="inline-block mr-2" /> Upload Proof
        </button>
      </div>
    </div>
  </section>
);

export default OrderManagementSection;