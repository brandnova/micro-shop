import { motion } from 'framer-motion'
import { Search, ShoppingCart, CreditCard, Truck } from 'lucide-react'
import Modal from '../ui/Modal'

const STEPS = [
  { icon: Search,       n: '01', title: 'Browse',       desc: 'Explore the catalogue and add items to your cart.' },
  { icon: ShoppingCart, n: '02', title: 'Checkout',      desc: 'Fill in your details. You\'ll get a tracking code by email instantly.' },
  { icon: CreditCard,   n: '03', title: 'Pay',           desc: 'Transfer to the bank account shown, then upload your proof of payment.' },
  { icon: Truck,        n: '04', title: 'Receive',       desc: 'We confirm payment and dispatch your order to your door.' },
]

export default function HowItWorksModal({ isOpen, onClose }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="How it Works" size="sm">
      <div className="space-y-5 pb-1">
        {STEPS.map(({ icon: Icon, n, title, desc }, i) => (
          <motion.div
            key={n}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07 }}
            className="flex gap-4 items-start"
          >
            <div className="relative shrink-0">
              <div className="h-10 w-10 rounded-lg accent-light-bg flex items-center justify-center accent-text">
                <Icon size={18} />
              </div>
              <span className="absolute -top-1.5 -right-1.5 text-[9px] font-bold accent-bg text-white rounded px-1 leading-tight">
                {n}
              </span>
            </div>
            <div>
              <p className="font-semibold text-zinc-800 text-sm">{title}</p>
              <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </Modal>
  )
}