import { CreditCard, Copy, CheckCircle } from 'lucide-react'
import { useState } from 'react'
import Modal from '../ui/Modal'

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={copy}
      className="ml-auto flex items-center gap-1 text-[10px] font-semibold text-zinc-400 hover:accent-text transition-colors px-2 py-0.5 rounded hover:accent-light-bg"
    >
      {copied ? <CheckCircle size={11} className="text-emerald-500" /> : <Copy size={11} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

export default function BankDetailsModal({ isOpen, onClose, bankDetails }) {
  const list = Array.isArray(bankDetails)
    ? bankDetails
    : bankDetails ? [bankDetails] : []

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Payment Details" size="sm">
      {list.length === 0 ? (
        <div className="text-center py-10 text-zinc-400">
          <CreditCard size={28} className="mx-auto mb-2 opacity-25" />
          <p className="text-sm">No bank details set yet.</p>
        </div>
      ) : (
        <div className="space-y-3 pb-1">
          <p className="text-xs text-zinc-500 leading-relaxed">
            Transfer your order total to the account below, then upload your payment proof using your tracking code.
          </p>
          {list.map((b, i) => (
            <div key={b.id ?? i} className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 space-y-2.5">
              <div className="flex items-start justify-between">
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">{b.bank_name}</p>
                <div className="h-7 w-7 rounded accent-light-bg flex items-center justify-center shrink-0">
                  <CreditCard size={13} className="accent-text" />
                </div>
              </div>

              <div>
                <p className="text-[10px] text-zinc-400 uppercase tracking-wide">Account Name</p>
                <p className="text-sm font-semibold text-zinc-800">{b.account_name}</p>
              </div>

              <div>
                <p className="text-[10px] text-zinc-400 uppercase tracking-wide mb-0.5">Account Number</p>
                <div className="flex items-center gap-2">
                  <p className="text-base font-mono font-bold text-zinc-900 tracking-widest">{b.account_number}</p>
                  <CopyButton text={b.account_number} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  )
}