import { createContext, useContext, useEffect, useState } from 'react'

// Converts a hex color to RGB components for CSS variable use
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}`
    : '99 102 241'
}

// Lightens a hex color by mixing with white
function lightenHex(hex, amount = 0.9) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return '#f5f3ff'
  const r = Math.round(parseInt(result[1], 16) + (255 - parseInt(result[1], 16)) * amount)
  const g = Math.round(parseInt(result[2], 16) + (255 - parseInt(result[2], 16)) * amount)
  const b = Math.round(parseInt(result[3], 16) + (255 - parseInt(result[3], 16)) * amount)
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

const ThemeContext = createContext(null)

export function ThemeProvider({ children, accentColor = '#6366f1' }) {
  const [accent, setAccent] = useState(accentColor)

  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--color-accent', accent)
    root.style.setProperty('--color-accent-light', lightenHex(accent, 0.88))
    root.style.setProperty('--color-accent-muted', lightenHex(accent, 0.3))
    root.style.setProperty('--color-accent-rgb', hexToRgb(accent))
  }, [accent])

  return (
    <ThemeContext.Provider value={{ accent, setAccent }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)