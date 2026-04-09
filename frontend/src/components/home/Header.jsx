import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingCart, Package, Search, Eye, Upload,
  HelpCircle, CreditCard, X, SlidersHorizontal
} from 'lucide-react'

export default function Header({
  siteTitle, cartCount,
  onOpenCart, onOpenTracking, onOpenUpload, onOpenHowItWorks, onOpenBankDetails,
  onSearchChange, onCategoryChange, categories, activeCategory,
  searchValue, productsLoaded,
}) {
  const [scrolled, setScrolled]         = useState(false)
  const [mobileOpen, setMobileOpen]     = useState(false)
  const [filterOpen, setFilterOpen]     = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  // Close mobile menu on scroll
  useEffect(() => {
    if (scrolled && mobileOpen) setMobileOpen(false)
  }, [scrolled])

  const navActions = [
  { icon: CreditCard,  label: 'Payment Info',  action: onOpenBankDetails },
  { icon: Eye,         label: 'Track Order',   action: onOpenTracking    },
  { icon: Upload,      label: 'Upload Proof',  action: onOpenUpload      },
  { icon: HelpCircle,  label: 'How it Works',  action: onOpenHowItWorks  },
]

  return (
    <>
      <header className={`
        fixed top-0 left-0 right-0 z-40 transition-all duration-300
        ${scrolled
          ? 'bg-white/95 backdrop-blur-md border-b border-zinc-200/80 shadow-sm'
          : 'bg-transparent border-b border-transparent'}
      `}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Main bar */}
          <div className="h-14 flex items-center justify-between gap-4">

            {/* Logo */}
            <a href="/" className="flex items-center gap-2 shrink-0 group">
              <div className="h-7 w-7 rounded-md accent-bg flex items-center justify-center transition-transform group-hover:scale-105">
                <Package size={14} className="text-white" />
              </div>
              <span className="font-serif text-base text-zinc-900 tracking-tight leading-none">{siteTitle}</span>
            </a>

            {/* Desktop nav — icon buttons with tooltips */}
            <nav className="hidden md:flex items-center gap-1">
              {navActions.map(({ icon: Icon, label, action }) => (
                <button
                  key={label}
                  onClick={action}
                  title={label}
                  className="group relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-zinc-700 hover:text-white hover:accent-bg transition-all"
                >
                  <Icon size={15} />
                  <span className="text-sm">{label}</span>
                </button>
              ))}
            </nav>

            {/* Right cluster */}
            <div className="flex items-center gap-1.5">
              {/* Search toggle (desktop) */}
              {productsLoaded && (
                <button
                  onClick={() => setFilterOpen(v => !v)}
                  title="Search & Filter"
                  className={`
                    hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                    ${filterOpen
                      ? 'accent-bg text-white'
                      : 'text-zinc-700 hover:text-white hover:accent-bg'}
                  `}
                >
                  <Search size={15} />
                  {searchValue ? (
                    <span className="text-xs max-w-[80px] truncate">{searchValue}</span>
                  ) : (
                    <span>Search</span>
                  )}
                </button>
              )}

              {/* Cart */}
              <button
                onClick={onOpenCart}
                className="relative flex items-center justify-center h-9 w-9 rounded-lg text-zinc-600 hover:text-white hover:accent-bg transition-colors"
              >
                <ShoppingCart size={18} />
                {cartCount > 0 && (
                  <motion.span
                    key={cartCount}
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute -top-0.5 -right-0.5 h-4 w-4 flex items-center justify-center rounded-full accent-bg text-white text-[9px] font-bold"
                  >
                    {cartCount > 9 ? '9+' : cartCount}
                  </motion.span>
                )}
              </button>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(v => !v)}
                className="md:hidden flex items-center justify-center h-9 w-9 rounded-lg text-zinc-600 hover:bg-zinc-100 transition-colors"
              >
                {mobileOpen ? <X size={18} /> : <SlidersHorizontal size={18} />}
              </button>
            </div>
          </div>

          {/* Desktop filter bar — slides down below header */}
          <AnimatePresence>
            {filterOpen && productsLoaded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden border-t border-zinc-100"
              >
                <div className="py-3 flex flex-col sm:flex-row gap-3">
                  {/* Search input */}
                  <div className="relative flex-1 max-w-xs">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="text"
                      placeholder="Search products…"
                      value={searchValue}
                      onChange={(e) => onSearchChange(e.target.value)}
                      onFocus={() => setSearchFocused(true)}
                      onBlur={() => setSearchFocused(false)}
                      className="w-full pl-8 pr-3 py-1.5 text-sm border border-zinc-200 rounded-lg bg-white focus-accent"
                      autoFocus
                    />
                  </div>

                  {/* Category pills */}
                  <div className="flex gap-1.5 flex-wrap">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => onCategoryChange(cat)}
                        className={`
                          px-3 py-1 rounded-lg text-xs font-medium border transition-all
                          ${activeCategory === cat
                            ? 'accent-bg text-white border-transparent accent-shadow'
                            : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300 hover:text-zinc-900'}
                        `}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="md:hidden bg-white border-t border-zinc-100 shadow-lg"
            >
              <div className="px-4 py-4 space-y-4">
                {/* Mobile search */}
                {productsLoaded && (
                  <div>
                    <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-2">Search</p>
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input
                        type="text"
                        placeholder="Search products…"
                        value={searchValue}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 text-sm border border-zinc-200 rounded-lg bg-zinc-50 focus-accent"
                      />
                    </div>

                    {/* Mobile category pills */}
                    <div className="mt-2.5 flex gap-1.5 flex-wrap">
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => { onCategoryChange(cat); setMobileOpen(false) }}
                          className={`
                            px-2.5 py-1 rounded text-xs font-medium border transition-all
                            ${activeCategory === cat
                              ? 'accent-bg text-white border-transparent'
                              : 'bg-zinc-50 text-zinc-600 border-zinc-200'}
                          `}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mobile actions */}
                <div>
                  <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-2">Actions</p>
                  <div className="grid grid-cols-3 gap-2">
                    {navActions.map(({ icon: Icon, label, action }) => (
                      <button
                        key={label}
                        onClick={() => { action(); setMobileOpen(false) }}
                        className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-zinc-50 hover:bg-zinc-100 border border-zinc-100 transition-colors"
                      >
                        <Icon size={18} className="accent-text" />
                        <span className="text-[10px] font-medium text-zinc-600 text-center leading-tight">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  )
}