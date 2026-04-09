import { motion } from 'framer-motion'
import { Package } from 'lucide-react'
import Button from '../ui/Button'

export default function ProductCard({ product, onAddToCart, onClick, loading }) {
  const img   = product.primary_image?.image || product.images?.[0]?.image
  const extra = (product.images?.length || 0) - 1
  const inStock = product.quantity > 0

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="group bg-white rounded-lg overflow-hidden border border-zinc-200/80 hover:border-zinc-300 shadow-sm hover:shadow-md transition-all duration-250 cursor-pointer"
      onClick={() => onClick(product)}
    >
      {/* Image */}
      <div className="relative overflow-hidden aspect-square bg-zinc-50">
        {img ? (
          <img
            src={img}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center accent-light-bg">
            <Package size={32} className="accent-text opacity-25" />
          </div>
        )}

        {/* Multi-image indicator */}
        {extra > 0 && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/50 backdrop-blur-sm text-white text-[9px] font-semibold px-1.5 py-0.5 rounded">
            <span className="h-1 w-3 bg-white rounded-full" />
            <span className="h-1 w-1 bg-white/50 rounded-full" />
            +{extra}
          </div>
        )}

        {!inStock && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
            <span className="bg-zinc-900 text-white text-[10px] font-semibold px-2.5 py-1 rounded uppercase tracking-wide">
              Out of Stock
            </span>
          </div>
        )}

        {/* Quick add — appears on hover */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-200">
          <button
            onClick={(e) => { e.stopPropagation(); onAddToCart(product) }}
            disabled={!inStock || loading}
            className="w-full py-2.5 accent-bg text-white text-xs font-semibold uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            {loading ? 'Adding…' : 'Quick Add'}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="px-3 py-3">
        <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider truncate">{product.category}</p>
        <h3 className="text-sm font-semibold text-zinc-900 truncate mt-0.5">{product.name}</h3>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-base font-bold accent-text">₦{parseFloat(product.price).toLocaleString()}</span>
          <span className="text-[10px] text-zinc-400">{product.quantity > 0 ? `${product.quantity} left` : ''}</span>
        </div>
      </div>
    </motion.div>
  )
}