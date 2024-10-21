// src/components/Header.jsx
import React from 'react';
import { FaShoppingCart, FaInfoCircle } from 'react-icons/fa';

const Header = ({ cartItemsCount, onOpenCart, onOpenBankDetails }) => {
  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-3xl font-serif text-pink-600">Shopping Elegance</h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={onOpenBankDetails}
            className="text-pink-600 hover:text-pink-800 transition-colors duration-300"
            aria-label="Show bank details"
          >
            <FaInfoCircle size={20} />
          </button>
          <div className="relative">
            <button
              onClick={onOpenCart}
              className="text-pink-600 hover:text-pink-800 transition-colors duration-300"
              aria-label="Open shopping cart"
            >
              <FaShoppingCart size={20} />
            </button>
            {cartItemsCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {cartItemsCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;