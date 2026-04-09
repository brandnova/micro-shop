import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingCart, Package, X, CheckCircle,
  Upload, ArrowUp, Activity
} from 'lucide-react'

import { getProducts }                                 from '../api/products'
import { getBankDetails, healthCheck }                 from '../api/settings'
import { trackOrder, uploadPaymentProof, createOrder } from '../api/orders'
import { useSiteSettings }                             from '../hooks/useSiteSettings'
import { useCart }                                     from '../hooks/useCart'
import { useScrollToTop }                              from '../hooks/useScrollToTop'
import { useToast }                                    from '../hooks/useToast'

import Button          from '../components/ui/Button'
import Modal           from '../components/ui/Modal'
import Badge           from '../components/ui/Badge'
import Spinner         from '../components/ui/Spinner'
import ToastContainer  from '../components/ui/Toast'

import Header            from '../components/home/Header'
import HeroSection       from '../components/home/HeroSection'
import HowItWorksModal   from '../components/home/HowItWorksModal'
import BankDetailsModal  from '../components/home/BankDetailsModal'
import ProductGrid       from '../components/home/ProductGrid'
import ProductModal      from '../components/home/ProductModal'
import Footer            from '../components/home/Footer'


// ─── Status Timeline ──────────────────────────────────────────────────────────

function StatusTimeline({ statusHistory = [] }) {
  return (
    <div className="space-y-3 mt-3">
      {[...statusHistory].reverse().map((entry) => (
        <div key={entry.id} className="flex gap-3 items-start">
          <div className="mt-1.5 h-1.5 w-1.5 rounded-full accent-bg shrink-0" />
          <div>
            <Badge status={entry.status} />
            {entry.note && <p className="text-xs text-zinc-500 mt-0.5">{entry.note}</p>}
            <p className="text-xs text-zinc-400 mt-0.5">{new Date(entry.created_at).toLocaleString()}</p>
          </div>
        </div>
      ))}
    </div>
  )
}


// ─── API Health Panel ─────────────────────────────────────────────────────────

function HealthPanel() {
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)

  const check = async () => {
    setLoading(true)
    try {
      const r = await healthCheck()
      setStatus({ ok: true, ...r.data })
    } catch (e) {
      setStatus({ ok: false, error: e.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed bottom-5 left-5 z-50">
      <AnimatePresence>
        {status && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8 }}
            className="mb-2 bg-white border border-zinc-200 rounded-lg shadow-xl p-4 text-sm w-60"
          >
            <div className="flex items-center justify-between mb-2.5">
              <span className="font-semibold text-zinc-800 text-xs uppercase tracking-wide">API Status</span>
              <button onClick={() => setStatus(null)} className="text-zinc-400 hover:text-zinc-600">
                <X size={13} />
              </button>
            </div>
            {status.ok ? (
              <div className="space-y-1.5 text-xs text-zinc-600">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span className="font-semibold text-emerald-700">Online</span>
                </div>
                <p><span className="text-zinc-400">Name:</span> {status.name}</p>
                <p><span className="text-zinc-400">Version:</span> {status.version}</p>
                <p><span className="text-zinc-400">Env:</span> {status.environment}</p>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-red-600">
                <span className="h-2 w-2 rounded-full bg-red-400" />
                {status.error}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      <Button size="xs" variant="secondary" loading={loading} onClick={check} className="shadow border border-zinc-200">
        <Activity size={13} /> API Health
      </Button>
    </div>
  )
}


// ─── HomePage ─────────────────────────────────────────────────────────────────

export default function HomePage() {
  const { settings, loading: settingsLoading } = useSiteSettings()
  const { toast, toasts, dismiss }             = useToast()
  const { visible: scrollVisible, scrollToTop } = useScrollToTop()
  const {
    items, isOpen, setIsOpen, isCheckoutOpen, setIsCheckoutOpen,
    addToCart, removeFromCart, updateQuantity, clearCart,
    totalPrice, totalItems, toOrderItems,
  } = useCart()

  const [products, setProducts]         = useState([])
  const [bankDetails, setBankDetails]   = useState([])   // always an array
  const [pageLoading, setPageLoading]   = useState(true)
  const [loadingItems, setLoadingItems] = useState({})

  // Filter state — shared between Header and ProductGrid
  const [search, setSearch]     = useState('')
  const [category, setCategory] = useState('All')

  // Modal open/close state
  const [howItWorksOpen, setHowItWorksOpen]         = useState(false)
  const [bankDetailsOpen, setBankDetailsOpen]       = useState(false)
  const [trackingOpen, setTrackingOpen]             = useState(false)
  const [uploadOpen, setUploadOpen]                 = useState(false)
  const [productOpen, setProductOpen]               = useState(false)
  const [selectedProduct, setSelectedProduct]       = useState(null)
  const [orderConfirmedOpen, setOrderConfirmedOpen] = useState(false)

  // Form / response state
  const [trackInput, setTrackInput]           = useState('')
  const [orderStatus, setOrderStatus]         = useState(null)
  const [uploadCode, setUploadCode]           = useState('')
  const [uploadFile, setUploadFile]           = useState(null)
  const [uploadLoading, setUploadLoading]     = useState(false)
  const [confirmedCode, setConfirmedCode]     = useState('')
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [trackLoading, setTrackLoading]       = useState(false)
  const [checkoutData, setCheckoutData]       = useState({ name: '', email: '', phone: '', location: '' })

  const categories = ['All', ...new Set(products.map(p => p.category).filter(Boolean))]

  // ── Initial data load ───────────────────────────────────────────────────────

  useEffect(() => {
    Promise.all([
      getProducts().then(r => {
        // Handle both paginated { results: [] } and plain array responses
        const data = r.data?.results ?? r.data
        setProducts(Array.isArray(data) ? data : [])
      }),
      getBankDetails().then(r => {
        // Normalise to array regardless of pagination or plain list
        const raw = r.data?.results ?? r.data
        if (Array.isArray(raw)) {
          setBankDetails(raw)
        } else if (raw && typeof raw === 'object') {
          setBankDetails([raw])
        } else {
          setBankDetails([])
        }
      }),
    ])
      .catch(() => toast.error('Failed to load page data. Please refresh.'))
      .finally(() => setPageLoading(false))
  }, [])

  // ── Cart / product actions ──────────────────────────────────────────────────

  const handleAddToCart = useCallback((product) => {
    setLoadingItems(p => ({ ...p, [product.id]: true }))
    addToCart(product, 1)
    toast.success(`${product.name} added to cart`)
    setTimeout(() => setLoadingItems(p => ({ ...p, [product.id]: false })), 700)
  }, [addToCart])

  const handleProductClick = useCallback((product) => {
    setSelectedProduct(product)
    setProductOpen(true)
  }, [])

  // ── Order tracking ──────────────────────────────────────────────────────────

  const handleTrackSubmit = async () => {
    if (!trackInput.trim()) return
    setTrackLoading(true)
    try {
      const r = await trackOrder(trackInput.trim())
      setOrderStatus(r.data)
    } catch (e) {
      toast.error(e.message)
      setOrderStatus(null)
    } finally {
      setTrackLoading(false)
    }
  }

  // ── Payment proof upload ────────────────────────────────────────────────────

  const handleUploadSubmit = async () => {
    if (!uploadCode.trim() || !uploadFile) {
      toast.error('Please enter your tracking code and select a file.')
      return
    }
    setUploadLoading(true)
    try {
      await uploadPaymentProof(uploadCode.trim(), uploadFile)
      toast.success('Payment proof uploaded successfully!')
      setUploadOpen(false)
      setUploadCode('')
      setUploadFile(null)
    } catch (e) {
      toast.error(e.message)
    } finally {
      setUploadLoading(false)
    }
  }

  // ── Checkout ────────────────────────────────────────────────────────────────

  const handleCheckoutSubmit = async () => {
    const { name, email, phone, location } = checkoutData
    if (!name || !email || !phone || !location) {
      toast.error('Please fill in all fields.')
      return
    }
    setCheckoutLoading(true)
    try {
      const r = await createOrder({
        ...checkoutData,
        total_amount: totalPrice.toFixed(2),
        items: toOrderItems(),
      })
      setConfirmedCode(r.data.tracking_code)
      clearCart()
      setIsCheckoutOpen(false)
      setOrderConfirmedOpen(true)
      setCheckoutData({ name: '', email: '', phone: '', location: '' })
    } catch (e) {
      toast.error(e.message)
    } finally {
      setCheckoutLoading(false)
    }
  }

  // ── Loading screen ──────────────────────────────────────────────────────────

  if (pageLoading || settingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" />
          <p className="text-xs text-zinc-400 uppercase tracking-widest">Loading</p>
        </div>
      </div>
    )
  }

  // Randomise featured products on each page load
  const featuredProducts = [...products].sort(() => 0.5 - Math.random()).slice(0, 6)

  // First bank account — used in checkout payment info block
  const primaryBank = bankDetails[0] ?? null

  return (
    <div className="min-h-screen">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <Header
        siteTitle={settings.site_title}
        cartCount={totalItems}
        onOpenCart={() => setIsOpen(true)}
        onOpenTracking={() => setTrackingOpen(true)}
        onOpenUpload={() => setUploadOpen(true)}
        onOpenHowItWorks={() => setHowItWorksOpen(true)}
        onOpenBankDetails={() => setBankDetailsOpen(true)}
        onSearchChange={(v) => { setSearch(v); setCategory('All') }}
        onCategoryChange={setCategory}
        categories={categories}
        activeCategory={category}
        searchValue={search}
        productsLoaded={products.length > 0}
      />

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <HeroSection
        siteTitle={settings.site_title}
        storeTag={settings.store_tag}
        onShopNow={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
        onTrackOrder={() => setTrackingOpen(true)}
        featuredProducts={featuredProducts}
      />

      {/* ── Product Grid ───────────────────────────────────────────────────── */}
      <ProductGrid
        products={products}
        onAddToCart={handleAddToCart}
        onProductClick={handleProductClick}
        loadingItems={loadingItems}
        search={search}
        category={category}
      />

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <Footer
        siteTitle={settings.site_title}
        storeTag={settings.store_tag}
        contactEmail={settings.contact_email}
        contactNumber={settings.contact_number}
      />


      {/* ── How It Works modal ─────────────────────────────────────────────── */}
      <HowItWorksModal isOpen={howItWorksOpen} onClose={() => setHowItWorksOpen(false)} />


      {/* ── Bank Details modal ─────────────────────────────────────────────── */}
      <BankDetailsModal
        isOpen={bankDetailsOpen}
        onClose={() => setBankDetailsOpen(false)}
        bankDetails={bankDetails}
      />


      {/* ── Cart modal ─────────────────────────────────────────────────────── */}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Your Cart">
        {items.length === 0 ? (
          <div className="text-center py-14 text-zinc-400">
            <ShoppingCart size={32} className="mx-auto mb-3 opacity-25" />
            <p className="text-sm">Your cart is empty.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map(item => (
              <div key={item.id} className="flex items-center gap-3 p-3 bg-zinc-50 rounded-lg border border-zinc-100">
                <div className="h-11 w-11 rounded overflow-hidden bg-zinc-100 shrink-0">
                  {item.primary_image?.image
                    ? <img src={item.primary_image.image} alt={item.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center"><Package size={14} className="accent-text opacity-40" /></div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-800 truncate">{item.name}</p>
                  <p className="text-xs font-semibold accent-text">₦{parseFloat(item.price).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="h-6 w-6 rounded border border-zinc-200 text-xs font-bold text-zinc-600 hover:bg-zinc-100 flex items-center justify-center"
                  >−</button>
                  <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="h-6 w-6 rounded border border-zinc-200 text-xs font-bold text-zinc-600 hover:bg-zinc-100 flex items-center justify-center"
                  >+</button>
                </div>
                <button onClick={() => removeFromCart(item.id)} className="text-zinc-300 hover:text-red-400 transition-colors">
                  <X size={14} />
                </button>
              </div>
            ))}

            <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-zinc-400 uppercase tracking-wide">Total</p>
                <p className="text-xl font-bold accent-text">₦{totalPrice.toLocaleString()}</p>
              </div>
              <Button onClick={() => { setIsOpen(false); setIsCheckoutOpen(true) }}>
                Checkout →
              </Button>
            </div>
          </div>
        )}
      </Modal>


      {/* ── Checkout modal ─────────────────────────────────────────────────── */}
      <Modal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} title="Checkout">
        <div className="space-y-4">
          {/* Checkout guidance */}
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 space-y-3">
            <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">
              How to complete your order
            </p>
            <ol className="space-y-2.5">
              {[
                'Fill in your details below and click Place Order.',
                `Transfer exactly ₦${totalPrice.toLocaleString()} to any of our bank accounts — find them under Payment Info in the navigation menu.`,
                'Return here and click Upload Proof in the nav. Enter your tracking code and attach your transfer receipt.',
                'We\'ll confirm your payment and begin processing your order.',
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs text-zinc-600">
                  <span className="shrink-0 h-4 w-4 rounded-full accent-bg text-white flex items-center justify-center text-[9px] font-bold mt-0.5">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {[
            { key: 'name',     label: 'Full Name',        type: 'text',  ph: 'John Doe'             },
            { key: 'email',    label: 'Email',            type: 'email', ph: 'john@example.com'     },
            { key: 'phone',    label: 'Phone',            type: 'tel',   ph: '080XXXXXXXX'          },
            { key: 'location', label: 'Delivery Address', type: 'text',  ph: '123 Main St, Lagos'   },
          ].map(({ key, label, type, ph }) => (
            <div key={key}>
              <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wide mb-1">{label}</label>
              <input
                type={type}
                placeholder={ph}
                value={checkoutData[key]}
                onChange={e => setCheckoutData(p => ({ ...p, [key]: e.target.value }))}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm bg-white focus-accent"
              />
            </div>
          ))}

          {/* Order summary */}
          <div className="bg-zinc-50 rounded-lg p-3 border border-zinc-100 text-sm space-y-1.5">
            {items.map(i => (
              <div key={i.id} className="flex justify-between text-zinc-600 text-xs">
                <span>{i.name} × {i.quantity}</span>
                <span>₦{(parseFloat(i.price) * i.quantity).toLocaleString()}</span>
              </div>
            ))}
            <div className="border-t border-zinc-200 pt-1.5 flex justify-between font-semibold text-zinc-800 text-sm">
              <span>Total</span>
              <span className="accent-text">₦{totalPrice.toLocaleString()}</span>
            </div>
          </div>

          <Button className="w-full" loading={checkoutLoading} onClick={handleCheckoutSubmit}>
            Place Order
          </Button>
        </div>
      </Modal>


      {/* ── Order Confirmed modal ───────────────────────────────────────────── */}
      <Modal isOpen={orderConfirmedOpen} onClose={() => setOrderConfirmedOpen(false)} title="Order Placed" size="sm">
        <div className="text-center py-4">
          <div className="h-14 w-14 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={28} className="text-emerald-500" />
          </div>
          <p className="text-sm text-zinc-500 mb-5">
            Your order is confirmed. A tracking code has been sent to your email — save it below.
          </p>
          <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 mb-4 select-all cursor-copy">
            <p className="text-[10px] text-zinc-400 uppercase tracking-widest mb-1">Tracking Code</p>
            <p className="text-xl font-mono font-bold accent-text tracking-wider">{confirmedCode}</p>
          </div>
          <p className="text-xs text-zinc-400 mb-5">
            Use this code to upload your payment proof and track your order status.
          </p>
          <Button
            className="w-full"
            variant="outline"
            onClick={() => {
              setOrderConfirmedOpen(false)
              setUploadOpen(true)
              setUploadCode(confirmedCode)
            }}
          >
            <Upload size={14} /> Upload Payment Proof Now
          </Button>
        </div>
      </Modal>


      {/* ── Track Order modal ───────────────────────────────────────────────── */}
      <Modal
        isOpen={trackingOpen}
        onClose={() => { setTrackingOpen(false); setOrderStatus(null); setTrackInput('') }}
        title="Track Your Order"
      >
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. MS-2025-A3BX9K2Z"
              value={trackInput}
              onChange={e => setTrackInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleTrackSubmit()}
              className="flex-1 px-3 py-2 border border-zinc-200 rounded-lg text-sm focus-accent"
            />
            <Button onClick={handleTrackSubmit} loading={trackLoading}>Track</Button>
          </div>

          <AnimatePresence>
            {orderStatus && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-zinc-50 rounded-lg border border-zinc-200 p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-zinc-800 text-sm">{orderStatus.name}</p>
                    <p className="text-xs text-zinc-400 font-mono mt-0.5">{orderStatus.tracking_code}</p>
                  </div>
                  <Badge status={orderStatus.status} />
                </div>

                <p className="text-sm text-zinc-600">
                  Total: <span className="font-semibold text-zinc-900">₦{parseFloat(orderStatus.total_amount).toLocaleString()}</span>
                </p>

                {orderStatus.items?.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-1.5">Items</p>
                    <div className="space-y-1">
                      {orderStatus.items.map(item => (
                        <div key={item.id} className="flex justify-between text-xs text-zinc-600">
                          <span>{item.product_name} × {item.quantity}</span>
                          <span>₦{parseFloat(item.subtotal).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {orderStatus.status_history?.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-1">History</p>
                    <StatusTimeline statusHistory={orderStatus.status_history} />
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Modal>


      {/* ── Upload Payment Proof modal ──────────────────────────────────────── */}
      <Modal
        isOpen={uploadOpen}
        onClose={() => { setUploadOpen(false); setUploadFile(null) }}
        title="Upload Payment Proof"
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wide mb-1">Tracking Code</label>
            <input
              type="text"
              placeholder="MS-2025-XXXXXXXX"
              value={uploadCode}
              onChange={e => setUploadCode(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus-accent"
            />
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wide mb-1">Receipt File</label>
            <div
              onClick={() => document.getElementById('proof-file').click()}
              className={`
                relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all
                ${uploadFile
                  ? 'border-emerald-300 bg-emerald-50'
                  : 'border-zinc-200 hover:border-zinc-300 bg-zinc-50 hover:bg-zinc-100'}
              `}
            >
              <input
                id="proof-file"
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                className="hidden"
                onChange={e => setUploadFile(e.target.files[0] || null)}
              />
              {uploadFile ? (
                <div className="flex items-center justify-center gap-2 text-emerald-700 text-sm font-medium">
                  <CheckCircle size={16} />
                  {uploadFile.name}
                </div>
              ) : (
                <>
                  <Upload size={22} className="mx-auto mb-2 text-zinc-400" />
                  <p className="text-sm text-zinc-500">Click to select file</p>
                  <p className="text-xs text-zinc-400 mt-1">JPG, PNG or PDF · max 10MB</p>
                </>
              )}
            </div>
          </div>

          <Button className="w-full" loading={uploadLoading} onClick={handleUploadSubmit}>
            Submit Proof
          </Button>
        </div>
      </Modal>


      {/* ── Product Detail modal ────────────────────────────────────────────── */}
      <ProductModal
        product={selectedProduct}
        isOpen={productOpen}
        onClose={() => { setProductOpen(false); setSelectedProduct(null) }}
        onAddToCart={handleAddToCart}
      />


      {/* ── Scroll to top ───────────────────────────────────────────────────── */}
      <AnimatePresence>
        {scrollVisible && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="fixed bottom-5 right-5 z-50 h-9 w-9 rounded-lg accent-bg text-white shadow-lg flex items-center justify-center hover:opacity-90 transition-opacity"
          >
            <ArrowUp size={16} />
          </motion.button>
        )}
      </AnimatePresence>

      <HealthPanel />
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  )
}

