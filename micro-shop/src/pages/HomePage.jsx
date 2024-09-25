import React, { useState, useEffect, useRef } from 'react';
import { FaShoppingCart, FaTimes, FaInfoCircle, FaHeart, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isBankDetailsOpen, setIsBankDetailsOpen] = useState(false);
  const [isOrderConfirmed, setIsOrderConfirmed] = useState(false);
  const [bankDetails, setBankDetails] = useState({});
  const [heroProducts, setHeroProducts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState([]);
  const carouselRef = useRef(null);

  useEffect(() => {
    fetchProducts();
    fetchBankDetails();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/products/');
      setProducts(response.data);
      setHeroProducts(getRandomProducts(response.data));
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to fetch products. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchBankDetails = async () => {
    try {
      const response = await axios.get('/api/bank-details/');
      setBankDetails(response.data[0]); // Assuming there's only one bank details entry
    } catch (error) {
      console.error('Error fetching bank details:', error);
    }
  };

  const scrollCarousel = (direction) => {
    if (carouselRef.current) {
      const { scrollLeft, clientWidth } = carouselRef.current;
      const scrollTo = direction === 'left'
        ? scrollLeft - clientWidth
        : scrollLeft + clientWidth;
      
      carouselRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  const getRandomProducts = (productList) => {
    const shuffled = [...productList].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.floor(Math.random() * productList.length) + 1);
  };

  const addToCart = (product, quantity) => {
    const existingItem = cartItems.find(item => item.id === product.id);
    if (existingItem) {
      setCartItems(cartItems.map(item =>
        item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
      ));
    } else {
      setCartItems([...cartItems, { ...product, quantity }]);
    }
  };

  const removeFromCart = (productId) => {
    setCartItems(cartItems.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    setCartItems(cartItems.map(item =>
      item.id === productId ? { ...item, quantity: newQuantity } : item
    ));
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);
  };

  const handleCheckout = async (formData) => {
    try {
      const response = await axios.post('/api/transactions/', {
        ...formData,
        products: cartItems.map(item => `${item.name} (x${item.quantity})`).join(', '),
        total_amount: getTotalPrice(),
      });
      if (response.status === 201) {
        setIsOrderConfirmed(true);
        setCartItems([]);
      }
    } catch (error) {
      console.error('Error processing checkout:', error);
      setError('Failed to process checkout. Please try again.');
    }
  };

  const getCartItemsCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const toggleWishlist = (productId) => {
    setWishlist(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-pink-600"></div>
          <p className="mt-4 text-xl text-pink-600">Loading our elegant collection...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-pink-50 flex items-center justify-center">
        <div className="text-center">
          <FaTimes className="text-red-500 text-5xl mb-4 mx-auto" />
          <p className="text-2xl text-red-600">{error}</p>
          <button 
            onClick={fetchProducts} 
            className="mt-4 px-6 py-2 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition-colors duration-300"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-serif text-pink-600">Shopping Elegance</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsBankDetailsOpen(true)}
              className="text-pink-600 hover:text-pink-800 transition-colors duration-300"
              aria-label="Show bank details"
            >
              <FaInfoCircle size={20} />
            </button>
            <div className="relative">
              <button
                onClick={() => setIsCartOpen(true)}
                className="text-pink-600 hover:text-pink-800 transition-colors duration-300"
                aria-label="Open shopping cart"
              >
                <FaShoppingCart size={20} />
              </button>
              {getCartItemsCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {getCartItemsCount()}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        {heroProducts.length > 0 && (
          <section className="mb-16">
            <h2 className="text-3xl font-serif text-pink-600 mb-8">Featured Collection</h2>
            <div className="relative">
              <button 
                onClick={() => scrollCarousel('left')} 
                className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 rounded-full p-2 z-10"
                aria-label="Scroll left"
              >
                <FaChevronLeft className="text-pink-600" />
              </button>
              <button 
                onClick={() => scrollCarousel('right')} 
                className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 rounded-full p-2 z-10"
                aria-label="Scroll right"
              >
                <FaChevronRight className="text-pink-600" />
              </button>
              <div 
                ref={carouselRef} 
                className="flex overflow-x-auto justify-center space-x-4 pb-4 scrollbar-hide"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {heroProducts.map((product) => (
                  <motion.div 
                    key={product.id} 
                    className="flex-none w-64 bg-white rounded-lg shadow-lg overflow-hidden"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  >
                    <img src={product.image} alt={product.name} className="w-full h-64 object-cover" />
                    <div className="p-4">
                      <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
                      <p className="text-pink-600 font-bold">${product.price}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}
        
        <section className="mb-16 bg-pink-100 rounded-lg p-8">
          <h2 className="text-2xl font-serif text-pink-600 mb-4">Easy Steps to Your Perfect Purchase</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-pink-200 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-pink-600">1</span>
              </div>
              <h3 className="font-semibold mb-2">Browse Our Collection</h3>
              <p>Explore our curated selection of elegant pieces designed just for you.</p>
            </div>
            <div className="text-center">
              <div className="bg-pink-200 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-pink-600">2</span>
              </div>
              <h3 className="font-semibold mb-2">Add to Cart</h3>
              <p>Select your favorite items and add them to your shopping cart with a single click.</p>
            </div>
            <div className="text-center">
              <div className="bg-pink-200 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-pink-600">3</span>
              </div>
              <h3 className="font-semibold mb-2">Secure Checkout</h3>
              <p>Complete your purchase safely and easily through our secure checkout process.</p>
            </div>
          </div>
        </section>

        <h2 className="text-3xl font-serif text-pink-600 mb-8">Our Exquisite Collection</h2>
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <motion.div
                key={product.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden"
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.3 }}
              >
                <div className="relative">
                  <img src={product.image} alt={product.name} className="w-full h-64 object-cover" />
                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md"
                    aria-label={wishlist.includes(product.id) ? "Remove from wishlist" : "Add to wishlist"}
                  >
                    <FaHeart 
                      size={20} 
                      className={wishlist.includes(product.id) ? "text-pink-500" : "text-gray-400"}
                    />
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
                  <p className="text-gray-600 mb-2">{product.category}</p>
                  <p className="text-gray-500 mb-4 h-12 overflow-hidden">{product.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-pink-600 font-bold">${product.price}</span>
                    <button
                      onClick={() => addToCart(product, 1)}
                      className="bg-pink-500 text-white px-4 py-2 rounded-full hover:bg-pink-600 transition-colors duration-300"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-xl text-gray-600 text-center">We're currently updating our collection. Please check back soon for our latest elegant pieces.</p>
        )}
      </main>

      <AnimatePresence>
        {isCartOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-lg z-50"
          >
            <div className="p-6 h-full flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-serif text-pink-600">Your Cart</h2>
                <button
                  onClick={() => setIsCartOpen(false)}
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
                    <div key={item.id} className="flex items-center mb-4">
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
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            className="bg-gray-200 px-2 py-1 rounded-l"
                          >
                            -
                          </button>
                          <span className="bg-gray-100 px-4 py-1">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="bg-gray-200 px-2 py-1 rounded-r"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-700 transition-colors duration-300"
                        aria-label={`Remove ${item.name} from cart`}
                      >
                        Remove
                      </button>
                    </div>
                  ))
                )}
              </div>
              <div className="mt-6">
                <p className="text-xl font-semibold mb-4">Total: ${getTotalPrice()}</p>
                <button
                  onClick={() => {
                    setIsCheckoutOpen(true);
                    setIsCartOpen(false);
                  }}
                  className="w-full bg-pink-500 text-white py-3 rounded hover:bg-pink-600 transition-colors duration-300"
                  disabled={cartItems.length === 0}
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Checkout modal */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <div className="bg-white p-8 rounded-lg max-w-md w-full">
              <h2 className="text-2xl font-serif text-pink-600 mb-6">Checkout</h2>
              {!isOrderConfirmed ? (
                <>
                  <div className="mb-4">
                    <h3 className="font-semibold mb-2">Order Summary:</h3>
                    <p>Total Price: ${getTotalPrice()}</p>
                    <ul className="list-disc pl-5">
                      {cartItems.map(item => (
                        <li key={item.id}>{item.name} (x{item.quantity})</li>
                      ))}
                    </ul>
                  </div>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    handleCheckout({
                      name: e.target.name.value,
                      email: e.target.email.value,
                      location: e.target.location.value,
                      phone: e.target.phone.value,
                    });
                  }}>
                    <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    required
                    className="w-full mb-4 p-2 border rounded"
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    required
                    className="w-full mb-4 p-2 border rounded"
                  />
                  <input
                    type="text"
                    name="location"
                    placeholder="Location"
                    required
                    className="w-full mb-4 p-2 border rounded"
                  />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number"
                    required
                    className="w-full mb-4 p-2 border rounded"
                  />
                    <button
                      type="submit"
                      className="w-full bg-pink-500 text-white py-3 rounded hover:bg-pink-600 transition-colors duration-300"
                    >
                      Place Order
                    </button>
                  </form>
                </>
              ) : (
                <div>
                  <p className="mb-4">Your order has been received and the admin will contact you shortly.</p>
                  <p className="mb-4">To get priority attention, please make the payment using the following bank details:</p>
                  <h3 className="font-semibold mb-2">Payment Details:</h3>
                  <p>Bank Name: {bankDetails.bank_name}</p>
                  <p>Account Name: {bankDetails.account_name}</p>
                  <p>Account Number: {bankDetails.account_number}</p>
                </div>
              )}
              <button
                onClick={() => {
                  setIsCheckoutOpen(false);
                  setIsOrderConfirmed(false);
                }}
                className="mt-4 text-pink-600 hover:text-pink-800 transition-colors duration-300"
              >
                Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bank details modal */}
      <AnimatePresence>
        {isBankDetailsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <div className="bg-white p-8 rounded-lg max-w-md w-full">
              <h2 className="text-2xl font-serif text-pink-600 mb-6">Bank Details</h2>
              <p>Bank Name: {bankDetails.bank_name}</p>
              <p>Account Name: {bankDetails.account_name}</p>
              <p>Account Number: {bankDetails.account_number}</p>
              <button
                onClick={() => setIsBankDetailsOpen(false)}
                className="mt-4 text-pink-600 hover:text-pink-800 transition-colors duration-300"
              >
                Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="bg-pink-100 py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-pink-600">&copy; 2024 Shopping Elegance. All rights reserved.</p>
          <p className="mt-2 text-gray-600">Elevating your style with grace and sophistication.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;