import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Package, X, Image as ImageIcon, Eye, EyeOff, Trash2 } from 'lucide-react'
import Button from '../ui/Button'
import Pagination from './Pagination'
import { usePagination } from '../../hooks/usePagination'

const EMPTY = { name: '', category: '', description: '', price: '', quantity: 0 }

// ─── Category picker — always-visible pill grid ───────────────────────────────

function CategoryPicker({ value, onChange, categories }) {
  if (!categories.length) return null
  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {categories.map(cat => (
        <button
          key={cat}
          type="button"
          onClick={() => onChange(value === cat ? '' : cat)}
          className={`text-[11px] px-2.5 py-1 rounded border font-medium transition-all ${
            value === cat
              ? 'accent-bg text-white border-transparent shadow-sm'
              : 'border-zinc-200 text-zinc-500 hover:border-zinc-300 hover:text-zinc-700 bg-white'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  )
}

// ─── Product form ─────────────────────────────────────────────────────────────

function ProductForm({
  form, setForm, editing, editingId, images, setImages,
  onSubmit, onCancel, saving, onSetPrimary, onDeleteImage,
  existingCategories,
}) {
  const [imageActionLoading, setImageActionLoading] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  
  useEffect(() => {
    setSubmitted(false)
  }, [editingId])
  
  const isValid = form.name.trim() !== '' && form.price !== '' && parseFloat(form.price) > 0

  const handleSetPrimary = async (imageId) => {
    setImageActionLoading(imageId)
    try { await onSetPrimary(editingId, imageId) }
    finally { setImageActionLoading(null) }
  }

  const handleDeleteImage = async (imageId) => {
    setImageActionLoading(imageId)
    try { await onDeleteImage(editingId, imageId) }
    finally { setImageActionLoading(null) }
  }

  const handleFormSubmit = () => {
    setSubmitted(true)
    if (!isValid) return   // stop here — errors will now show
    onSubmit()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="bg-white rounded-lg border border-zinc-200 p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-zinc-800 text-sm">
          {editing ? `Editing: ${editing.name}` : 'New Product'}
        </h3>
        <button onClick={onCancel} className="p-1 rounded text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100">
          <X size={15} />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Name — required */}
        <div className="sm:col-span-2">
          <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-1">
            Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            placeholder="Product name"
            value={form.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            className={`w-full px-3 py-2 border rounded-lg text-sm focus-accent bg-white transition-colors ${
              submitted && form.name.trim() === ''
                ? 'border-red-300 bg-red-50/40'
                : 'border-zinc-200'
            }`}
          />
          {submitted && form.name.trim() === '' && (
            <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1">
              <span>⚠</span> Product name is required
            </p>
          )}
        </div>

        {/* Category */}
        <div className="sm:col-span-2">
          <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-1">
            Category
          </label>
          <input
            type="text"
            placeholder="Type a new category or select below…"
            value={form.category}
            onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
            className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus-accent bg-white"
          />
          <CategoryPicker
            value={form.category}
            onChange={cat => setForm(p => ({ ...p, category: cat }))}
            categories={existingCategories}
          />
        </div>

        {/* Price — required */}
        <div>
          <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-1">
            Price (₦) <span className="text-red-400">*</span>
          </label>
          <input
            type="number"
            placeholder="0.00"
            min="0"
            step="0.01"
            value={form.price}
            onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
            className={`w-full px-3 py-2 border rounded-lg text-sm focus-accent bg-white transition-colors ${
              submitted && (!form.price || parseFloat(form.price) <= 0)
                ? 'border-red-300 bg-red-50/40'
                : 'border-zinc-200'
            }`}
          />
          {submitted && (!form.price || parseFloat(form.price) <= 0) && (
            <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1">
              <span>⚠</span> Price must be greater than 0
            </p>
          )}
        </div>

        {/* Stock — optional */}
        <div>
          <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-1">
            Stock
            <span className="ml-1 font-normal normal-case text-zinc-300">(optional)</span>
          </label>
          <input
            type="number"
            placeholder="0"
            min="0"
            value={form.quantity}
            onChange={e => setForm(p => ({ ...p, quantity: e.target.value }))}
            className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus-accent bg-white"
          />
        </div>

        {/* Description */}
        <div className="sm:col-span-2">
          <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-1">
            Description
          </label>
          <textarea
            placeholder="Product description…"
            value={form.description}
            onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus-accent bg-white resize-none"
          />
        </div>

        {/* Images */}
        <div className="sm:col-span-2">
          <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-1">
            Images
            <span className="ml-1 font-normal normal-case text-zinc-300">(optional)</span>
          </label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={e => setImages(Array.from(e.target.files))}
            className="w-full text-sm text-zinc-500 file:mr-3 file:px-3 file:py-1.5 file:rounded file:border-0 file:text-xs file:font-semibold file:accent-bg file:text-white file:cursor-pointer"
          />
          {images.length > 0 && (
            <p className="text-xs text-zinc-400 mt-1">{images.length} file{images.length > 1 ? 's' : ''} selected</p>
          )}
        </div>
      </div>

      {/* Existing images (edit mode) */}
      {editing && editing.images?.length > 0 && (
        <div className="mt-5 pt-4 border-t border-zinc-100">
          <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-3">
            Current Images
            <span className="ml-2 font-normal normal-case">— hover to set primary (★) or delete</span>
          </p>
          <div className="flex gap-2 flex-wrap">
            {editing.images.map(img => {
              const isLoading = imageActionLoading === img.id
              return (
                <div key={img.id} className="relative group">
                  <div className={`h-20 w-20 rounded-lg overflow-hidden border-2 transition-all ${
                    img.is_primary ? 'accent-border shadow-sm' : 'border-zinc-200'
                  } ${isLoading ? 'opacity-40' : ''}`}>
                    {img.image
                      ? <img src={img.image} alt="" loading="lazy" className="w-full h-full object-cover" />
                      : <div className="w-full h-full bg-zinc-100 flex items-center justify-center"><Package size={16} className="text-zinc-300" /></div>
                    }
                  </div>
                  {img.is_primary && (
                    <div className="absolute -top-1.5 -right-1.5 accent-bg text-white text-[8px] font-bold px-1.5 py-0.5 rounded leading-tight">
                      PRIMARY
                    </div>
                  )}
                  {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-white/60">
                      <svg className="animate-spin h-4 w-4 accent-text" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                    </div>
                  )}
                  {!isLoading && (
                    <div className="absolute inset-0 rounded-lg bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                      {!img.is_primary && (
                        <button
                          onClick={() => handleSetPrimary(img.id)}
                          className="h-7 w-7 rounded bg-white/20 hover:bg-white/40 flex items-center justify-center text-white text-xs font-bold"
                        >★</button>
                      )}
                      <button
                        onClick={() => handleDeleteImage(img.id)}
                        className="h-7 w-7 rounded bg-white/20 hover:bg-red-500/70 flex items-center justify-center text-white"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mt-5 pt-4 border-t border-zinc-100">
        <p className="text-[10px] text-zinc-400">
          <span className="text-red-400">*</span> Required fields
        </p>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={onCancel}>Cancel</Button>
          <Button
            size="sm"
            loading={saving}
            onClick={handleFormSubmit}
            title={submitted && !isValid ? 'Please fix the errors above' : undefined}
          >
            {editing ? 'Save Changes' : 'Add Product'}
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Status filter buttons ────────────────────────────────────────────────────

function StatusFilter({ value, onChange, counts }) {
  const options = [
    { key: 'all',      label: 'All',      count: counts.all      },
    { key: 'active',   label: 'Active',   count: counts.active   },
    { key: 'inactive', label: 'Inactive', count: counts.inactive },
  ]
  return (
    <div className="flex gap-1.5">
      {options.map(opt => (
        <button
          key={opt.key}
          onClick={() => onChange(opt.key)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
            value === opt.key
              ? 'accent-bg text-white border-transparent shadow-sm'
              : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300'
          }`}
        >
          {opt.label}
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
            value === opt.key ? 'bg-white/25 text-white' : 'bg-zinc-100 text-zinc-500'
          }`}>
            {opt.count}
          </span>
        </button>
      ))}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

const PAGE_SIZE = 10

export default function ProductsPanel({
  products, onAdd, onUpdate, onDelete,
  onPermanentDelete,
  onUploadImages, onDeleteImage, onSetPrimary,
}) {
  const [form, setForm]           = useState(EMPTY)
  const [editingId, setEditingId] = useState(null)
  const [images, setImages]       = useState([])
  const [showForm, setShowForm]   = useState(false)
  const [saving, setSaving]       = useState(false)
  const [search, setSearch]       = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Live-derived editing object — reflects image changes after load()
  const editing = editingId ? (products.find(p => p.id === editingId) ?? null) : null

  const existingCategories = useMemo(
    () => [...new Set(products.map(p => p.category).filter(Boolean))].sort(),
    [products]
  )

  // Status counts for the filter bar
  const counts = useMemo(() => ({
    all:      products.length,
    active:   products.filter(p => p.is_active !== false).length,
    inactive: products.filter(p => p.is_active === false).length,
  }), [products])

  // Filter — search + status
  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return products.filter(p => {
      const matchSearch = !q ||
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active'   &&  p.is_active !== false) ||
        (statusFilter === 'inactive' &&  p.is_active === false)
      return matchSearch && matchStatus
    })
  }, [products, search, statusFilter])

  // Pagination — resets to p1 whenever filtered list changes
  const pg = usePagination(filtered, PAGE_SIZE)
  useEffect(() => { pg.reset() }, [search, statusFilter])

  const startEdit = (p) => {
    setEditingId(p.id)
    setForm({ name: p.name, category: p.category, description: p.description, price: p.price, quantity: p.quantity })
    setImages([])
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const reset = () => { setForm(EMPTY); setEditingId(null); setImages([]); setShowForm(false) }

  const handleSubmit = async () => {
    if (!form.name || !form.price) return
    setSaving(true)
    try {
      editing ? await onUpdate(editing.id, form, images) : await onAdd(form, images)
      reset()
    } finally {
      setSaving(false)
    }
  }

  // Shared row renderer — used by both desktop table and mobile cards
  const renderDesktopRow = (p, i) => {
    const img      = p.primary_image?.image || p.images?.[0]?.image
    const inactive = p.is_active === false

    return (
      <motion.tr
        key={p.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: i * 0.02 }}
        className={`transition-colors ${inactive ? 'bg-red-50/60' : 'hover:bg-zinc-50'}`}
      >
        <td className="px-4 py-3">
          <div className="flex items-center gap-3">
            <div className={`relative h-9 w-9 rounded overflow-hidden shrink-0 ${inactive ? 'grayscale opacity-60' : ''}`}>
              {img
                ? <img src={img} alt="" loading="lazy" className="w-full h-full object-cover" />
                : <div className="w-full h-full bg-zinc-100 flex items-center justify-center"><Package size={14} className="text-zinc-300" /></div>
              }
            </div>
            <div className="min-w-0">
              <p className={`font-medium truncate max-w-[160px] ${inactive ? 'text-zinc-400 line-through' : 'text-zinc-800'}`}>
                {p.name}
              </p>
              {inactive && (
                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-red-500 uppercase tracking-wider">
                  <EyeOff size={9} /> Inactive
                </span>
              )}
              {p.images?.length > 1 && !inactive && (
                <p className="text-[10px] text-zinc-400">{p.images.length} images</p>
              )}
            </div>
          </div>
        </td>
        <td className={`px-4 py-3 whitespace-nowrap ${inactive ? 'text-zinc-400' : 'text-zinc-500'}`}>
          {p.category}
        </td>
        <td className={`px-4 py-3 font-semibold whitespace-nowrap ${inactive ? 'text-zinc-400' : 'accent-text'}`}>
          ₦{parseFloat(p.price).toLocaleString()}
        </td>
        <td className="px-4 py-3">
          <span className={`text-xs font-medium ${p.quantity === 0 ? 'text-red-500' : inactive ? 'text-zinc-400' : 'text-zinc-600'}`}>
            {p.quantity === 0 ? 'Out of stock' : p.quantity}
          </span>
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-1.5">
            {!inactive && (
              <button
                onClick={() => startEdit(p)}
                className="p-1.5 rounded text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
                title="Edit"
              >
                <Pencil size={13} />
              </button>
            )}
            {/* Toggle active/inactive */}
            <button
              onClick={() => onDelete(p.id, p.is_active !== false)}
              className={`p-1.5 rounded transition-colors ${
                inactive
                  ? 'text-emerald-400 hover:text-emerald-600 hover:bg-emerald-50'
                  : 'text-zinc-400 hover:text-amber-500 hover:bg-amber-50'
              }`}
              title={inactive ? 'Reactivate product' : 'Deactivate product'}
            >
              {inactive ? <Eye size={13} /> : <EyeOff size={13} />}
            </button>
            {/* Permanent delete — only shown for inactive products */}
            {inactive && (
              <button
                onClick={() => onPermanentDelete(p.id)}
                className="p-1.5 rounded text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                title="Permanently delete"
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
        </td>
      </motion.tr>
    )
  }

  const renderMobileCard = (p, i) => {
    const img      = p.primary_image?.image || p.images?.[0]?.image
    const inactive = p.is_active === false

    return (
      <motion.div
        key={p.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.03 }}
        className={`rounded-lg border p-4 flex items-start gap-3 ${
          inactive ? 'bg-red-50/60 border-red-200' : 'bg-white border-zinc-200'
        }`}
      >
        <div className={`h-14 w-14 rounded-lg bg-zinc-100 overflow-hidden shrink-0 ${inactive ? 'grayscale opacity-60' : ''}`}>
          {img
            ? <img src={img} alt="" loading="lazy" className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center"><Package size={18} className="text-zinc-300" /></div>
          }
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 flex-wrap">
            <p className={`font-semibold truncate ${inactive ? 'text-zinc-400 line-through' : 'text-zinc-800'}`}>
              {p.name}
            </p>
            {inactive && (
              <span className="inline-flex items-center gap-1 text-[9px] font-bold text-red-500 bg-red-100 px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0">
                <EyeOff size={9} /> Inactive
              </span>
            )}
          </div>
          <p className={`text-xs mt-0.5 ${inactive ? 'text-zinc-400' : 'text-zinc-400'}`}>{p.category}</p>
          <div className="flex items-center gap-3 mt-1.5">
            <span className={`text-sm font-bold ${inactive ? 'text-zinc-400' : 'accent-text'}`}>
              ₦{parseFloat(p.price).toLocaleString()}
            </span>
            <span className={`text-xs font-medium ${p.quantity === 0 ? 'text-red-500' : 'text-zinc-500'}`}>
              {p.quantity === 0 ? 'Out of stock' : `${p.quantity} in stock`}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1 shrink-0">
          {!inactive && (
            <button
              onClick={() => startEdit(p)}
              className="p-2 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
            >
              <Pencil size={15} />
            </button>
          )}
          {/* Toggle */}
          <button
            onClick={() => onDelete(p.id, p.is_active !== false)}
            className={`p-2 rounded-lg transition-colors ${
              inactive
                ? 'text-emerald-400 hover:text-emerald-600 hover:bg-emerald-50'
                : 'text-zinc-400 hover:text-amber-500 hover:bg-amber-50'
            }`}
            title={inactive ? 'Reactivate' : 'Deactivate'}
          >
            {inactive ? <Eye size={15} /> : <EyeOff size={15} />}
          </button>
          {/* Permanent delete — inactive only */}
          {inactive && (
            <button
              onClick={() => onPermanentDelete(p.id)}
              className="p-2 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              title="Permanently delete"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      </motion.div>
    )
  }

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl text-zinc-900">Products</h2>
          <p className="text-sm text-zinc-400 mt-0.5">{products.length} total</p>
        </div>
        {!showForm && (
          <Button size="sm" onClick={() => { reset(); setShowForm(true) }} className="shrink-0">
            <Plus size={14} /> Add Product
          </Button>
        )}
      </div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <ProductForm
            form={form}
            setForm={setForm}
            editing={editing}
            editingId={editingId}
            images={images}
            setImages={setImages}
            onSubmit={handleSubmit}
            onCancel={reset}
            saving={saving}
            onSetPrimary={onSetPrimary}
            onDeleteImage={onDeleteImage}
            existingCategories={existingCategories}
          />
        )}
      </AnimatePresence>

      {/* Filters row */}
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          placeholder="Search products…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 sm:max-w-xs px-3 py-2 text-sm border border-zinc-200 rounded-lg focus-accent bg-white"
        />
        <StatusFilter
          value={statusFilter}
          onChange={v => setStatusFilter(v)}
          counts={counts}
        />
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-12 text-zinc-400 text-sm bg-white rounded-lg border border-zinc-200">
          No products match the current filter.
        </div>
      )}

      {/* Desktop table */}
      {filtered.length > 0 && (
        <div className="hidden md:block bg-white rounded-lg border border-zinc-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50">
                  {['Product', 'Category', 'Price', 'Stock', 'Actions'].map(h => (
                    <th key={h} className="text-left text-[10px] font-semibold text-zinc-400 uppercase tracking-widest px-4 py-3 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {pg.paginated.map((p, i) => renderDesktopRow(p, i))}
              </tbody>
            </table>
          </div>

          {/* Pagination bar inside the table card */}
          <div className="px-4 border-t border-zinc-100">
            <Pagination {...pg} />
          </div>
        </div>
      )}

      {/* Mobile cards */}
      {filtered.length > 0 && (
        <div className="md:hidden space-y-3">
          {pg.paginated.map((p, i) => renderMobileCard(p, i))}
          <Pagination {...pg} />
        </div>
      )}
    </div>
  )
}