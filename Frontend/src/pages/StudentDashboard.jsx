import { useEffect, useState } from 'react'
import api from '../services/api'

const formatCreatedAt = (complaint) => {
  const raw = complaint.created_at || complaint.createdAt || complaint.created_at_utc || complaint.created
  if (!raw) return '-'
  const date = raw instanceof Date ? raw : new Date(raw)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleString()
}

const decodeJwtPayload = (token) => {
  try {
    const payloadPart = token.split('.')[1]
    if (!payloadPart) return null
    const normalized = payloadPart.replace(/-/g, '+').replace(/_/g, '/')
    const json = atob(normalized)
    return JSON.parse(json)
  } catch {
    return null
  }
}

const initialFormState = {
  category: '',
  description: '',
  priority: 'medium',
}

const StudentDashboard = () => {
  const [form, setForm] = useState(initialFormState)
  const [submitting, setSubmitting] = useState(false)
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadComplaints = async () => {
    try {
      setLoading(true)
      setError('')

      try {
        const response = await api.get('/api/complaints/my')
        setComplaints(response.data || [])
        return
      } catch (err) {
        if (err.response?.status !== 404) throw err
      }

      const token = localStorage.getItem('token')
      const payload = token ? decodeJwtPayload(token) : null
      const userId = payload?.id
      const response = await api.get('/api/complaints')
      const all = response.data || []

      if (!userId) {
        setComplaints([])
        setError('Unable to determine user identity. Please login again.')
        return
      }

      const mine = all.filter((c) => c.user_id === userId || c.userId === userId)
      setComplaints(mine)
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to load complaints.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadComplaints()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!form.category || !form.description) {
      setError('Category and description are required.')
      return
    }

    try {
      setSubmitting(true)
      await api.post('/api/complaints', form)
      setSuccess('Complaint submitted successfully.')
      setForm(initialFormState)
      await loadComplaints()
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to submit complaint.'
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  const renderStatusBadge = (status) => {
    const normalized = (status || '').toLowerCase()
    let className = 'status-badge'
    if (normalized === 'resolved') className += ' status-resolved'
    else if (normalized === 'inprogress' || normalized === 'in-progress' || normalized === 'in progress')
      className += ' status-in-progress'
    else className += ' status-pending'

    return <span className={className}>{status || 'Pending'}</span>
  }

  return (
    <div className="page-container">
      <div className="card">
        <div className="dashboard-header">
          <h1 className="page-title">Student Dashboard</h1>
          <p className="page-subtitle">Submit and track your hostel complaints.</p>
        </div>

        <section className="section">
          <h2 className="section-title">Submit Complaint</h2>
          <form onSubmit={handleSubmit} className="form">
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <input
                id="category"
                name="category"
                type="text"
                value={form.category}
                onChange={handleChange}
                placeholder="e.g. Mess, Room, WiFi"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={form.description}
                onChange={handleChange}
                placeholder="Describe the issue in detail"
              />
            </div>

            <div className="form-group">
              <label htmlFor="priority">Priority</label>
              <select
                id="priority"
                name="priority"
                value={form.priority}
                onChange={handleChange}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? <span className="spinner" /> : 'Submit Complaint'}
            </button>
          </form>
        </section>

        <section className="section">
          <h2 className="section-title">My Complaints</h2>
          {loading ? (
            <div className="spinner-container">
              <span className="spinner" />
            </div>
          ) : complaints.length === 0 ? (
            <p className="empty-state">You have not submitted any complaints yet.</p>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Description</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.map((complaint) => (
                    <tr key={complaint.id || complaint._id}>
                      <td>{complaint.category}</td>
                      <td>{complaint.description}</td>
                      <td>
                        <span
                          className={`priority-badge priority-${(complaint.priority || 'low').toLowerCase()}`}
                        >
                          {(complaint.priority || '').charAt(0).toUpperCase() +
                            (complaint.priority || '').slice(1)}
                        </span>
                      </td>
                      <td>{renderStatusBadge(complaint.status)}</td>
                      <td>{formatCreatedAt(complaint)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default StudentDashboard

