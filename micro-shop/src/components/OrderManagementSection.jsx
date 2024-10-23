// src/components/OrderManagementSection.jsx
import React from 'react';
import { FaSearch, FaUpload } from 'react-icons/fa';

const OrderManagementSection = ({ trackingNumber, setTrackingNumber, handleTrackOrder, setIsUploadOpen, mainColor, lightenedShade }) => (
  <section className="mb-16 rounded-lg p-8" style={{ backgroundColor: lightenedShade }}>
    <h2 className="text-2xl font-serif mb-4" style={{ color: mainColor }}>Order Management</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <h3 className="font-semibold mb-2" style={{ color: mainColor }}>Track Your Order</h3>
        <div className="flex">
          <input
            type="text"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            placeholder="Enter tracking number"
            className="flex-grow p-2 border rounded-l"
            style={{ borderColor: mainColor }}
          />
          <button
            onClick={handleTrackOrder}
            className="text-white px-4 py-2 rounded-r hover:opacity-90 transition-colors duration-300"
            style={{ backgroundColor: mainColor }}
          >
            <FaSearch />
          </button>
        </div>
      </div>
      <div>
        <h3 className="font-semibold mb-2" style={{ color: mainColor }}>Upload Payment Proof</h3>
        <button
          onClick={() => setIsUploadOpen(true)}
          className="w-full text-white px-4 py-2 rounded hover:opacity-90 transition-colors duration-300"
          style={{ backgroundColor: mainColor }}
        >
          <FaUpload className="inline-block mr-2" /> Upload Proof
        </button>
      </div>
    </div>
  </section>
);

export default OrderManagementSection;