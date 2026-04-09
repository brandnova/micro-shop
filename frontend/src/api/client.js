import axios from 'axios'

// Read Django's CSRF cookie
function getCsrfToken() {
  const match = document.cookie.match(/csrftoken=([^;]+)/)
  return match ? match[1] : ''
}

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  timeout: 15000,
})

// Attach CSRF token to every mutating request
client.interceptors.request.use((config) => {
  const mutating = ['post', 'put', 'patch', 'delete']
  if (mutating.includes(config.method?.toLowerCase())) {
    config.headers['X-CSRFToken'] = getCsrfToken()
  }
  return config
})

// Normalize error messages
client.interceptors.response.use(
  (res) => res,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.response?.data?.detail ||
      error.message ||
      'Something went wrong.'
    return Promise.reject(new Error(message))
  }
)

export default client