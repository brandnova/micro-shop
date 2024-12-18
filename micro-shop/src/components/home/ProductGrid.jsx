// src/components/ProductGrid.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ChevronLeft, ChevronRight } from 'lucide-react';

const ProductGrid = ({ products, onProductClick, onAddToCart, isLoading, mainColor, lightenedShade, lighterShade }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const productsPerPage = 9;

  const filteredProducts = useMemo(() => {
    return products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleSearchToggle = () => {
    setIsSearchOpen(!isSearchOpen);
    if (isSearchOpen) {
      setSearchTerm('');
    }
  };

  return (
    <section className="relative pb-16">
      <h2 className="text-3xl font-serif mb-8" style={{ color: mainColor }}>Our Exquisite Collection</h2>
      
      <div className="sticky top-20 z-50">
        <motion.div
          initial={false}
          animate={isSearchOpen ? "open" : "closed"}
          className="relative h-14"
        >
          <motion.div
            variants={{
              open: { width: "100%", right: 0 },
              closed: { width: "56px", right: "16px" }
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute top-2 border h-10 rounded-full overflow-hidden flex items-center"
            style={{ backgroundColor: lightenedShade, borderColor: mainColor }}
          >
            <AnimatePresence>
              {isSearchOpen && (
                <motion.input
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-full pl-4 pr-12 bg-transparent border-none focus:outline-none"
                  style={{ color: mainColor }}
                />
              )}
            </AnimatePresence>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSearchToggle}
              className="absolute right-0 h-10 w-14 text-white rounded-full flex items-center justify-center"
              style={{ backgroundColor: mainColor }}
              aria-label={isSearchOpen ? "Close search" : "Open search"}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={isSearchOpen ? "close" : "search"}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {isSearchOpen ? <X size={20} /> : <Search size={20} />}
                </motion.div>
              </AnimatePresence>
            </motion.button>
          </motion.div>
        </motion.div>
      </div>

      {currentProducts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-4">
            {currentProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => onProductClick(product)}
                onAddToCart={() => onAddToCart(product)}
                isLoading={isLoading[product.id]}
                mainColor={mainColor}
                lightenedShade={lightenedShade}
              />
            ))}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            mainColor={mainColor}
            lightenedShade={lightenedShade}
          />
        </>
      ) : (
        <p className="text-xl text-center mt-8" style={{ color: mainColor }}>No products found. Please try a different search term.</p>
      )}
    </section>
  );
};

const ProductCard = ({ product, onClick, onAddToCart, isLoading, mainColor, lightenedShade }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? product.images.length - 1 : prevIndex - 1
    );
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prevIndex) => 
      prevIndex === product.images.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <motion.div
      className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer"
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
    >
      <div className="relative">
        <img 
          src={product.images[currentImageIndex].image} 
          alt={`${product.name} - Image ${currentImageIndex + 1}`} 
          className="w-full h-64 object-cover"
        />
        {product.images.length > 1 && (
          <>
            <button
              onClick={handlePrevImage}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 rounded-full p-1 hover:bg-opacity-75 transition-all duration-300"
              aria-label="Previous image"
            >
              <ChevronLeft size={20} color={mainColor} />
            </button>
            <button
              onClick={handleNextImage}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 rounded-full p-1 hover:bg-opacity-75 transition-all duration-300"
              aria-label="Next image"
            >
              <ChevronRight size={20} color={mainColor} />
            </button>
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
              {product.images.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 w-2 rounded-full ${
                    index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2" style={{ color: mainColor }}>{product.name}</h3>
        <p className="text-gray-600 mb-2">{product.category}</p>
        <p className="text-gray-500 mb-4 h-12 overflow-hidden">{product.description}</p>
        <div className="flex justify-between items-center">
          <span className="font-bold" style={{ color: mainColor }}>₦{product.price}</span>
          <span className="text-gray-600">Quantity: {product.quantity}</span>
        </div>
        <div className="mt-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart();
            }}
            className="w-full text-white px-4 py-2 rounded-full transition-colors duration-300 disabled:opacity-50"
            style={{ 
              backgroundColor: isLoading || product.quantity === 0 ? lightenedShade : mainColor,
              color: isLoading || product.quantity === 0 ? mainColor : 'white'
            }}
            disabled={isLoading || product.quantity === 0}
          >
            {isLoading ? 'Adding...' : product.quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const Pagination = ({ currentPage, totalPages, onPageChange, mainColor, lightenedShade }) => {
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <nav className="mt-8 flex justify-center">
      <ul className="flex items-center">
        <li>
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="mx-1 px-3 py-1 rounded disabled:opacity-50"
            style={{ backgroundColor: lightenedShade, color: mainColor }}
          >
            &laquo;
          </button>
        </li>
        {pageNumbers.map((number) => (
          <li key={number}>
            <button
              onClick={() => onPageChange(number)}
              className="mx-1 px-3 py-1 rounded"
              style={{
                backgroundColor: currentPage === number ? mainColor : lightenedShade,
                color: currentPage === number ? 'white' : mainColor
              }}
            >
              {number}
            </button>
          </li>
        ))}
        <li>
          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="mx-1 px-3 py-1 rounded disabled:opacity-50"
            style={{ backgroundColor: lightenedShade, color: mainColor }}
          >
            &raquo;
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default ProductGrid;