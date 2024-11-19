// src/components/admin/ProductForm.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { XCircle } from 'lucide-react';
import axios from 'axios';

const ProductForm = ({ 
  formData, 
  handleInputChange, 
  handleSubmit, 
  editingProduct, 
  setEditingProduct, 
  setFormData,
  refreshProducts
}) => {
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagesPreviews, setImagesPreviews] = useState([]);

  useEffect(() => {
    if (editingProduct) {
      setImagesPreviews(editingProduct.images.map(img => ({
        id: img.id,
        url: img.image,
        isPrimary: img.is_primary
      })));
    } else {
      setImagesPreviews([]);
    }
  }, [editingProduct]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + imagesPreviews.length > 10) {
      alert('Maximum 10 images allowed per product');
      return;
    }

    const newPreviews = files.map(file => ({
      file,
      url: URL.createObjectURL(file),
      isPrimary: imagesPreviews.length === 0 && selectedImages.length === 0
    }));

    setSelectedImages(prev => [...prev, ...files]);
    setImagesPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagesPreviews(prev => {
      const newPreviews = prev.filter((_, i) => i !== index);
      if (prev[index].isPrimary && newPreviews.length > 0) {
        newPreviews[0].isPrimary = true;
      }
      return newPreviews;
    });
  };

  const setPrimaryImage = (index) => {
    setImagesPreviews(prev => prev.map((preview, i) => ({
      ...preview,
      isPrimary: i === index
    })));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    
    Object.keys(formData).forEach(key => {
      formDataToSend.append(key, formData[key]);
    });

    const primaryImage = imagesPreviews.find(img => img.isPrimary);
    const primaryImageId = primaryImage ? primaryImage.id : null;

    try {
      if (editingProduct) {
        await axios.patch(`/api/products/${editingProduct.id}/`, formDataToSend);
      } else {
        const response = await axios.post('/api/products/', formDataToSend);
        formDataToSend.append('id', response.data.id);
      }

      if (selectedImages.length > 0 || primaryImageId) {
        const imageFormData = new FormData();
        selectedImages.forEach((file) => {
          imageFormData.append('images', file);
        });
        if (primaryImageId) {
          imageFormData.append('primary_image', primaryImageId);
        }

        await axios.post(`/api/products/${editingProduct ? editingProduct.id : formDataToSend.get('id')}/upload-images/`, imageFormData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      // Clear form and reset state
      setFormData({ name: '', category: '', description: '', price: '', quantity: 0 });
      setSelectedImages([]);
      setImagesPreviews([]);
      setEditingProduct(null);

      // Refresh products list
      refreshProducts();
    } catch (error) {
      console.error('Error submitting product:', error);
    }
  };

  return (
    <form onSubmit={handleFormSubmit} className="mb-8 bg-white p-4 md:p-6 rounded-lg shadow-md">
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
        <div className="col-span-1 md:col-span-2">
          <input
            type="file"
            name="images"
            onChange={handleImageChange}
            className="p-2 border rounded focus:border-pink-500 focus:ring focus:ring-pink-200 w-full"
            accept="image/*"
            multiple
          />
          <p className="text-sm text-gray-500 mt-1">
            Maximum 10 images allowed. First image will be set as primary by default.
          </p>
        </div>

        {imagesPreviews.length > 0 && (
          <div className="col-span-1 md:col-span-2 grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
            {imagesPreviews.map((preview, index) => (
              <div key={index} className="relative">
                <img
                  src={preview.url}
                  alt={`Preview ${index + 1}`}
                  className={`w-full h-32 object-cover rounded ${
                    preview.isPrimary ? 'ring-2 ring-pink-500' : ''
                  }`}
                />
                <div className="absolute top-2 right-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                  >
                    <XCircle size={16} />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setPrimaryImage(index)}
                  className={`mt-2 text-sm w-full py-1 px-2 rounded ${
                    preview.isPrimary
                      ? 'bg-pink-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {preview.isPrimary ? 'Primary Image' : 'Set as Primary'}
                </button>
              </div>
            ))}
          </div>
        )}
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
              setFormData({ name: '', category: '', description: '', price: '', quantity: 0 });
              setSelectedImages([]);
              setImagesPreviews([]);
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