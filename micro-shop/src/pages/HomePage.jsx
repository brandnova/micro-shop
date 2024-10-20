import React, { useState, useEffect, useRef } from 'react';
import { FaShoppingCart, FaTimes, FaInfoCircle, FaHeart, FaChevronLeft, FaChevronRight, FaUpload, FaSearch, FaArrowUp } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { 
  TruckIcon, 
  PackageIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon, 
  CreditCardIcon,
  ShoppingBagIcon
} from 'lucide-react';
import FeaturedCollections from '../components/FeaturedCollections';

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
  const [trackingNumber, setTrackingNumber] = useState('');
  const [orderStatus, setOrderStatus] = useState(null);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadTrackingNumber, setUploadTrackingNumber] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  
  // New state for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(15);
  
  // New state for scroll-to-top button
  const [isScrollButtonVisible, setIsScrollButtonVisible] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchBankDetails();
    
    // Add scroll event listener for scroll-to-top button
    window.addEventListener('scroll', toggleScrollButtonVisibility);
    return () => window.removeEventListener('scroll', toggleScrollButtonVisibility);
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
        setTrackingNumber(response.data.tracking_number);
        setIsOrderConfirmed(true);
        setCartItems([]);
      }
    } catch (error) {
      console.error('Error processing checkout:', error);
      setError('Failed to process checkout. Please try again.');
    }
  };

  const handleTrackOrder = async () => {
    try {
      const response = await axios.get(`/api/track-order/?tracking_number=${trackingNumber}`);
      setOrderStatus(response.data);
      setIsTrackingOpen(true);
    } catch (error) {
      console.error('Error tracking order:', error);
      setError('Failed to track order. Please check your tracking number and try again.');
    }
  };

  const handleUploadPaymentProof = async () => {
    if (!uploadTrackingNumber || !uploadFile) {
      setError('Please provide both tracking number and payment proof file.');
      return;
    }

    const formData = new FormData();
    formData.append('tracking_number', uploadTrackingNumber);
    formData.append('payment_proof', uploadFile);

    try {
      const response = await axios.post('/api/upload-payment-proof/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.status === 200) {
        setIsUploadOpen(false);
        setError('Payment proof uploaded successfully!');
        setUploadTrackingNumber('');
        setUploadFile(null);
      }
    } catch (error) {
      console.error('Error uploading payment proof:', error);
      setError('Failed to upload payment proof. Please try again.');
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

  // Pagination logic
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Scroll-to-top button visibility toggle
  const toggleScrollButtonVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsScrollButtonVisible(true);
    } else {
      setIsScrollButtonVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
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

  const statusIcons = {
    pending: <ClockIcon className="text-yellow-500" />,
    payment_uploaded: <CreditCardIcon className="text-blue-500" />,
    payment_confirmed: <CheckCircleIcon className="text-green-500" />,
    processing: <PackageIcon className="text-purple-500" />,
    shipped: <TruckIcon className="text-indigo-500" />,
    delivered: <ShoppingBagIcon className="text-green-600" />,
    cancelled: <XCircleIcon className="text-red-500" />
  };

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
          <FeaturedCollections heroProducts={heroProducts} />
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

        <section className="mb-16 bg-pink-100 rounded-lg p-8">
          <h2 className="text-2xl font-serif text-pink-600 mb-4">Order Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold mb-2">Track Your Order</h3>
              <div className="flex">
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter tracking number"
                  className="flex-grow p-2 border rounded-l"
                />
                <button
                  onClick={handleTrackOrder}
                  className="bg-pink-500 text-white px-4 py-2 rounded-r hover:bg-pink-600 transition-colors duration-300"
                >
                  <FaSearch />
                </button>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Upload Payment Proof</h3>
              <button
                onClick={() => setIsUploadOpen(true)}
                className="w-full bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600 transition-colors duration-300"
              >
                <FaUpload className="inline-block mr-2" /> Upload Proof
              </button>
            </div>
          </div>
        </section>

        <h2 className="text-3xl font-serif text-pink-600 mb-8">Our Exquisite Collection</h2>
        {currentProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {currentProducts.map((product) => (
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
            <div className="mt-8 flex justify-center">
              {Array.from({ length: Math.ceil(products.length / productsPerPage) }, (_, i) => (
                <button
                  key={i}
                  onClick={() => paginate(i + 1)}
                  className={`mx-1 px-3 py-1 rounded ${
                    currentPage === i + 1 ? 'bg-pink-500 text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </>
        ) : (
          <p className="text-xl text-gray-600 text-center">We're currently updating our collection. Please check back soon for our latest elegant pieces.</p>
        )}
      </main>

      {/* Cart Modal */}
      <AnimatePresence>
        {isCartOpen && (
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
                <div className="mt-auto">
                  <p className="text-xl font-semibold mb-4">Total: ${getTotalPrice()}</p>
                  <button
                    onClick={() => {
                      setIsCheckoutOpen(true);
                      setIsCartOpen(false);
                    }}
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

      {/* Checkout Modal */}
      <AnimatePresence>
        {isCheckoutOpen && (
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bank Details Modal */}
      <AnimatePresence>
        {isBankDetailsOpen && (
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Order Confirmation Modal */}
      <AnimatePresence>
        {isOrderConfirmed && (
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
              <h2 className="text-2xl font-serif text-pink-600 mb-6">Order Confirmed</h2>
              <p className="mb-4">Your order has been received and the admin will contact you shortly.</p>
              <p className="mb-4">Your tracking number is: <strong>{trackingNumber}</strong></p>
              <p className="mb-4">Please use this tracking number to check your order status and upload payment proof.</p>
              <p className="mb-4">To get priority attention, please make the payment using the following bank details:</p>
              <h3 className="font-semibold mb-2">Payment Details:</h3>
              <p>Bank Name: {bankDetails.bank_name}</p>
              <p>Account Name: {bankDetails.account_name}</p>
              <p>Account Number: {bankDetails.account_number}</p>
              <button
                onClick={() => {
                  setIsOrderConfirmed(false);
                  setTrackingNumber('');
                }}
                className="mt-4 text-pink-600 hover:text-pink-800 transition-colors duration-300"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Order Tracking Modal */}
      <AnimatePresence>
        {isTrackingOpen && orderStatus && (
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
              <h2 className="text-2xl font-serif text-pink-600 mb-6">Order Status</h2>
              <div className="flex items-center mb-4">
                <div className="mr-4">
                  {statusIcons[orderStatus.status]}
                </div>
                <div>
                  <p className="font-semibold">{orderStatus.status.replace('_', ' ').charAt(0).toUpperCase() + orderStatus.status.replace('_', ' ').slice(1)}</p>
                  <p className="text-sm text-gray-500">Last Updated: {new Date(orderStatus.created_at).toLocaleString()}</p>
                </div>
              </div>
              <p className="mb-2">Tracking Number: {orderStatus.tracking_number}</p>
              <div className="mt-6 bg-gray-100 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Order Timeline</h3>
                <div className="space-y-4">
                  {['pending', 'payment_uploaded', 'payment_confirmed', 'processing', 'shipped', 'delivered'].map((status, index) => (
                    <div key={status} className={`flex items-center ${orderStatus.status === status ? 'text-pink-600' : 'text-gray-400'}`}>
                      <div className="mr-4">{statusIcons[status]}</div>
                      <p>{status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}</p>
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={() => setIsTrackingOpen(false)}
                className="mt-6 w-full bg-pink-500 text-white py-2 rounded-full hover:bg-pink-600 transition-colors duration-300"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payment Proof Upload Modal */}
      <AnimatePresence>
        {isUploadOpen && (
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
              <h2 className="text-2xl font-serif text-pink-600 mb-6">Upload Payment Proof</h2>
              <input
                type="text"
                value={uploadTrackingNumber}
                onChange={(e) => setUploadTrackingNumber(e.target.value)}
                placeholder="Enter tracking number"
                className="w-full mb-4 p-2 border rounded-full"
              />
              <div className="mb-4">
                <label htmlFor="file-upload" className="cursor-pointer bg-pink-100 text-pink-600 px-4 py-2 rounded-full hover:bg-pink-200 transition-colors duration-300">
                  Choose File
                </label>
                <input
                  id="file-upload"
                  type="file"
                  onChange={(e) => setUploadFile(e.target.files[0])}
                  accept="image/*,application/pdf"
                  className="hidden"
                />
                <span className="ml-2">{uploadFile ? uploadFile.name : 'No file chosen'}</span>
              </div>
              <button
                onClick={handleUploadPaymentProof}
                className="w-full bg-pink-500 text-white py-2 rounded-full hover:bg-pink-600 transition-colors duration-300"
              >
                Upload Proof
              </button>
              <button
                onClick={() => setIsUploadOpen(false)}
                className="mt-4 w-full border border-pink-500 text-pink-500 py-2 rounded-full hover:bg-pink-50 transition-colors duration-300"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scroll-to-top button */}
      <AnimatePresence>
        {isScrollButtonVisible && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 bg-pink-500 text-white p-3 rounded-full shadow-lg hover:bg-pink-600 transition-colors duration-300"
            aria-label="Scroll to top"
          >
            <FaArrowUp />
          </motion.button>
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