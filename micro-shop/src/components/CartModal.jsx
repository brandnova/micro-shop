// src/components/CartModal.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';

const CartModal = ({ isOpen, onClose, cartItems, onRemoveItem, onUpdateQuantity, totalPrice, onCheckout }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-end z-50"
        >
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="w-full sm:w-96 bg-white h-full shadow-lg overflow-y-auto"
          >
            <div className="p-6 h-full flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-serif text-pink-600">Your Cart</h2>
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700 transition-colors duration-300"
                  aria-label="Close cart"
                >
                  <FaTimes size={24} />
                </button>
              </div>
              <div className="flex-grow overflow-y-auto">
                {cartItems.length === 0 ? (
                  <p className="text-gray-500">Your cart is empty</p>
                ) : (
                  cartItems.map((item) => (
                    <CartItem
                      key={item.id}
                      item={item}
                      onRemove={() => onRemoveItem(item.id)}
                      onUpdateQuantity={(newQuantity) => onUpdateQuantity(item.id, newQuantity)}
                    />
                  ))
                )}
              </div>
              <div className="mt-auto">
                <p className="text-xl font-semibold mb-4">Total: ₦{totalPrice}</p>
                <button
                  onClick={onCheckout}
                  className="w-full bg-pink-500 text-white py-3 rounded-full hover:bg-pink-600 transition-colors duration-300"
                  disabled={cartItems.length === 0}
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const CartItem = ({ item, onRemove, onUpdateQuantity }) => {
  return (
    <div className="flex items-center mb-4">
      <img
        src={item.image}
        alt={item.name}
        className="w-16 h-16 object-cover rounded mr-4"
      />
      <div className="flex-grow">
        <h3 className="font-semibold">{item.name}</h3>
        <p className="text-gray-600">${item.price}</p>
        <div className="flex items-center mt-2">
          <button
            onClick={() => onUpdateQuantity(Math.max(1, item.quantity - 1))}
            className="bg-gray-200 px-2 py-1 rounded-l"
          >
            -
          </button>
          <span className="bg-gray-100 px-4 py-1">{item.quantity}</span>
          <button
            onClick={() => onUpdateQuantity(item.quantity + 1)}
            className="bg-gray-200 px-2 py-1 rounded-r"
          >
            +
          </button>
        </div>
      </div>
      <button
        onClick={onRemove}
        className="text-red-500 hover:text-red-700 transition-colors duration-300"
        aria-label={`Remove ${item.name} from cart`}
      >
        Remove
      </button>
    </div>
  );
};

export default CartModal;