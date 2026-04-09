import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, XCircle, Info, X } from 'lucide-react'

const cfg = {
  success: { icon: CheckCircle2, cls: 'text-emerald-500' },
  error:   { icon: XCircle,      cls: 'text-red-500'     },
  info:    { icon: Info,         cls: 'text-blue-500'    },
}

export default function ToastContainer({ toasts, onDismiss }) {
  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 pointer-events-none min-w-[280px] max-w-sm">
      <AnimatePresence>
        {toasts.map((t) => {
          const { icon: Icon, cls } = cfg[t.type] || cfg.info
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 40, scale: 0.94 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.94 }}
              className="pointer-events-auto flex items-start gap-3 bg-white border border-zinc-200 rounded-lg shadow-lg px-4 py-3"
            >
              <Icon size={16} className={`${cls} shrink-0 mt-0.5`} />
              <p className="flex-1 text-sm text-zinc-700 leading-snug">{t.message}</p>
              <button onClick={() => onDismiss(t.id)} className="text-zinc-300 hover:text-zinc-500 transition-colors">
                <X size={14} />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}