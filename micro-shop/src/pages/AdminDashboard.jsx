// src/pages/AdminDashboard.jsx (Updated main component)
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

// Import components
import Sidebar from '../components/admin/Sidebar';
import ProductForm from '../components/admin/ProductForm';
import ProductsTable from '../components/admin/ProductsTable';
import ProductsSearch from '../components/admin/ProductsSearch';
import TransactionsTable from '../components/admin/TransactionsTable';
import TransactionsFilter from '../components/admin/TransactionsFilter';
import Pagination from '../components/admin/Pagination';
import ConfirmationDialog from '../components/admin/ConfirmationDialog';
import BankDetailsModal from '../components/admin/BankDetailsModal';
import SiteSettingsModal from './SiteSettingsModal';

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('products');
  const [products, setProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    price: '',
    image: null,
    quantity: 0
  });
  const [editingProduct, setEditingProduct] = useState(null);
  const [showBankDetailsModal, setShowBankDetailsModal] = useState(false);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [showSiteSettingsModal, setShowSiteSettingsModal] = useState(false);
  const [pendingStatusUpdate, setPendingStatusUpdate] = useState(null);
  const [allTransactions, setAllTransactions] = useState([]); 
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [allProducts, setAllProducts] = useState([]); 
  const [filteredProducts, setFilteredProducts] = useState([]);

  const itemsPerPage = 10;

  const statusOptions = [
    'pending',
    'payment_uploaded',
    'payment_confirmed',
    'processing',
    'shipped',
    'delivered',
    'cancelled'
  ];

  useEffect(() => {
    fetchProducts();
    fetchTransactions();
  }, [currentPage, searchTerm, statusFilter]);

  const handleApplyFilters = () => {
    setCurrentPage(1); 
    fetchTransactions();
  };

  // Modify the fetchProducts function to store all products
  const fetchProducts = async () => {
    try {
      const response = await axios.get(`/api/products/?page=${currentPage}&limit=${itemsPerPage}`);
      setAllProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  // Add effect for product filtering
  useEffect(() => {
    const filtered = allProducts.filter(product => {
      const searchLower = productSearchTerm.toLowerCase();
      return (
        product.name.toLowerCase().includes(searchLower) ||
        product.category.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower)
      );
    });
    setFilteredProducts(filtered);
  }, [productSearchTerm, allProducts]);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get('/api/transactions/');
      setAllTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  // Apply filters whenever search term or status filter changes
  useEffect(() => {
    const filtered = allTransactions.filter(transaction => {
      const matchesSearch = 
        transaction.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.tracking_number.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
    
    setFilteredTransactions(filtered);
  }, [searchTerm, statusFilter, allTransactions]);

  // Fetch all transactions only when component mounts
  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      for (const key in formData) {
        formDataToSend.append(key, formData[key]);
      }
      await axios.post('/api/products/', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchProducts();
      setFormData({ name: '', category: '', description: '', price: '', image: null, quantity: 0 });
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  const handleEditProduct = async (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      description: product.description,
      price: product.price,
      image: null,
      quantity: product.quantity
    });
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      for (const key in formData) {
        if (formData[key] !== null) {
          formDataToSend.append(key, formData[key]);
        }
      }
      await axios.patch(`/api/products/${editingProduct.id}/`, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchProducts();
      setEditingProduct(null);
      setFormData({ name: '', category: '', description: '', price: '', image: null, quantity: 0 });
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`/api/products/${id}/`);
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const handleUpdateTransactionStatus = async (id, newStatus) => {
    setPendingStatusUpdate({ id, newStatus });
    setShowConfirmationDialog(true);
  };

  const confirmStatusUpdate = async () => {
    if (pendingStatusUpdate) {
      try {
        await axios.patch(`/api/transactions/${pendingStatusUpdate.id}/`, { status: pendingStatusUpdate.newStatus });
        fetchTransactions();
        setShowConfirmationDialog(false);
        setPendingStatusUpdate(null);
      } catch (error) {
        console.error('Error updating transaction status:', error);
      }
    }
  };

  const handleViewPaymentProof = (paymentProofUrl) => {
    window.open(paymentProofUrl, '_blank');
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-r from-pink-50 to-purple-50">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        setShowSiteSettingsModal={setShowSiteSettingsModal}
      />

      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {activeSection === 'products' && (
            <div>
              <h2 className="text-3xl font-bold text-pink-800 mb-6">Manage Products</h2>
              <ProductForm
                formData={formData}
                handleInputChange={handleInputChange}
                handleSubmit={editingProduct ? handleUpdateProduct : handleAddProduct}
                editingProduct={editingProduct}
                setEditingProduct={setEditingProduct}
                setFormData={setFormData}
              />
              <ProductsSearch 
                searchTerm={productSearchTerm}
                onSearchChange={setProductSearchTerm}
              />
              <ProductsTable
                products={filteredProducts}
                handleEditProduct={handleEditProduct}
                handleDeleteProduct={handleDeleteProduct}
              />
              <Pagination
                currentPage={currentPage}
                totalItems={filteredProducts.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
            </div>
          )}

          {activeSection === 'transactions' && (
            <div>
              <h2 className="text-3xl font-bold text-pink-800 mb-6">View Transactions</h2>
              <TransactionsFilter
                searchTerm={searchTerm}
                statusFilter={statusFilter}
                statusOptions={statusOptions}
                onSearchChange={setSearchTerm}
                onStatusFilterChange={setStatusFilter}
              />
              <TransactionsTable
                transactions={filteredTransactions} // Use filtered transactions here
                statusOptions={statusOptions}
                handleUpdateTransactionStatus={handleUpdateTransactionStatus}
                handleViewPaymentProof={handleViewPaymentProof}
              />
              <Pagination
                currentPage={currentPage}
                totalItems={filteredTransactions.length} // Update pagination count
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowBankDetailsModal(true)}
            className="mt-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white py-2 px-4 rounded hover:from-pink-600 hover:to-purple-700 transition duration-300"
          >
            Edit Bank Details
          </motion.button>
        </motion.div>
      </div>

      {showBankDetailsModal && (
        <BankDetailsModal onClose={() => setShowBankDetailsModal(false)} />
      )}

      {showSiteSettingsModal && (
        <SiteSettingsModal onClose={() => setShowSiteSettingsModal(false)} />
      )}

      <AnimatePresence>
        {showConfirmationDialog && (
          <ConfirmationDialog
            onConfirm={confirmStatusUpdate}
            onCancel={() => {
              setShowConfirmationDialog(false);
              setPendingStatusUpdate(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;