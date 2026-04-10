import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { ChevronRight, Package, Truck, CreditCard, CheckCircle, ArrowRight, ChevronDown } from 'lucide-react'
import Button from '../ui/Button'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ─── Mosaic tile (desktop) ────────────────────────────────────────────────────

function MosaicTile({ product, variant, delay }) {
  const img = product.primary_image?.image || product.images?.[0]?.image

  // variant controls size/position within the mosaic
  const variants = {
    // Large feature tile — top left, tall
    feature: 'row-span-2 col-span-1',
    // Wide tile — top right
    wide:    'col-span-2 row-span-1',
    // Small tile
    small:   'col-span-1 row-span-1',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`relative overflow-hidden rounded-lg group cursor-default ${variants[variant]}`}
    >
      {/* Image */}
      <div className="absolute inset-0">
        {img ? (
          <img
            src={img}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-[1.06] transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-zinc-800">
            <Package size={32} className="text-zinc-600" />
          </div>
        )}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* Accent left bar */}
      <div className="absolute left-0 top-4 bottom-4 w-[2px] accent-bg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-3">
        {variant === 'feature' && (
          <p className="text-[9px] font-semibold text-white/50 uppercase tracking-widest mb-1">{product.category}</p>
        )}
        <p className={`font-semibold text-white truncate leading-tight ${variant === 'feature' ? 'text-sm' : 'text-xs'}`}>
          {product.name}
        </p>
        <p className={`font-bold accent-text mt-0.5 ${variant === 'feature' ? 'text-base' : 'text-sm'}`}>
          ₦{parseFloat(product.price).toLocaleString()}
        </p>
      </div>

      {/* Multi-image indicator */}
      {(product.images?.length || 0) > 1 && (
        <div className="absolute top-2 right-2 flex gap-0.5">
          {product.images.slice(0, 3).map((_, i) => (
            <span key={i} className={`h-0.5 rounded-full bg-white ${i === 0 ? 'w-3' : 'w-1 opacity-40'}`} />
          ))}
        </div>
      )}
    </motion.div>
  )
}

// ─── Desktop mosaic grid ──────────────────────────────────────────────────────
// Layout: 3-col × 2-row grid
// [ feature (tall) ][ wide (top-right, spans 2 cols) ]
// [ feature (tall) ][ small ][ small ]

function DesktopMosaic({ products }) {
  const [tiles] = useState(() => shuffle(products).slice(0, 4))
  if (tiles.length < 2) return null

  return (
    <div className="hidden md:grid grid-cols-3 grid-rows-2 gap-2.5 h-[460px] lg:h-[500px]">
      {/* Feature — spans 2 rows */}
      {tiles[0] && <MosaicTile product={tiles[0]} variant="feature" delay={0.3} />}
      {/* Wide — spans 2 cols, row 1 */}
      {tiles[1] && <MosaicTile product={tiles[1]} variant="wide" delay={0.38} />}
      {/* Two smalls — row 2, cols 2 & 3 */}
      {tiles[2] && <MosaicTile product={tiles[2]} variant="small" delay={0.44} />}
      {tiles[3] && <MosaicTile product={tiles[3]} variant="small" delay={0.50} />}
    </div>
  )
}

// ─── Mobile — full-bleed stacked card ─────────────────────────────────────────

function MobileStack({ products }) {
  const [shuffled] = useState(() => shuffle(products).slice(0, 5))
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (!shuffled.length) return
    const t = setInterval(() => setIndex(i => (i + 1) % shuffled.length), 3600)
    return () => clearInterval(t)
  }, [shuffled.length])

  if (!shuffled.length) return null
  const p = shuffled[index]
  const img = p.primary_image?.image || p.images?.[0]?.image

  return (
    <div className="relative w-full overflow-hidden rounded-lg" style={{ aspectRatio: '3/2' }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={p.id}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="absolute inset-0"
        >
          {img ? (
            <img src={img} alt={p.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
              <Package size={36} className="text-zinc-600" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Info */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={p.id + '-info'}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-[9px] font-semibold text-white/50 uppercase tracking-widest">{p.category}</p>
            <p className="text-sm font-semibold text-white mt-0.5">{p.name}</p>
            <p className="text-base font-bold accent-text">₦{parseFloat(p.price).toLocaleString()}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress indicators */}
      <div className="absolute bottom-3 right-3 flex gap-1">
        {shuffled.map((_, i) => (
          <span
            key={i}
            className={`rounded-full transition-all duration-400 ${i === index ? 'w-5 h-1 bg-white' : 'w-1 h-1 bg-white/30'}`}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Animated grid lines overlay ─────────────────────────────────────────────

function GridOverlay() {
  return (
    <div
      className="absolute inset-0 pointer-events-none opacity-[0.08]"
      style={{
        backgroundImage:
          'linear-gradient(var(--color-accent) 1px, transparent 1px), ' +
          'linear-gradient(90deg, var(--color-accent) 1px, transparent 1px)',
        backgroundSize: '52px 52px',
      }}
    />
  )
}

// ─── Animated accent beam ─────────────────────────────────────────────────────

function AccentBeam() {
  return (
    <>
      {/* Diagonal beam — top right */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, delay: 0.1 }}
        className="absolute -top-32 right-[15%] w-[600px] h-[600px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(var(--color-accent-rgb), 0.15) 0%, transparent 65%)',
          transform: 'rotate(-30deg)',
        }}
      />
      {/* Bottom left glow */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.4, delay: 0.3 }}
        className="absolute bottom-0 left-0 w-80 h-80 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at bottom left, rgba(var(--color-accent-rgb), 0.1) 0%, transparent 70%)',
        }}
      />
    </>
  )
}

const TRUST = [
  { icon: Truck,      label: 'Fast delivery'  },
  { icon: CreditCard, label: 'Bank transfer'  },
  { icon: CheckCircle,label: 'Order tracking' },
]

function SiteName({ siteTitle }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="mt-4 text-center cursor-pointer"
      onClick={() => {
        const productsSection = document.getElementById('products')
        if (productsSection) {
          productsSection.scrollIntoView({ behavior: 'smooth' })
        }
      }}
    >
      <p className="text-[15px] font-serif italic text-zinc-400 tracking-wide mb-2">
        {siteTitle}
      </p>
      
      <motion.div
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        className="flex justify-center text-zinc-400"
      >
        <ChevronDown size={14} />
      </motion.div>
    </motion.div>
  )
}

// ─── Main HeroSection ─────────────────────────────────────────────────────────

export default function HeroSection({ siteTitle, storeTag, onShopNow, onTrackOrder, featuredProducts }) {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-zinc-200">
      <GridOverlay />
      <AccentBeam />

      {/* Left accent bar */}
      <div className="absolute left-0 top-0 bottom-0 w-[3px] accent-bg opacity-80" />

      {/* ── MOBILE layout ────────────────────────────────────────────────────── */}
      <div className="md:hidden relative w-full px-4 py-10 flex flex-col gap-6">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45 }}
          className="flex items-center gap-2"
        >
          <span className="h-px w-8 accent-bg" />
          <span className="text-[10px] font-semibold text-zinc-700 uppercase tracking-widest">
            Accepting orders
          </span>
          <span className="h-1.5 w-1.5 rounded-full accent-bg animate-pulse" />
        </motion.div>

        {/* Carousel */}
        {featuredProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.55 }}
          >
            <MobileStack products={featuredProducts} />
          </motion.div>
        )}

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="text-zinc-700 text-sm leading-relaxed max-w-xs"
        >
          {storeTag}
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.32 }}
          className="flex gap-2.5"
        >
          <Button size="sm" onClick={onShopNow} className="accent-shadow">
            Shop Now <ArrowRight size={14} />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onTrackOrder}
            className="border border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
          >
            Track Order
          </Button>
        </motion.div>

        {/* Trust */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex gap-5"
        >
          {TRUST.map(({ icon: Icon, label }) => (
            <span key={label} className="flex items-center gap-1.5 text-xs text-zinc-600">
              <Icon size={12} className="accent-text" /> {label}
            </span>
          ))}
        </motion.div>

        {/* Trust */}
        <SiteName siteTitle={siteTitle} />
      </div>

      {/* ── DESKTOP layout ───────────────────────────────────────────────────── */}
      <div className="hidden md:flex relative w-full max-w-7xl mx-auto px-6 py-0 min-h-screen items-center gap-16 lg:gap-24">

        {/* Left column */}
        <div className="flex-1 max-w-lg">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3 mb-8"
          >
            <span className="h-px w-12 accent-bg" />
            <span className="text-[10px] font-semibold text-zinc-700 uppercase tracking-[0.2em]">
              Accepting orders
            </span>
            <span className="h-1.5 w-1.5 rounded-full accent-bg animate-pulse" />
          </motion.div>

          {/* Headline — large italic serif */}
          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="font-serif italic text-zinc-900 leading-[0.95] tracking-tight mb-6"
            style={{ fontSize: 'clamp(3rem, 5vw, 5.5rem)' }}
          >
            {siteTitle}
          </motion.h1>

          {/* Accent rule */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="h-[2px] w-24 accent-bg mb-6 origin-left"
          />

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.18 }}
            className="text-zinc-700 text-lg leading-relaxed mb-10 max-w-sm"
          >
            {storeTag}
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28 }}
            className="flex flex-wrap gap-3 mb-12"
          >
            <Button size="lg" onClick={onShopNow} className="accent-shadow gap-2">
              Shop Now <ArrowRight size={16} />
            </Button>
            <Button
              size="lg"
              variant="ghost"
              onClick={onTrackOrder}
              className="border border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
            >
              Track My Order
            </Button>
          </motion.div>

          {/* Trust signals */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.38 }}
            className="flex flex-wrap gap-6"
          >
            {TRUST.map(({ icon: Icon, label }) => (
              <span key={label} className="flex items-center gap-2 text-sm text-zinc-600">
                <Icon size={14} className="accent-text" />
                {label}
              </span>
            ))}
          </motion.div>
        </div>

        {/* Right column — mosaic */}
        {featuredProducts.length > 0 && (
          <div className="flex-1 max-w-[520px] lg:max-w-[580px]">
            <DesktopMosaic products={featuredProducts} />
          </div>
        )}
      </div>
    </section>
  )
}