import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';
import ShareButtons from './ShareButtons';

const ProductModal = ({ product, onClose, addToCart, loading, isOpen, mainColor }) => {
  if (!product || !isOpen) return null;

  const handleAddToCart = () => {
    addToCart(product, 1);
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
            className="bg-white p-8 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-500 p-3 rounded-full bg-white hover:text-gray-700 transition-colors duration-300"
              aria-label="Close modal"
            >
              <FaTimes style={{ color: mainColor }} size={24} />
            </button>
            
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/2 mb-4 md:mb-0">
                <img src={product.image} alt={product.name} className="w-full h-auto object-cover rounded-lg" />
              </div>
              <div className="md:w-1/2 md:pl-8">
                <h2 className="text-2xl font-serif mb-4" style={{ color: mainColor }}>{product.name}</h2>
                <p className="text-gray-600 mb-2">{product.category}</p>
                <p className="text-gray-700 mb-4">{product.description}</p>
                <p className="font-bold text-xl mb-4" style={{ color: mainColor }}>₦{product.price}</p>
                <button
                  onClick={handleAddToCart}
                  disabled={loading[product.id]}
                  className="w-full text-white py-2 rounded-full hover:opacity-90 transition-colors duration-300 disabled:opacity-50"
                  style={{ backgroundColor: mainColor }}
                >
                  {loading[product.id] ? 'Adding...' : 'Add to Cart'}
                </button>
                
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-2">Share this product</h3>
                  <ShareButtons product={product} mainColor={mainColor} />
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProductModal;