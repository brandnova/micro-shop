import { useMemo } from 'react'
import {
  ShoppingBag, Clock, TrendingUp, CheckCircle2,
  Truck, XCircle, Package, CreditCard,
} from 'lucide-react'
import StatsCard from './StatsCard'
import Badge from '../ui/Badge'


function StatusDot({ status }) {
  const c = {
    pending: 'bg-amber-400', payment_uploaded: 'bg-blue-400',
    payment_confirmed: 'bg-violet-400', processing: 'bg-indigo-400',
    shipped: 'bg-cyan-400', delivered: 'bg-emerald-400', cancelled: 'bg-red-400',
  }
  return <span className={`h-2 w-2 rounded-full shrink-0 ${c[status] || 'bg-zinc-300'}`} />
}

export default function DashboardHome({ orders }) {
  const s = useMemo(() => {
    const total       = orders.length
    const pending     = orders.filter(o => o.status === 'pending').length
    const uploaded    = orders.filter(o => o.status === 'payment_uploaded').length
    const confirmed   = orders.filter(o => o.status === 'payment_confirmed').length
    const processing  = orders.filter(o => o.status === 'processing').length
    const shipped     = orders.filter(o => o.status === 'shipped').length
    const delivered   = orders.filter(o => o.status === 'delivered').length
    const cancelled   = orders.filter(o => o.status === 'cancelled').length
    const revenue     = orders
      .filter(o => ['payment_confirmed','processing','shipped','delivered'].includes(o.status))
      .reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0)
    return { total, pending, uploaded, confirmed, processing, shipped, delivered, cancelled, revenue, awaiting: pending + uploaded }
  }, [orders])

  const cards = [
    { label: 'Total Orders',      value: s.total,     icon: ShoppingBag,  color: 'accent',  sub: 'All time',                           delay: 0    },
    { label: 'Awaiting Action',   value: s.awaiting,  icon: Clock,        color: 'amber',   sub: `${s.pending} pending · ${s.uploaded} proof`,  delay: 0.04 },
    { label: 'Confirmed Revenue', value: `₦${s.revenue.toLocaleString()}`, icon: TrendingUp, color: 'emerald', sub: 'Confirmed + in transit', delay: 0.08 },
    { label: 'Delivered',         value: s.delivered, icon: CheckCircle2, color: 'emerald', sub: 'Completed orders',                    delay: 0.12 },
    { label: 'Shipped',           value: s.shipped,   icon: Truck,        color: 'blue',    sub: 'In transit',                         delay: 0.16 },
    { label: 'Processing',        value: s.processing,icon: Package,      color: 'violet',  sub: 'Being prepared',                     delay: 0.20 },
    { label: 'Payment Confirmed', value: s.confirmed, icon: CreditCard,   color: 'violet',  sub: 'Awaiting dispatch',                  delay: 0.24 },
    { label: 'Cancelled',         value: s.cancelled, icon: XCircle,      color: 'red',     sub: s.cancelled > 0 ? 'Review if unexpected' : 'None', delay: 0.28 },
  ]

  const recent = [...orders]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl text-zinc-900">Overview</h2>
        <p className="text-sm text-zinc-400 mt-0.5">At-a-glance summary of your store.</p>
      </div>

      {/* Stats grid — 2 cols on mobile, 4 on desktop */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {cards.map(card => <StatsCard key={card.label} {...card} />)}
      </div>

      {/* Recent orders */}
      {recent.length > 0 && (
        <div className="bg-white rounded-lg border border-zinc-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-100 flex items-center justify-between">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Recent Orders</p>
            <span className="text-xs text-zinc-400">{orders.length} total</span>
          </div>
          <div className="divide-y divide-zinc-100">
            {recent.map(o => (
              <div key={o.id} className="px-4 py-3 flex items-center gap-3 min-w-0">
                <StatusDot status={o.status} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-800 truncate">{o.name}</p>
                  <p className="text-[10px] text-zinc-400 font-mono mt-0.5 truncate">{o.tracking_code}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold accent-text">₦{parseFloat(o.total_amount).toLocaleString()}</p>
                  <Badge status={o.status} className="mt-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}