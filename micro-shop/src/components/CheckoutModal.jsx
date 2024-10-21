import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import OrderConfirmationModal from './OrderConfirmationModal';

const CheckoutModal = ({
  isOpen,
  onClose,
  cartItems,
  totalPrice,
  handleCheckout,
  isOrderConfirmed,
  bankDetails,
  trackingNumber
}) => {
  const onSubmit = async (formData) => {
    try {
      await handleCheckout(formData);
    } catch (error) {
      console.error('Checkout failed:', error);
      // Handle error (e.g., show error message to user)
    }
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
            className="bg-white p-8 rounded-lg max-w-md w-full"
          >
            {!isOrderConfirmed ? (
              <>
                <h2 className="text-2xl font-serif text-pink-600 mb-6">Checkout</h2>
                <CheckoutForm
                  cartItems={cartItems}
                  totalPrice={totalPrice}
                  onSubmit={onSubmit}
                />
              </>
            ) : (
              <OrderConfirmationModal
                isOpen={isOrderConfirmed}
                onClose={onClose}
                trackingNumber={trackingNumber}
                bankDetails={bankDetails}
              />
            )}
            <button
              onClick={onClose}
              className="mt-4 text-pink-600 hover:text-pink-800 transition-colors duration-300"
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const CheckoutForm = ({ cartItems, totalPrice, onSubmit }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = {
      name: e.target.elements.name.value,
      email: e.target.elements.email.value,
      location: e.target.elements.location.value,
      phone: e.target.elements.phone.value,
    };
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <h3 className="font-semibold mb-2">Order Summary:</h3>
        <p>Total Price: ${typeof totalPrice === 'function' ? totalPrice() : totalPrice.toFixed(2)}</p>
        <ul className="list-disc pl-5">
          {cartItems.map(item => (
            <li key={item.id}>{item.name} (x{item.quantity})</li>
          ))}
        </ul>
      </div>
      <input
        type="text"
        name="name"
        placeholder="Full Name"
        required
        className="w-full mb-4 p-2 border rounded-full"
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        required
        className="w-full mb-4 p-2 border rounded-full"
      />
      <input
        type="text"
        name="location"
        placeholder="Location"
        required
        className="w-full mb-4 p-2 border rounded-full"
      />
      <input
        type="tel"
        name="phone"
        placeholder="Phone Number"
        required
        className="w-full mb-4 p-2 border rounded-full"
      />
      <button
        type="submit"
        className="w-full bg-pink-500 text-white py-3 rounded-full hover:bg-pink-600 transition-colors duration-300"
      >
        Place Order
      </button>
    </form>
  );
};

export default CheckoutModal;