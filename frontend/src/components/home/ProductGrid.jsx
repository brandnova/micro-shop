import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Package } from 'lucide-react'
import Spinner from '../ui/Spinner'
import ProductCard from './ProductCard'

const PAGE_SIZE = 12

export default function ProductGrid({
  products, onAddToCart, onProductClick, loadingItems,
  search, category,
}) {
  const [page, setPage]       = useState(1)
  const sentinelRef           = useRef(null)

  const filtered = products.filter(p => {
    const matchCat    = category === 'All' || p.category === category
    const matchSearch = p.name.toLowerCase().includes((search || '').toLowerCase())
    return matchCat && matchSearch
  })

  // Reset page whenever filters change
  useEffect(() => { setPage(1) }, [search, category])

  const visible  = filtered.slice(0, page * PAGE_SIZE)
  const hasMore  = visible.length < filtered.length

  const loadMore = useCallback(() => {
    if (hasMore) setPage(p => p + 1)
  }, [hasMore])

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMore() },
      { rootMargin: '300px' }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [loadMore])

  return (
    <section id="products" className="py-16 bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-end gap-4 mb-8">
          <div>
            <h2 className="font-serif text-3xl text-zinc-900">
              {search || category !== 'All' ? 'Results' : 'All Products'}
            </h2>
            <p className="text-sm text-zinc-400 mt-1">
              {filtered.length} {filtered.length === 1 ? 'item' : 'items'}
              {category !== 'All' ? ` in ${category}` : ''}
              {search ? ` matching "${search}"` : ''}
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-0 flex-1">
            <div className="flex-1 h-px bg-zinc-200" />
            <div className="h-px w-8 accent-bg" />
          </div>
        </div>

        {visible.length === 0 ? (
          <div className="text-center py-24 text-zinc-400">
            <Package size={36} className="mx-auto mb-3 opacity-25" />
            <p className="text-sm">No products found.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
              {visible.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.035, 0.35) }}
                >
                  <ProductCard
                    product={p}
                    onAddToCart={onAddToCart}
                    onClick={onProductClick}
                    loading={!!loadingItems[p.id]}
                  />
                </motion.div>
              ))}
            </div>

            <div ref={sentinelRef} className="flex justify-center py-10 h-16">
              {hasMore && <Spinner size="md" />}
            </div>
          </>
        )}
      </div>
    </section>
  )
}