import { motion } from 'framer-motion'

function StatsCard({ label, value, sub, icon: Icon, color = 'accent', delay = 0 }) {
  const colorMap = {
    accent:  'accent-light-bg accent-text',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber:   'bg-amber-50   text-amber-600',
    blue:    'bg-blue-50    text-blue-600',
    red:     'bg-red-50     text-red-500',
    violet:  'bg-violet-50  text-violet-600',
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white rounded-lg border border-zinc-200 p-3 sm:p-4 flex flex-col gap-2"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-[9px] sm:text-[10px] font-semibold text-zinc-400 uppercase tracking-widest leading-tight line-clamp-2">
          {label}
        </p>
        <div className={`h-7 w-7 sm:h-8 sm:w-8 rounded-lg flex items-center justify-center shrink-0 ${colorMap[color]}`}>
          <Icon size={14} />
        </div>
      </div>
      <p className="text-xl sm:text-2xl font-bold text-zinc-900 leading-none truncate">{value ?? '—'}</p>
      {sub && (
        <p className="text-[9px] sm:text-xs text-zinc-400 leading-tight line-clamp-2">{sub}</p>
      )}
    </motion.div>
  )
}

export default StatsCard;