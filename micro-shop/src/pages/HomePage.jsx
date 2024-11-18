// src/pages/HomePage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { lighten } from 'polished';
import Header from '../components/home/Header';
import FeaturedCollections from '../components/home/FeaturedCollections';
import ProductGrid from '../components/home/ProductGrid';
import ProductModal from '../components/home/ProductModal';
import CartModal from '../components/home/CartModal';
import CheckoutModal from '../components/home/CheckoutModal';
import BankDetailsModal from '../components/home/BankDetailsModal';
import OrderConfirmationModal from '../components/home/OrderConfirmationModal';
import OrderTrackingModal from '../components/home/OrderTrackingModal';
import EasyStepsSection from '../components/home/EasyStepsSection';
import OrderManagementSection from '../components/home/OrderManagementSection';
import Footer from '../components/home/Footer';
import ScrollToTopButton from '../components/home/ScrollToTopButton';
import PaymentProofUploadModal from '../components/home/PaymentProofUploadModal';
import LoadingSpinner from '../components/home/LoadingSpinner';
import MessageDisplay from '../components/home/MessageDisplay';
import { useCart } from '../hooks/useCart';
import { useScrollToTop } from '../hooks/useScrollToTop';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [heroProducts, setHeroProducts] = useState([]);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [orderStatus, setOrderStatus] = useState(null);
  const [bankDetails, setBankDetails] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(15);

  const {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    getTotalPrice,
    clearCart,
    isCartOpen,
    setIsCartOpen,
    isCheckoutOpen,
    setIsCheckoutOpen,
    isOrderConfirmed,
    setIsOrderConfirmed
  } = useCart();

  const { isScrollButtonVisible, scrollToTop } = useScrollToTop();

  const [isBankDetailsOpen, setIsBankDetailsOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isLoading, setIsLoading] = useState({});

  const [siteSettings, setSiteSettings] = useState({
    site_title: 'My E-commerce Site',
    main_color: '#000000',
    contact_email: 'support@example.com',
    contact_number: '1234567890'
  });

  const handleAddToCart = (product) => {
    setIsLoading(prev => ({ ...prev, [product.id]: true }));
    addToCart(product, 1);
    setTimeout(() => {
      setIsLoading(prev => ({ ...prev, [product.id]: false }));
    }, 1000);
  };

  const mainColor = siteSettings.main_color;
  const lightenedShade = lighten(0.47, mainColor);
  const lighterShade = lighten(0.6, mainColor);

  useEffect(() => {
    fetchProducts();
    fetchBankDetails();
    fetchSiteSettings();
    window.addEventListener('popstate', handleUrlChange);
    handleUrlChange();
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, []);

  const fetchSiteSettings = async () => {
    try {
      const response = await axios.get('/api/site-settings/');
      setSiteSettings(response.data);
    } catch (error) {
      console.error('Error fetching site settings:', error);
      setMessage({ type: 'error', content: 'Failed to fetch site settings. Using default values.' });
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const response = await axios.get('/api/products/');
      setProducts(response.data);
      setHeroProducts(getRandomProducts(response.data));
    } catch (error) {
      console.error('Error fetching products:', error);
      setMessage({ type: 'error', content: 'Failed to fetch products. Please try again later.' });
    } finally {
      setLoading(false);
    }
  };

  const fetchBankDetails = async () => {
    try {
      const response = await axios.get('/api/bank-details/');
      setBankDetails(response.data[0]);
    } catch (error) {
      console.error('Error fetching bank details:', error);
      setMessage({ type: 'error', content: 'Failed to fetch bank details. Please try again later.' });
    }
  };

  const getRandomProducts = (productList) => {
    const shuffled = [...productList].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.floor(Math.random() * productList.length) + 1);
  };

  const handleUrlChange = useCallback(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('productId');
    if (productId) {
      fetchProductById(productId);
    } else {
      setSelectedProduct(null);
      setIsModalOpen(false);
    }
  }, []);

  const fetchProductById = async (productId) => {
    try {
      const productInState = products.find(p => p.id === parseInt(productId));
      if (productInState) {
        setSelectedProduct(productInState);
        setIsModalOpen(true);
      } else {
        const response = await axios.get(`/api/products/${productId}`);
        const fetchedProduct = response.data;
        setSelectedProduct(fetchedProduct);
        setIsModalOpen(true);
        
        setProducts(prevProducts => {
          const productExists = prevProducts.some(p => p.id === fetchedProduct.id);
          if (!productExists) {
            return [...prevProducts, fetchedProduct];
          }
          return prevProducts;
        });
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      setMessage({ type: 'error', content: 'Failed to fetch product details. Please try again.' });
    }
  };

  const handleProductClick = useCallback((product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
    const newUrl = `${window.location.pathname}?productId=${product.id}`;
    window.history.pushState({ productId: product.id }, '', newUrl);
  }, []);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
    window.history.pushState({}, '', window.location.pathname);
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
        clearCart();
        setIsCheckoutOpen(false);
        setMessage({ type: 'success', content: 'Order placed successfully!' });
      }
    } catch (error) {
      console.error('Error processing checkout:', error);
      setMessage({ type: 'error', content: 'Failed to process checkout. Please try again.' });
    }
  };

  const handleTrackOrder = async () => {
    try {
      const response = await axios.get(`/api/track-order/?tracking_number=${trackingNumber}`);
      setOrderStatus(response.data);
      setIsTrackingOpen(true);
    } catch (error) {
      console.error('Error tracking order:', error);
      setMessage({ type: 'error', content: 'Failed to track order. Please check your tracking number and try again.' });
    }
  };

  if (loading) {
    return (
      <LoadingSpinner 
        mainColor={mainColor}
        lighterShade={lighterShade}
      />
    );
  }
  

  return (
    <div className="min-h-screen" style={{ backgroundColor: lighterShade }}>
      <Header 
        cartItemsCount={cartItems.length}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenBankDetails={() => setIsBankDetailsOpen(true)}
        siteSettings={{
          title: siteSettings.site_title,
          email: siteSettings.contact_email,
          phone: siteSettings.contact_number
        }}
        mainColor={mainColor}
        lighterShade={lighterShade}
      />

      <main className="container mx-auto px-4 py-16">
        {message && (
          <MessageDisplay
            type={message.type}
            message={message.content}
            mainColor={mainColor}
            onClose={() => setMessage(null)}
          />
        )}

        {heroProducts.length > 0 && (
          <FeaturedCollections 
            heroProducts={heroProducts} 
            mainColor={mainColor}
            lightenedShade={lightenedShade}
            lighterShade={lighterShade}
          />
        )}
        
        <EasyStepsSection 
          mainColor={mainColor}
          lightenedShade={lightenedShade}
          lighterShade={lighterShade}
        />
        
        <OrderManagementSection 
          trackingNumber={trackingNumber}
          setTrackingNumber={setTrackingNumber}
          handleTrackOrder={handleTrackOrder}
          setIsUploadOpen={setIsUploadOpen}
          mainColor={mainColor}
          lightenedShade={lightenedShade}
        />

        <ProductGrid 
          products={products}
          currentPage={currentPage}
          productsPerPage={productsPerPage}
          onProductClick={handleProductClick}
          onAddToCart={handleAddToCart}
          isLoading={isLoading}
          onPageChange={setCurrentPage}
          mainColor={mainColor}
          lightenedShade={lightenedShade}
          lighterShade={lighterShade}
        />
      </main>

      <ProductModal
        product={selectedProduct}
        onClose={handleCloseModal}
        addToCart={handleAddToCart}
        loading={isLoading}
        isOpen={isModalOpen}
        mainColor={mainColor}
        lightenedShade={lightenedShade}
      />

      <CartModal 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onRemoveItem={removeFromCart}
        onUpdateQuantity={updateQuantity}
        totalPrice={getTotalPrice()}
        onCheckout={() => {
          setIsCheckoutOpen(true);
          setIsCartOpen(false);
        }}
        mainColor={mainColor}
        lightenedShade={lightenedShade}
        lighterShade={lighterShade}
      />

      <CheckoutModal 
        isOpen={isCheckoutOpen}
        onClose={() => {
          setIsCheckoutOpen(false);
          setIsOrderConfirmed(false);
        }}
        cartItems={cartItems}
        totalPrice={getTotalPrice}
        handleCheckout={handleCheckout}
        isOrderConfirmed={isOrderConfirmed}
        bankDetails={bankDetails}
        trackingNumber={trackingNumber}
        mainColor={mainColor}
        lightenedShade={lightenedShade}
      />

      <BankDetailsModal 
        isOpen={isBankDetailsOpen}
        onClose={() => setIsBankDetailsOpen(false)}
        bankDetails={bankDetails}
        mainColor={mainColor}
        lightenedShade={lightenedShade}
      />

      <OrderConfirmationModal 
        isOpen={isOrderConfirmed}
        onClose={() => {
          setIsOrderConfirmed(false);
          setTrackingNumber('');
        }}
        trackingNumber={trackingNumber}
        bankDetails={bankDetails}
        mainColor={mainColor}
        lightenedShade={lightenedShade}
      />

      <OrderTrackingModal 
        isOpen={isTrackingOpen}
        onClose={() => setIsTrackingOpen(false)}
        orderStatus={orderStatus}
        mainColor={mainColor}
        lightenedShade={lightenedShade}
        lighterShade={lighterShade}
      />

      <PaymentProofUploadModal 
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        mainColor={mainColor}
        lightenedShade={lightenedShade}
      />

      <ScrollToTopButton 
        isVisible={isScrollButtonVisible}
        onClick={scrollToTop}
        mainColor={mainColor}
      />

      <Footer 
        siteSettings={{
          title: siteSettings.site_title,
          email: siteSettings.contact_email,
          phone: siteSettings.contact_number
        }}
        mainColor={mainColor}
        lightenedShade={lightenedShade}
      />
    </div>
  );
};

export default HomePage;