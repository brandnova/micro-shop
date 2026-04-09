import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Package, ShoppingBag, CreditCard,
  Settings, LogOut, Package2, X, ExternalLink
} from 'lucide-react'

const NAV = [
  { id: 'overview',  label: 'Overview',      icon: LayoutDashboard },
  { id: 'products',  label: 'Products',      icon: Package         },
  { id: 'orders',    label: 'Orders',        icon: ShoppingBag     },
  { id: 'bank',      label: 'Bank Details',  icon: CreditCard      },
  { id: 'settings',  label: 'Site Settings', icon: Settings        },
]

export default function Sidebar({ active, setActive, isOpen, onClose, onLogout }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={onClose}
          />

          {/* Drawer — overlay on all screen sizes */}
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', stiffness: 340, damping: 32 }}
            className="fixed left-0 top-0 bottom-0 z-50 w-56 flex flex-col bg-zinc-900 text-zinc-400 shadow-2xl"
          >
            {/* Header */}
            <div className="h-14 flex items-center justify-between px-4 border-b border-zinc-800 shrink-0">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-md accent-bg flex items-center justify-center shrink-0">
                  <Package2 size={14} className="text-white" />
                </div>
                <span className="font-serif text-white text-sm">MicroShop</span>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 py-3 space-y-0.5 px-2 overflow-y-auto">
              {NAV.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => { setActive(id); onClose() }}
                  className={`
                    w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left
                    ${active === id
                      ? 'accent-bg text-white'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}
                  `}
                >
                  <Icon size={16} className="shrink-0" />
                  <span>{label}</span>
                </button>
              ))}
            </nav>

            {/* Footer */}
            <div className="px-2 py-3 border-t border-zinc-800 shrink-0">
              
              <a href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all mb-0.5"
              >
                <ExternalLink size={16} className="shrink-0" />
                <span>View Store</span>
              </a>
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-400 hover:text-red-400 hover:bg-zinc-800 transition-all"
              >
                <LogOut size={16} className="shrink-0" />
                <span>Logout</span>
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}