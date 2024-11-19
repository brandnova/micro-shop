// src/components/admin/ProductsTable.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { FaEdit, FaTrash } from 'react-icons/fa';

const ProductsTable = ({ products, handleEditProduct, handleDeleteProduct }) => {
  if (!products.length) {
    return (
      <div className="bg-white shadow-md rounded-lg p-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-lg text-gray-600">No products found matching your search.</p>
          <p className="text-sm text-gray-500 mt-2">Try adjusting your search criteria.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full bg-white shadow-md rounded-lg overflow-hidden">
        <thead className="bg-gradient-to-r from-pink-100 to-purple-100 text-pink-800">
          <tr>
            <th className="p-3 text-left">Image</th>
            <th className="p-3 text-left">Name</th>
            <th className="p-3 text-left">Category</th>
            <th className="p-3 text-left">Description</th>
            <th className="p-3 text-left">Price</th>
            <th className="p-3 text-left">Quantity</th>
            <th className="p-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <motion.tr
              key={product.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="border-b border-pink-100 hover:bg-pink-50"
            >
              <td className="p-3">
                <img
                  src={product.images.find(img => img.is_primary)?.image || '/placeholder-image.jpg'}
                  alt={product.name}
                  className="w-12 h-12 object-cover rounded"
                />
              </td>
              <td className="p-3">{product.name}</td>
              <td className="p-3">{product.category}</td>
              <td className="p-3">{product.description}</td>
              <td className="p-3">₦{product.price}</td>
              <td className="p-3">{product.quantity}</td>
              <td className="p-3">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleEditProduct(product)}
                  className="mr-2 text-blue-600 hover:text-blue-800"
                >
                  <FaEdit size={18} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleDeleteProduct(product.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <FaTrash size={18} />
                </motion.button>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductsTable;