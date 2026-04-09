import { useState, useEffect } from 'react'
import { getSiteSettings } from '../api/settings'
import { useTheme } from '../context/ThemeContext'

export function useSiteSettings() {
  const { setAccent } = useTheme()
  const [settings, setSettings] = useState({
    site_title: 'MicroShop',
    store_tag: 'Quality products, delivered.',
    contact_email: '',
    contact_number: '',
    main_color: '#6366f1',
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSiteSettings()
      .then((res) => {
        setSettings(res.data)
        if (res.data.main_color) setAccent(res.data.main_color)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return { settings, loading }
}