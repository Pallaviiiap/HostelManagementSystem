import axios from 'axios'

// In local dev (Vite on 5173), call backend on :5000 directly.
// In Docker/production behind Nginx, use same-origin /api.
const isDevOnVite = typeof window !== 'undefined' && window.location.port === '5173'
const baseURL = isDevOnVite ? 'http://localhost:5000' : ''

const api = axios.create({
  baseURL,
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers = config.headers || {}
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    if (status === 401 || status === 403) {
      localStorage.removeItem('token')
      localStorage.removeItem('role')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)

export default api

