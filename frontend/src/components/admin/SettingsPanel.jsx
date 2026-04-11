import { useState, useEffect } from 'react'
import { SketchPicker } from 'react-color'
import { Palette } from 'lucide-react'
import Button from '../ui/Button'

export default function SettingsPanel({ settings, onSave }) {
  const [form, setForm]             = useState(settings)
  const [saving, setSaving]         = useState(false)
  const [showPicker, setShowPicker] = useState(false)
  const [saved, setSaved]           = useState(false)

  useEffect(() => { setForm(settings) }, [settings])

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave(form)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } finally {
      setSaving(false)
    }
  }

  const fields = [
    { key: 'site_title',       label: 'Store Name',             type: 'text',  ph: 'My Store'            },
    { key: 'store_tag',        label: 'Tagline',                type: 'text',  ph: 'Quality products…'   },
    { key: 'contact_email',    label: 'Contact Email',          type: 'email', ph: 'support@example.com' },
    { key: 'contact_number',   label: 'Phone Number',           type: 'tel',   ph: '080XXXXXXXX'         },
    { key: 'delivery_methods', label: 'Delivery Methods',       type: 'text',  ph: 'Pickup, Home Delivery' },
    { key: 'delivery_time',    label: 'Estimated Delivery Time',type: 'text',  ph: '2–5 business days'   },
    { key: 'delivery_note',    label: 'Delivery Note (optional)',type: 'text', ph: 'e.g. Call before delivery' },
  ]

  return (
    <div className="max-w-xl mx-auto space-y-5">
      <div className="text-center sm:text-left">
        <h2 className="font-serif text-2xl text-zinc-900">Site Settings</h2>
        <p className="text-sm text-zinc-400 mt-0.5">Controls what customers see on your storefront.</p>
      </div>

      <div className="bg-white rounded-lg border border-zinc-200 p-5 sm:p-6 space-y-5">
        {fields.map(({ key, label, type, ph }) => (
          <div key={key}>
            <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-1.5">
              {label}
            </label>
            <input
              type={type}
              placeholder={ph}
              value={form[key] || ''}
              onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
              className="w-full px-3 py-2.5 border border-zinc-200 rounded-lg text-sm focus-accent bg-white"
            />
          </div>
        ))}

        {/* Accent color */}
        <div>
          <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-1.5">
            Accent Color
          </label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowPicker(v => !v)}
              className="h-10 w-20 rounded-lg border-2 border-zinc-200 shadow-sm transition-all hover:border-zinc-300 hover:scale-105 flex items-center justify-center relative overflow-hidden"
              style={{ background: form.main_color }}
            >
              <Palette size={14} className="text-white drop-shadow-sm" />
            </button>
            <code className="text-sm text-zinc-600 bg-zinc-50 border border-zinc-200 px-2.5 py-1 rounded">
              {form.main_color || '#6366f1'}
            </code>
          </div>

          {showPicker && (
            <div className="mt-3 relative">
              <div className="fixed inset-0 z-10" onClick={() => setShowPicker(false)} />
              <div className="relative z-20 inline-block shadow-xl rounded-lg overflow-hidden border border-zinc-200">
                <SketchPicker
                  color={form.main_color}
                  onChangeComplete={c => setForm(p => ({ ...p, main_color: c.hex }))}
                />
              </div>
            </div>
          )}
        </div>

        <div className="pt-2 flex items-center gap-3">
          <Button loading={saving} onClick={handleSave} className="w-full sm:w-auto">
            {saving ? 'Saving…' : 'Save Settings'}
          </Button>
          {saved && (
            <span className="text-sm text-emerald-600 font-medium">✓ Saved</span>
          )}
        </div>
      </div>
    </div>
  )
}