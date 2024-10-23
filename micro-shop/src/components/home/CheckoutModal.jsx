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
  trackingNumber,
  mainColor,
  lightenedShade,
  lighterShade
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
            className="p-8 bg-white rounded-lg max-w-md w-full"
            style={{ backgroundColor: lighterShade }}
          >
            {!isOrderConfirmed ? (
              <>
                <h2 className="text-2xl font-serif mb-6" style={{ color: mainColor }}>Checkout</h2>
                <CheckoutForm
                  cartItems={cartItems}
                  totalPrice={totalPrice}
                  onSubmit={onSubmit}
                  mainColor={mainColor}
                  lightenedShade={lightenedShade}
                />
              </>
            ) : (
              <OrderConfirmationModal
                isOpen={isOrderConfirmed}
                onClose={onClose}
                trackingNumber={trackingNumber}
                bankDetails={bankDetails}
                mainColor={mainColor}
                lightenedShade={lightenedShade}
                lighterShade={lighterShade}
              />
            )}
            <button
              onClick={onClose}
              className="mt-4 hover:opacity-80 transition-opacity duration-300"
              style={{ color: mainColor }}
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const CheckoutForm = ({ cartItems, totalPrice, onSubmit, mainColor, lightenedShade }) => {
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
        <h3 className="font-semibold mb-2" style={{ color: mainColor }}>Order Summary:</h3>
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
        style={{ borderColor: lightenedShade }}
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        required
        className="w-full mb-4 p-2 border rounded-full"
        style={{ borderColor: lightenedShade }}
      />
      <input
        type="text"
        name="location"
        placeholder="Location"
        required
        className="w-full mb-4 p-2 border rounded-full"
        style={{ borderColor: lightenedShade }}
      />
      <input
        type="tel"
        name="phone"
        placeholder="Phone Number"
        required
        className="w-full mb-4 p-2 border rounded-full"
        style={{ borderColor: lightenedShade }}
      />
      <button
        type="submit"
        className="w-full text-white py-3 rounded-full hover:opacity-90 transition-opacity duration-300"
        style={{ backgroundColor: mainColor }}
      >
        Place Order
      </button>
    </form>
  );
};

export default CheckoutModal;