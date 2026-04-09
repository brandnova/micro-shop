const cfg = {
  pending:           { label: 'Pending',           cls: 'bg-amber-50   text-amber-700   border-amber-200'   },
  payment_uploaded:  { label: 'Payment Uploaded',  cls: 'bg-blue-50    text-blue-700    border-blue-200'    },
  payment_confirmed: { label: 'Payment Confirmed', cls: 'bg-violet-50  text-violet-700  border-violet-200'  },
  processing:        { label: 'Processing',        cls: 'bg-indigo-50  text-indigo-700  border-indigo-200'  },
  shipped:           { label: 'Shipped',           cls: 'bg-cyan-50    text-cyan-700    border-cyan-200'    },
  delivered:         { label: 'Delivered',         cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  cancelled:         { label: 'Cancelled',         cls: 'bg-red-50     text-red-700     border-red-200'     },
}

export default function Badge({ status, className = '' }) {
  const { label, cls } = cfg[status] || { label: status, cls: 'bg-zinc-100 text-zinc-600 border-zinc-200' }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border font-sans ${cls} ${className}`}>
      {label}
    </span>
  )
}