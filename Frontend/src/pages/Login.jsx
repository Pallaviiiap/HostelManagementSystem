import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const normalizedEmail = email.trim().toLowerCase()

    if (!normalizedEmail || !password) {
      setError('Email and password are required.')
      return
    }

    try {
      setLoading(true)
      const response = await api.post('/api/auth/login', { email: normalizedEmail, password })
      const { token, role } = response.data

      if (!token || !role) {
        throw new Error('Invalid response from server.')
      }

      localStorage.setItem('token', token)
      localStorage.setItem('role', role)

      if (role === 'student') {
        navigate('/student')
      } else if (role === 'admin') {
        navigate('/admin')
      } else {
        navigate('/login')
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Login failed. Please try again.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-container">
      <div className="card">
        <h1 className="page-title">Login</h1>
        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Login'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login

