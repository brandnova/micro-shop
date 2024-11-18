import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ShareButtons from './ShareButtons';

const ProductModal = ({ product, onClose, addToCart, loading, isOpen, mainColor }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!product || !isOpen) return null;

  const handleAddToCart = () => {
    addToCart(product, 1);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? product.images.length - 1 : prevIndex - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === product.images.length - 1 ? 0 : prevIndex + 1
    );
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
            className="bg-white p-8 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-500 p-3 rounded-full bg-white hover:text-gray-700 transition-colors duration-300"
              aria-label="Close modal"
            >
              <FaTimes style={{ color: mainColor }} size={24} />
            </button>
            
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/2 mb-4 md:mb-0 relative">
                <img 
                  src={product.images[currentImageIndex].image} 
                  alt={`${product.name} - Image ${currentImageIndex + 1}`}
                  className="w-full h-auto object-cover rounded-lg"
                />
                {product.images.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 transition-all duration-300"
                      aria-label="Previous image"
                    >
                      <ChevronLeft size={24} color={mainColor} />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 transition-all duration-300"
                      aria-label="Next image"
                    >
                      <ChevronRight size={24} color={mainColor} />
                    </button>
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
                      {product.images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`h-3 w-3 rounded-full ${
                            index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                          }`}
                          aria-label={`Go to image ${index + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}
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