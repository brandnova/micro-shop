import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ExternalLink, X } from 'lucide-react'
import { usePagination } from '../../hooks/usePagination'
import Pagination from './Pagination'
import Badge from '../ui/Badge'
import Button from '../ui/Button'

const STATUSES = [
  'pending','payment_uploaded','payment_confirmed',
  'processing','shipped','delivered','cancelled'
]

function ConfirmDialog({ pending, onConfirm, onCancel }) {
  return (
    <AnimatePresence>
      {pending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl border border-zinc-200 shadow-2xl p-6 max-w-sm w-full"
          >
            <h3 className="font-serif text-lg text-zinc-900 mb-1">Confirm Update</h3>
            <p className="text-sm text-zinc-500 mb-5">
              Change status to{' '}
              <span className="font-semibold text-zinc-800 capitalize">
                {pending.status.replace(/_/g, ' ')}
              </span>
              ? The customer will be notified by email.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={onCancel}>Cancel</Button>
              <Button size="sm" onClick={onConfirm}>Confirm</Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default function OrdersTable({ orders, onStatusUpdate, onViewProof }) {
  const [search, setSearch]   = useState('')
  const [filter, setFilter]   = useState('all')
  const [confirm, setConfirm] = useState(null)

  const filtered = orders.filter(o => {
    const q = search.toLowerCase()
    const matchSearch = (
      o.name.toLowerCase().includes(q) ||
      o.email.toLowerCase().includes(q) ||
      o.tracking_code.toLowerCase().includes(q)
    )
    return matchSearch && (filter === 'all' || o.status === filter)
  })

  const pg = usePagination(filtered, 15)  // 15 orders per page

  // Reset to page 1 when filters change
  useEffect(() => { pg.reset() }, [search, filter])

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-serif text-2xl text-zinc-900">Orders</h2>
        <p className="text-sm text-zinc-400 mt-0.5">{orders.length} total orders</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          placeholder="Search name, email, tracking code…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 px-3 py-2 text-sm border border-zinc-200 rounded-lg focus-accent bg-white"
        />
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-zinc-200 rounded-lg focus-accent bg-white sm:w-48"
        >
          <option value="all">All statuses</option>
          {STATUSES.map(s => (
            <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
          ))}
        </select>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-white rounded-lg border border-zinc-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50">
                {['Customer', 'Tracking', 'Amount', 'Status', 'Date', 'Actions'].map(h => (
                  <th key={h} className="text-left text-[10px] font-semibold text-zinc-400 uppercase tracking-widest px-4 py-3 whitespace-nowrap">
                    {h}
                  </th>
                ))}
               </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-zinc-400 text-sm">No orders found.</td>
                </tr>
              ) : pg.paginated.map((o, i) => (
                <motion.tr
                  key={o.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.025 }}
                  className="hover:bg-zinc-50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-zinc-800 truncate max-w-[140px]">{o.name}</p>
                    <p className="text-xs text-zinc-400 truncate max-w-[140px]">{o.email}</p>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-zinc-500 whitespace-nowrap">{o.tracking_code}</td>
                  <td className="px-4 py-3 font-semibold accent-text whitespace-nowrap">
                    ₦{parseFloat(o.total_amount).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={o.status}
                      onChange={e => setConfirm({ id: o.id, status: e.target.value })}
                      className="text-xs border border-zinc-200 rounded-lg px-2 py-1.5 bg-white focus-accent cursor-pointer"
                    >
                      {STATUSES.map(s => (
                        <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-400 whitespace-nowrap">
                    {new Date(o.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    {o.payment_proof && (
                      <button
                        onClick={() => onViewProof(o.payment_proof)}
                        className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1 transition-colors whitespace-nowrap"
                      >
                        <ExternalLink size={12} /> View Proof
                      </button>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 border-t border-zinc-100">
          <Pagination {...pg} />
        </div>
      </div>

      {/* Mobile card list */}
      <div className="md:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-zinc-400 text-sm bg-white rounded-lg border border-zinc-200">
            No orders found.
          </div>
        ) : pg.paginated.map((o, i) => (
          <motion.div
            key={o.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="bg-white rounded-lg border border-zinc-200 p-4 space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-semibold text-zinc-800 truncate">{o.name}</p>
                <p className="text-xs text-zinc-400 truncate">{o.email}</p>
              </div>
              <p className="font-bold accent-text shrink-0 text-sm">₦{parseFloat(o.total_amount).toLocaleString()}</p>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-zinc-500">{o.tracking_code}</span>
              <span className="text-zinc-400">{new Date(o.created_at).toLocaleDateString()}</span>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={o.status}
                onChange={e => setConfirm({ id: o.id, status: e.target.value })}
                className="flex-1 text-xs border border-zinc-200 rounded-lg px-2 py-2 bg-zinc-50 focus-accent cursor-pointer"
              >
                {STATUSES.map(s => (
                  <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                ))}
              </select>
              {o.payment_proof && (
                <button
                  onClick={() => onViewProof(o.payment_proof)}
                  className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 px-2 py-2 border border-zinc-200 rounded-lg bg-zinc-50 whitespace-nowrap"
                >
                  <ExternalLink size={12} /> Proof
                </button>
              )}
            </div>
          </motion.div>
        ))}
        <Pagination {...pg} />
      </div>

      <ConfirmDialog
        pending={confirm}
        onConfirm={() => { onStatusUpdate(confirm.id, confirm.status); setConfirm(null) }}
        onCancel={() => setConfirm(null)}
      />
    </div>
  )
}