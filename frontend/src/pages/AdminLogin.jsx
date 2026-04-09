import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Package2, Eye, EyeOff } from 'lucide-react'

import { verifyAdmin } from '../api/admin'
import { getSiteSettings } from '../api/settings'
import { useTheme } from '../context/ThemeContext'

import Button from '../components/ui/Button'

export default function AdminLogin({ onLogin }) {
  const [token, setToken]     = useState('')
  const [error, setError]     = useState('')
  const [show, setShow]       = useState(false)
  const [loading, setLoading] = useState(false)

  const [siteName, setSiteName] = useState('MicroShop') // fallback so your UI isn’t empty

  const { setAccent } = useTheme()

  // ── Load site settings ───────────────────────────────────────────────
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await getSiteSettings()
        const data = res.data

        if (data?.main_color) {
          setAccent(data.main_color)
        }

        if (data?.site_title) {
          setSiteName(data.site_title)
        }
      } catch (e) {
        console.error('Failed to load site settings')
      }
    }

    loadSettings()
  }, [setAccent])

  // ── Submit ──────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const r = await verifyAdmin(token)

      if (r.data.valid) {
        onLogin(token)
      } else {
        setError(r.data.message || 'Invalid token.')
      }
    } catch (e) {
      setError(e.message || 'Invalid token.')
    } finally {
      setLoading(false)
    }
  }

  // ── UI ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-stone-50 font-sans flex items-center justify-center px-4">

      {/* Accent bar */}
      <div className="fixed left-0 top-0 bottom-0 w-[3px] accent-bg opacity-70" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        {/* Logo / Brand */}
        <div className="flex items-center gap-2.5 mb-8">
          <div className="h-9 w-9 rounded-lg accent-bg flex items-center justify-center">
            <Package2 size={16} className="text-white" />
          </div>
          <span className="font-serif text-xl text-zinc-900">
            {siteName} Admin
          </span>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6">
          <h2 className="font-serif text-lg text-zinc-900 mb-1">
            Sign in
          </h2>
          <p className="text-sm text-zinc-400 mb-5">
            Enter your admin token to continue.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Token */}
            <div>
              <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-1">
                Token
              </label>

              <div className="relative">
                <input
                  type={show ? 'text' : 'password'}
                  value={token}
                  onChange={e => setToken(e.target.value)}
                  placeholder="Paste your admin token"
                  required
                  className="w-full px-3 py-2 pr-10 border border-zinc-200 rounded-lg text-sm focus-accent"
                />

                <button
                  type="button"
                  onClick={() => setShow(v => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  {show ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-sm text-red-500">
                {error}
              </p>
            )}

            {/* Submit */}
            <Button type="submit" className="w-full" loading={loading}>
              Sign In
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-zinc-400 mt-5">
          Tokens are created via the Django admin panel.
        </p>
      </motion.div>
    </div>
  )
}