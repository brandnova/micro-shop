// src/components/admin/ProductForm.jsx
import React from 'react';
import { motion } from 'framer-motion';

const ProductForm = ({ formData, handleInputChange, handleSubmit, editingProduct, setEditingProduct, setFormData }) => {
  return (
    <form onSubmit={handleSubmit} className="mb-8 bg-white p-4 md:p-6 rounded-lg shadow-md">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Product Name"
          className="p-2 border rounded focus:border-pink-500 focus:ring focus:ring-pink-200 w-full"
          required
        />
        <input
          type="text"
          name="category"
          value={formData.category}
          onChange={handleInputChange}
          placeholder="Category"
          className="p-2 border rounded focus:border-pink-500 focus:ring focus:ring-pink-200 w-full"
          required
        />
        <input
          type="number"
          name="price"
          value={formData.price}
          onChange={handleInputChange}
          placeholder="Price"
          className="p-2 border rounded focus:border-pink-500 focus:ring focus:ring-pink-200 w-full"
          required
        />
        <input
          type="number"
          name="quantity"
          value={formData.quantity}
          onChange={handleInputChange}
          placeholder="Quantity"
          className="p-2 border rounded focus:border-pink-500 focus:ring focus:ring-pink-200 w-full"
          required
        />
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Description"
          className="p-2 border rounded col-span-1 md:col-span-2 focus:border-pink-500 focus:ring focus:ring-pink-200 w-full"
          required
        />
        <input
          type="file"
          name="image"
          onChange={handleInputChange}
          className="p-2 border rounded col-span-1 md:col-span-2 focus:border-pink-500 focus:ring focus:ring-pink-200 w-full"
          accept="image/*"
        />
      </div>
      <div className="mt-4 flex flex-wrap gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          className="bg-gradient-to-r from-pink-500 to-purple-600 text-white py-2 px-4 rounded hover:from-pink-600 hover:to-purple-700 transition duration-300"
        >
          {editingProduct ? 'Update Product' : 'Add Product'}
        </motion.button>
        {editingProduct && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => {
              setEditingProduct(null);
              setFormData({ name: '', category: '', description: '', price: '', image: null, quantity: 0 });
            }}
            className="bg-gray-300 text-gray-800 py-2 px-4 rounded hover:bg-gray-400 transition duration-300"
          >
            Cancel Edit
          </motion.button>
        )}
      </div>
    </form>
  );
};

export default ProductForm;