import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  // In production builds, assets are served from Django's static folder.
  // In development, use root so Vite's dev server works normally.
  base: mode === 'production' ? '/static/frontend/' : '/',
}))