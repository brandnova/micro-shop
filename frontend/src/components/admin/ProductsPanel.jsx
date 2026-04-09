import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, Package, X, Image as ImageIcon } from 'lucide-react'
import Button from '../ui/Button'

const EMPTY = { name: '', category: '', description: '', price: '', quantity: 0 }

function ProductForm({ form, setForm, editing, editingId, images, setImages, onSubmit, onCancel, saving, onSetPrimary, onDeleteImage }) {
  const [imageActionLoading, setImageActionLoading] = useState(null) // imageId being acted on

  const handleSetPrimary = async (imageId) => {
    if (!editingId) return
    setImageActionLoading(imageId)
    try {
      await onSetPrimary(editingId, imageId)
    } finally {
      setImageActionLoading(null)
    }
  }

  const handleDeleteImage = async (imageId) => {
    if (!editingId) return
    setImageActionLoading(imageId)
    try {
      await onDeleteImage(editingId, imageId)
    } finally {
      setImageActionLoading(null)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="bg-white rounded-lg border border-zinc-200 p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-zinc-800 text-sm">{editing ? 'Edit Product' : 'New Product'}</h3>
        <button onClick={onCancel} className="p-1 rounded text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100">
          <X size={15} />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { key: 'name',     label: 'Name',      type: 'text',   ph: 'Product name',  span: 2 },
          { key: 'category', label: 'Category',  type: 'text',   ph: 'e.g. Clothing', span: 2 },
          { key: 'price',    label: 'Price (₦)', type: 'number', ph: '0.00',          span: 1 },
          { key: 'quantity', label: 'Stock',     type: 'number', ph: '0',             span: 1 },
        ].map(({ key, label, type, ph, span }) => (
          <div key={key} className={span === 2 ? 'sm:col-span-2' : ''}>
            <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-1">{label}</label>
            <input
              type={type}
              placeholder={ph}
              value={form[key]}
              onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus-accent bg-white"
            />
          </div>
        ))}

        <div className="sm:col-span-2">
          <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-1">Description</label>
          <textarea
            placeholder="Product description…"
            value={form.description}
            onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus-accent bg-white resize-none"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-1">
            {editing ? 'Upload More Images' : 'Images'}
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

      {/* Current images — edit mode only */}
      {editing && editing.images?.length > 0 && (
        <div className="mt-5 pt-4 border-t border-zinc-100">
          <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-3">
            Current Images
            <span className="ml-2 font-normal normal-case text-zinc-400">
              — click ★ to set primary, ✕ to delete
            </span>
          </p>
          <div className="flex gap-2 flex-wrap">
            {editing.images.map(img => {
              const isLoading = imageActionLoading === img.id
              return (
                <div key={img.id} className="relative group">
                  {/* Thumbnail */}
                  <div className={`
                    h-20 w-20 rounded-lg overflow-hidden border-2 transition-all
                    ${img.is_primary ? 'accent-border shadow-sm' : 'border-zinc-200'}
                    ${isLoading ? 'opacity-50' : ''}
                  `}>
                    {img.image ? (
                      <img src={img.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-zinc-100 flex items-center justify-center">
                        <Package size={16} className="text-zinc-300" />
                      </div>
                    )}
                  </div>

                  {/* Primary badge */}
                  {img.is_primary && (
                    <div className="absolute -top-1.5 -right-1.5 accent-bg text-white text-[8px] font-bold px-1.5 py-0.5 rounded leading-tight">
                      PRIMARY
                    </div>
                  )}

                  {/* Loading spinner overlay */}
                  {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-white/60">
                      <svg className="animate-spin h-4 w-4 accent-text" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                    </div>
                  )}

                  {/* Action buttons — visible on hover or always on touch */}
                  {!isLoading && (
                    <div className="absolute inset-0 rounded-lg bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                      {!img.is_primary && (
                        <button
                          onClick={() => handleSetPrimary(img.id)}
                          title="Set as primary"
                          className="h-7 w-7 rounded bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition-colors text-xs font-bold"
                        >
                          ★
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteImage(img.id)}
                        title="Delete image"
                        className="h-7 w-7 rounded bg-white/20 hover:bg-red-500/70 flex items-center justify-center text-white transition-colors"
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

      <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-zinc-100">
        <Button variant="secondary" size="sm" onClick={onCancel}>Cancel</Button>
        <Button size="sm" loading={saving} onClick={onSubmit}>
          {editing ? 'Save Changes' : 'Add Product'}
        </Button>
      </div>
    </motion.div>
  )
}

export default function ProductsPanel({
  products, onAdd, onUpdate, onDelete,
  onUploadImages, onDeleteImage, onSetPrimary
}) {
  const [form, setForm]         = useState(EMPTY)
  const [editingId, setEditingId] = useState(null)  // store ID, not object
  const [images, setImages]     = useState([])
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving]     = useState(false)
  const [search, setSearch]     = useState('')

  // Derive editing object live from products prop
  // This means when onSetPrimary/onDeleteImage triggers a load() in the parent,
  // the editing object here automatically reflects the updated images list
  const editing = editingId ? (products.find(p => p.id === editingId) ?? null) : null

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  )

  const startEdit = (p) => {
    setEditingId(p.id)
    setForm({ name: p.name, category: p.category, description: p.description, price: p.price, quantity: p.quantity })
    setImages([])
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const reset = () => {
    setForm(EMPTY)
    setEditingId(null)
    setImages([])
    setShowForm(false)
  }

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

  return (
    <div className="space-y-5">
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
          />
        )}
      </AnimatePresence>

      <input
        type="text"
        placeholder="Search products…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full sm:max-w-xs px-3 py-2 text-sm border border-zinc-200 rounded-lg focus-accent bg-white"
      />

      {/* Desktop table */}
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
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-zinc-400 text-sm">No products found.</td>
                </tr>
              ) : filtered.map((p, i) => {
                const img = p.primary_image?.image || p.images?.[0]?.image
                return (
                  <motion.tr
                    key={p.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.025 }}
                    className="hover:bg-zinc-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded bg-zinc-100 overflow-hidden shrink-0">
                          {img
                            ? <img src={img} alt="" className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center"><Package size={14} className="text-zinc-300" /></div>
                          }
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-zinc-800 truncate max-w-[160px]">{p.name}</p>
                          {p.images?.length > 1 && (
                            <p className="text-[10px] text-zinc-400">{p.images.length} images</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-zinc-500 whitespace-nowrap">{p.category}</td>
                    <td className="px-4 py-3 font-semibold accent-text whitespace-nowrap">₦{parseFloat(p.price).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium ${p.quantity === 0 ? 'text-red-500' : 'text-zinc-600'}`}>
                        {p.quantity === 0 ? 'Out of stock' : p.quantity}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => startEdit(p)} className="p-1.5 rounded text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => onDelete(p.id)} className="p-1.5 rounded text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-zinc-400 text-sm bg-white rounded-lg border border-zinc-200">
            No products found.
          </div>
        ) : filtered.map((p, i) => {
          const img = p.primary_image?.image || p.images?.[0]?.image
          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-white rounded-lg border border-zinc-200 p-4 flex items-start gap-3"
            >
              <div className="h-14 w-14 rounded-lg bg-zinc-100 overflow-hidden shrink-0">
                {img
                  ? <img src={img} alt="" className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center"><Package size={18} className="text-zinc-300" /></div>
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-zinc-800 truncate">{p.name}</p>
                <p className="text-xs text-zinc-400 mt-0.5">{p.category}</p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-sm font-bold accent-text">₦{parseFloat(p.price).toLocaleString()}</span>
                  <span className={`text-xs font-medium ${p.quantity === 0 ? 'text-red-500' : 'text-zinc-500'}`}>
                    {p.quantity === 0 ? 'Out of stock' : `${p.quantity} in stock`}
                  </span>
                </div>
                {p.images?.length > 1 && (
                  <p className="text-[10px] text-zinc-400 mt-0.5">{p.images.length} images</p>
                )}
              </div>
              <div className="flex flex-col gap-1 shrink-0">
                <button onClick={() => startEdit(p)} className="p-2 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors">
                  <Pencil size={15} />
                </button>
                <button onClick={() => onDelete(p.id)} className="p-2 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                  <Trash2 size={15} />
                </button>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}