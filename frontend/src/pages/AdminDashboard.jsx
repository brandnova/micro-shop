import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Menu, RefreshCw, ExternalLink } from 'lucide-react'

import { getAllProducts, createProduct, updateProduct, deleteProduct, uploadProductImages, setPrimaryImage, deleteProductImage } from '../api/products'
import { getOrders, updateOrderStatus }                              from '../api/orders'
import { getBankDetails, updateSiteSettings, getSiteSettings }      from '../api/settings'
import client                                                        from '../api/client'
import { useToast }                                                  from '../hooks/useToast'
import { useTheme }                                                  from '../context/ThemeContext'

import Sidebar        from '../components/admin/Sidebar'
import DashboardHome  from '../components/admin/DashboardHome'
import ProductsPanel  from '../components/admin/ProductsPanel'
import OrdersTable    from '../components/admin/OrdersTable'
import BankPanel      from '../components/admin/BankPanel'
import SettingsPanel  from '../components/admin/SettingsPanel'
import ToastContainer from '../components/ui/Toast'
import Spinner        from '../components/ui/Spinner'

const SECTION_LABELS = {
  overview: 'Dashboard',
  products: 'Products',
  orders:   'Orders',
  bank:     'Bank Details',
  settings: 'Site Settings',
}

export default function AdminDashboard() {
  const { toast, toasts, dismiss } = useToast()
  const { setAccent }              = useTheme()

  const [active, setActive]         = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading]       = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const [products, setProducts]       = useState([])
  const [orders, setOrders]           = useState([])
  const [bankDetails, setBankDetails] = useState([])
  const [settings, setSettings]       = useState({})

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [p, o, b, s] = await Promise.all([
        getAllProducts(),
        getOrders(),
        getBankDetails(),
        getSiteSettings(),
      ])
      setProducts(p.data.results ?? p.data)
      setOrders(Array.isArray(o.data) ? o.data : (o.data?.results ?? []))
      const rawBank = b.data?.results ?? b.data
      setBankDetails(Array.isArray(rawBank) ? rawBank : rawBank ? [rawBank] : [])
      setSettings(s.data)
      if (s.data.main_color) setAccent(s.data.main_color)
    } catch (e) {
      toast.error('Failed to load dashboard data.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])


  // ── Products ────────────────────────────────────────────────────────────────

  const handleAddProduct = async (data, images) => {
    try {
      const res = await createProduct(data)
      if (images.length > 0) {
        const fd = new FormData()
        images.forEach(img => fd.append('images', img))
        await uploadProductImages(res.data.id, fd)
      }
      toast.success('Product added.')
      load()
    } catch (e) { toast.error(e.message) }
  }

  const handleUpdateProduct = async (id, data, images) => {
    try {
      await updateProduct(id, data)
      if (images.length > 0) {
        const fd = new FormData()
        images.forEach(img => fd.append('images', img))
        await uploadProductImages(id, fd)
      }
      toast.success('Product updated.')
      load()
    } catch (e) { toast.error(e.message) }
  }

  // Soft toggle — active ↔ inactive
  const handleToggleProduct = async (id, isCurrentlyActive) => {
    try {
      await updateProduct(id, { is_active: !isCurrentlyActive })
      toast.success(isCurrentlyActive ? 'Product deactivated.' : 'Product reactivated.')
      load()
    } catch (e) { toast.error(e.message) }
  }

  // Hard delete — permanent, only called from inactive state
  const handlePermanentDelete = async (id) => {
    if (!window.confirm('Permanently delete this product? This cannot be undone.')) return
    try {
      await deleteProduct(id)
      toast.success('Product permanently deleted.')
      load()
    } catch (e) { toast.error(e.message) }
  }

  // ── Orders ──────────────────────────────────────────────────────────────────

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await updateOrderStatus(id, newStatus)
      toast.success(`Status updated to "${newStatus.replace(/_/g, ' ')}".`)
      load()
    } catch (e) { toast.error(e.message) }
  }

  // ── Bank ────────────────────────────────────────────────────────────────────

  const handleAddBank = async (data) => {
    try {
      await client.post('/api/bank-details/', data)
      toast.success('Bank account added.')
      load()
    } catch (e) { toast.error(e.message) }
  }

  const handleUpdateBank = async (id, data) => {
    try {
      await client.patch(`/api/bank-details/${id}/`, data)
      toast.success('Bank account updated.')
      load()
    } catch (e) { toast.error(e.message) }
  }

  const handleDeleteBank = async (id) => {
    if (!window.confirm('Remove this bank account?')) return
    try {
      await client.delete(`/api/bank-details/${id}/`)
      toast.success('Bank account removed.')
      load()
    } catch (e) { toast.error(e.message) }
  }

  // ── Settings ────────────────────────────────────────────────────────────────

  const handleSaveSettings = async (data) => {
    try {
      await updateSiteSettings(data)
      if (data.main_color) setAccent(data.main_color)
      toast.success('Settings saved.')
      load()
    } catch (e) { toast.error(e.message) }
  }

  const logout = () => {
    localStorage.removeItem('adminToken')
    window.location.href = '/store-admin'
  }

  const panels = {
    overview: <DashboardHome orders={orders} />,
    products: (
      <ProductsPanel
        products={products}
        onAdd={handleAddProduct}
        onUpdate={handleUpdateProduct}
        onDelete={handleToggleProduct}         // was handleDeleteProduct
        onPermanentDelete={handlePermanentDelete}
        onUploadImages={uploadProductImages}
        onDeleteImage={async (pid, iid) => { await deleteProductImage(pid, iid); load() }}
        onSetPrimary={async (pid, iid) => { await setPrimaryImage(pid, iid); load() }}
      />
    ),
    orders: (
      <OrdersTable
        orders={orders}
        onStatusUpdate={handleStatusUpdate}
        onViewProof={url => window.open(url, '_blank')}
        loading={loading}
      />
    ),
    bank: (
      <BankPanel
        bankDetails={bankDetails}
        onAdd={handleAddBank}
        onUpdate={handleUpdateBank}
        onDelete={handleDeleteBank}
      />
    ),
    settings: (
      <SettingsPanel
        settings={settings}
        onSave={handleSaveSettings}
      />
    ),
  }

  return (
    <div className="min-h-screen bg-stone-50 font-sans">

      {/* Overlay sidebar — never shifts layout */}
      <Sidebar
        active={active}
        setActive={setActive}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={logout}
      />

      {/* Full-width main — never shrinks */}
      <div className="flex flex-col min-h-screen">

        {/* Top bar */}
        <header className="sticky top-0 z-30 h-14 bg-white/95 backdrop-blur border-b border-zinc-200 flex items-center px-4 sm:px-6 gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="h-8 w-8 flex items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors shrink-0"
          >
            <Menu size={18} />
          </button>

          <h1 className="text-sm font-semibold text-zinc-700 flex-1 truncate">
            {SECTION_LABELS[active]}
          </h1>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => load()}
              title="Refresh data"
              className={`h-8 w-8 flex items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors ${refreshing ? 'animate-spin' : ''}`}
            >
              <RefreshCw size={15} />
            </button>
            
            <a href="/"
              target="_blank"
              rel="noopener noreferrer"
              title="View storefront"
              className="h-8 flex items-center gap-1.5 px-2.5 rounded-lg text-xs font-medium text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
            >
              <ExternalLink size={14} />
              <span className="hidden sm:inline">View Store</span>
            </a>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="flex flex-col items-center gap-3">
                <Spinner size="lg" />
                <p className="text-xs text-zinc-400 uppercase tracking-widest">Loading</p>
              </div>
            </div>
          ) : (
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18 }}
            >
              {panels[active]}
            </motion.div>
          )}
        </main>
      </div>

      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  )
}