import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { verifyAdmin } from './api/admin'
import HomePage from './pages/HomePage'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'

function AdminRoute({ children }) {
  const [state, setState] = useState('loading')

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) { setState('unauth'); return }
    verifyAdmin(token)
      .then(r => setState(r.data.valid ? 'auth' : 'unauth'))
      .catch(() => setState('unauth'))
  }, [])

  if (state === 'loading') return null
  if (state === 'unauth') {
    return (
      <AdminLogin onLogin={(token) => {
        localStorage.setItem('adminToken', token)
        setState('auth')
      }} />
    )
  }
  return children
}

export default function App() {
  return (
    <ThemeProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        {/* /store-admin avoids collision with Django's /django-admin/ */}
        <Route path="/store-admin" element={
          <AdminRoute><AdminDashboard /></AdminRoute>
        } />
      </Routes>
    </ThemeProvider>
  )
}