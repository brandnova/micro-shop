import React, { useState, useEffect } from 'react';
import { FaBox, FaExchangeAlt, FaBars, FaTimes, FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import axios from 'axios';
import BankDetailsModal from './BankDetailsModal';

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('products');
  const [products, setProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
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

  useEffect(() => {
    fetchProducts();
    fetchTransactions();
  }, [searchTerm]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/api/products/');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(`/api/transactions/?search=${searchTerm}`);
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

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

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleUpdateTransactionStatus = async (id, newStatus) => {
    try {
      await axios.patch(`/api/transactions/${id}/`, { status: newStatus });
      fetchTransactions();
    } catch (error) {
      console.error('Error updating transaction status:', error);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-pink-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-pink-600 text-white transition-all duration-300 ease-in-out`}>
        <div className="p-4 flex justify-between items-center">
          <h2 className={`${sidebarOpen ? 'block' : 'hidden'} text-2xl font-bold`}>Admin</h2>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white focus:outline-none">
            {sidebarOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>
        <nav className="mt-8">
          <button
            onClick={() => setActiveSection('products')}
            className={`flex items-center w-full p-4 ${activeSection === 'products' ? 'bg-pink-700' : 'hover:bg-pink-500'}`}
          >
            <FaBox size={20} />
            {sidebarOpen && <span className="ml-4">Manage Products</span>}
          </button>
          <button
            onClick={() => setActiveSection('transactions')}
            className={`flex items-center w-full p-4 ${activeSection === 'transactions' ? 'bg-pink-700' : 'hover:bg-pink-500'}`}
          >
            <FaExchangeAlt size={20} />
            {sidebarOpen && <span className="ml-4">View Transactions</span>}
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8">
        {activeSection === 'products' && (
          <div>
            <h2 className="text-3xl font-bold text-pink-800 mb-6">Manage Products</h2>
            <form onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct} className="mb-8 bg-white p-6 rounded-lg shadow-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Product Name"
                  className="p-2 border rounded"
                  required
                />
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  placeholder="Category"
                  className="p-2 border rounded"
                  required
                />
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="Price"
                  className="p-2 border rounded"
                  required
                />
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  placeholder="Quantity"
                  className="p-2 border rounded"
                  required
                />
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Description"
                  className="p-2 border rounded col-span-2"
                  required
                />
                <input
                  type="file"
                  name="image"
                  onChange={handleInputChange}
                  className="p-2 border rounded col-span-2"
                  accept="image/*"
                />
              </div>
              <button type="submit" className="mt-4 bg-pink-600 text-white py-2 px-4 rounded hover:bg-pink-700">
                {editingProduct ? 'Update Product' : 'Add Product'}
              </button>
              {editingProduct && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingProduct(null);
                    setFormData({ name: '', category: '', description: '', price: '', image: null, quantity: 0 });
                  }}
                  className="mt-4 ml-4 bg-gray-300 text-gray-800 py-2 px-4 rounded hover:bg-gray-400"
                >
                  Cancel Edit
                </button>
              )}
            </form>
            <div className="overflow-x-auto">
              <table className="w-full bg-white shadow-md rounded-lg overflow-hidden">
                <thead className="bg-pink-100 text-pink-800">
                  <tr>
                    <th className="p-3 text-left">Image</th>
                    <th className="p-3 text-left">Name</th>
                    <th className="p-3 text-left">Category</th>
                    <th className="p-3 text-left">Description</th>
                    <th className="p-3 text-left">Price</th>
                    <th className="p-3 text-left">Quantity</th>
                    <th className="p-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b border-pink-100">
                      <td className="p-3">
                        <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded" />
                      </td>
                      <td className="p-3">{product.name}</td>
                      <td className="p-3">{product.category}</td>
                      <td className="p-3">{product.description}</td>
                      <td className="p-3">${product.price}</td>
                      <td className="p-3">{product.quantity}</td>
                      <td className="p-3">
                        <button onClick={() => handleEditProduct(product)} className="mr-2 text-blue-600 hover:text-blue-800">
                          <FaEdit size={18} />
                        </button>
                        <button onClick={() => handleDeleteProduct(product.id)} className="text-red-600 hover:text-red-800">
                          <FaTrash size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeSection === 'transactions' && (
          <div>
            <h2 className="text-3xl font-bold text-pink-800 mb-6">View Transactions</h2>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={handleSearch}
                className="p-2 border rounded w-full md:w-1/2"
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full bg-white shadow-md rounded-lg overflow-hidden">
                <thead className="bg-pink-100 text-pink-800">
                  <tr>
                    <th className="p-3 text-left">Name</th>
                    <th className="p-3 text-left">Email</th>
                    <th className="p-3 text-left">Total Amount</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b border-pink-100">
                      <td className="p-3">{transaction.name}</td>
                      <td className="p-3">{transaction.email}</td>
                      <td className="p-3">${transaction.total_amount}</td>
                      <td className="p-3">{transaction.status}</td>
                      <td className="p-3">
                        <select
                          value={transaction.status}
                          onChange={(e) => handleUpdateTransactionStatus(transaction.id, e.target.value)}
                          className="p-2 border rounded"
                        >
                          <option value="pending">Pending</option>
                          <option value="success">Success</option>
                          <option value="failed">Failed</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <button
          onClick={() => setShowBankDetailsModal(true)}
          className="mt-4 bg-pink-600 text-white py-2 px-4 rounded hover:bg-pink-700"
        >
          Edit Bank Details
        </button>
      </div>

      {showBankDetailsModal && (
        <BankDetailsModal onClose={() => setShowBankDetailsModal(false)} />
      )}
    </div>
  );
};

export default AdminDashboard;