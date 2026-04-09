import { useState } from 'react'
import { Plus, Pencil, Trash2, X, CreditCard } from 'lucide-react'
import Button from '../ui/Button'

const EMPTY = { bank_name: '', account_name: '', account_number: '' }

export default function BankPanel({ bankDetails, onAdd, onUpdate, onDelete }) {
  const [form, setForm]         = useState(EMPTY)
  const [editing, setEditing]   = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving]     = useState(false)

  const startEdit = (b) => {
    setEditing(b)
    setForm({ bank_name: b.bank_name, account_name: b.account_name, account_number: b.account_number })
    setShowForm(true)
  }

  const reset = () => { setForm(EMPTY); setEditing(null); setShowForm(false) }

  const handleSubmit = async () => {
    if (!form.bank_name || !form.account_name || !form.account_number) return
    setSaving(true)
    try {
      editing ? await onUpdate(editing.id, form) : await onAdd(form)
      reset()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl text-zinc-900">Bank Details</h2>
          <p className="text-sm text-zinc-400 mt-0.5">
            These accounts are displayed to customers when they check out or view Payment Info.
          </p>
        </div>
        <Button size="sm" onClick={() => { reset(); setShowForm(true) }} className="shrink-0">
          <Plus size={14} /> Add Account
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-lg border border-zinc-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-zinc-800 text-sm">{editing ? 'Edit Account' : 'New Bank Account'}</h3>
            <button onClick={reset} className="text-zinc-400 hover:text-zinc-600 p-1 rounded hover:bg-zinc-100">
              <X size={15} />
            </button>
          </div>
          <div className="space-y-3">
            {[
              { key: 'bank_name',      label: 'Bank Name',      ph: 'e.g. First Bank'       },
              { key: 'account_name',   label: 'Account Name',   ph: 'e.g. John Doe Store'   },
              { key: 'account_number', label: 'Account Number', ph: 'e.g. 0123456789'       },
            ].map(({ key, label, ph }) => (
              <div key={key}>
                <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-1">{label}</label>
                <input
                  type="text"
                  placeholder={ph}
                  value={form[key]}
                  onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus-accent bg-white"
                />
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="secondary" size="sm" onClick={reset}>Cancel</Button>
            <Button size="sm" loading={saving} onClick={handleSubmit}>
              {editing ? 'Save Changes' : 'Add Account'}
            </Button>
          </div>
        </div>
      )}

      {/* Bank detail cards */}
      {bankDetails.length === 0 ? (
        <div className="bg-white rounded-lg border border-dashed border-zinc-300 p-10 text-center text-zinc-400">
          <CreditCard size={28} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">No bank accounts added yet.</p>
          <p className="text-xs mt-1">Add an account above so customers know where to transfer.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {bankDetails.map(b => (
            <div key={b.id} className="bg-white rounded-lg border border-zinc-200 p-4">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="h-8 w-8 rounded-lg accent-light-bg flex items-center justify-center shrink-0">
                  <CreditCard size={15} className="accent-text" />
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => startEdit(b)}
                    className="p-1.5 rounded text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => onDelete(b.id)}
                    className="p-1.5 rounded text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">{b.bank_name}</p>
              <p className="font-semibold text-zinc-800 mt-0.5">{b.account_name}</p>
              <p className="text-lg font-mono font-bold text-zinc-900 mt-1 tracking-widest">{b.account_number}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}