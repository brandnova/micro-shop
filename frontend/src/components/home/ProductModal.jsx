import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Package, ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'

export default function ProductModal({ product, isOpen, onClose, onAddToCart }) {
  const [imgIndex, setImgIndex] = useState(0)

  if (!product) return null

  const images = product.images || []
  const hasMultiple = images.length > 1
  const current = images[imgIndex]
  const inStock = product.quantity > 0

  const prev = () => setImgIndex(i => (i - 1 + images.length) % images.length)
  const next = () => setImgIndex(i => (i + 1) % images.length)

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => { onClose(); setImgIndex(0) }}
      title={product.name}
      size="lg"
    >
      <div className="grid sm:grid-cols-2 gap-6">
        {/* Image viewer */}
        <div className="flex flex-col gap-3">
          <div className="relative aspect-square bg-zinc-50 rounded-lg overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={imgIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0"
              >
                {current?.image ? (
                  <img src={current.image} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center accent-light-bg">
                    <Package size={48} className="accent-text opacity-25" />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Arrow controls */}
            {hasMultiple && (
              <>
                <button
                  onClick={prev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg bg-white/90 backdrop-blur-sm border border-zinc-200 flex items-center justify-center hover:bg-white shadow-sm transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={next}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg bg-white/90 backdrop-blur-sm border border-zinc-200 flex items-center justify-center hover:bg-white shadow-sm transition-colors"
                >
                  <ChevronRight size={16} />
                </button>

                {/* Counter */}
                <div className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] font-medium px-2 py-0.5 rounded">
                  {imgIndex + 1} / {images.length}
                </div>
              </>
            )}
          </div>

          {/* Thumbnail strip */}
          {hasMultiple && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setImgIndex(i)}
                  className={`
                    shrink-0 h-14 w-14 rounded overflow-hidden border-2 transition-all
                    ${i === imgIndex ? 'accent-border shadow-sm' : 'border-transparent opacity-60 hover:opacity-100'}
                  `}
                >
                  {img.image ? (
                    <img src={img.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full accent-light-bg flex items-center justify-center">
                      <Package size={14} className="accent-text opacity-40" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col">
          <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-1">{product.category}</p>
          <h2 className="font-serif text-2xl text-zinc-900 leading-tight mb-2">{product.name}</h2>
          <p className="text-2xl font-bold accent-text mb-4">₦{parseFloat(product.price).toLocaleString()}</p>

          <p className="text-sm text-zinc-500 leading-relaxed flex-1">{product.description}</p>

          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-2">
              <span className={`h-1.5 w-1.5 rounded-full ${inStock ? 'bg-emerald-500' : 'bg-red-400'}`} />
              <span className="text-xs text-zinc-500">
                {inStock ? `${product.quantity} in stock` : 'Out of stock'}
              </span>
            </div>
            <Button
              className="w-full"
              disabled={!inStock}
              onClick={() => { onAddToCart(product); onClose(); setImgIndex(0) }}
            >
              <ShoppingCart size={15} />
              Add to Cart
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}