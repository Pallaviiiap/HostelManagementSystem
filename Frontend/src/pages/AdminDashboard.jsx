import { useEffect, useMemo, useState } from 'react'
import api from '../services/api'

const formatCreatedAt = (complaint) => {
  const raw = complaint.created_at || complaint.createdAt || complaint.created_at_utc || complaint.created
  if (!raw) return '-'
  const date = raw instanceof Date ? raw : new Date(raw)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleString()
}

const normalizeStatus = (status) => {
  const s = String(status || '').toLowerCase().trim()
  if (s === 'inprogress' || s === 'in progress') return 'in-progress'
  return s
}

const StatusBadge = ({ status }) => {
  const normalized = normalizeStatus(status)
  const base =
    'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset whitespace-nowrap'

  if (normalized === 'resolved') {
    return (
      <span className={`${base} bg-emerald-50 text-emerald-700 ring-emerald-200`}>
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        Resolved
      </span>
    )
  }

  if (normalized === 'in-progress') {
    return (
      <span className={`${base} bg-cyan-50 text-cyan-700 ring-cyan-200`}>
        <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
        In Progress
      </span>
    )
  }

  return (
    <span className={`${base} bg-amber-50 text-amber-700 ring-amber-200`}>
      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
      Pending
    </span>
  )
}

const PriorityBadge = ({ priority }) => {
  const normalized = String(priority || '').toLowerCase().trim()
  const base =
    'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset whitespace-nowrap'

  if (normalized === 'high') {
    return (
      <span className={`${base} bg-red-50 text-red-700 ring-red-200`}>
        <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" aria-hidden="true">
          <path
            fill="currentColor"
            d="M10 2a1 1 0 0 1 .894.553l7 14A1 1 0 0 1 17 18H3a1 1 0 0 1-.894-1.447l7-14A1 1 0 0 1 10 2Zm0 5a1 1 0 0 0-1 1v4a1 1 0 1 0 2 0V8a1 1 0 0 0-1-1Zm0 9a1.25 1.25 0 1 0 0-2.5A1.25 1.25 0 0 0 10 16Z"
          />
        </svg>
        High
      </span>
    )
  }

  if (normalized === 'medium') {
    return (
      <span className={`${base} bg-amber-50 text-amber-800 ring-amber-200`}>
        <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" aria-hidden="true">
          <path
            fill="currentColor"
            d="M10 2a1 1 0 0 1 .894.553l7 14A1 1 0 0 1 17 18H3a1 1 0 0 1-.894-1.447l7-14A1 1 0 0 1 10 2Zm0 5a1 1 0 0 0-1 1v4a1 1 0 1 0 2 0V8a1 1 0 0 0-1-1Zm0 9a1.25 1.25 0 1 0 0-2.5A1.25 1.25 0 0 0 10 16Z"
          />
        </svg>
        Medium
      </span>
    )
  }

  return (
    <span className={`${base} bg-sky-50 text-sky-700 ring-sky-200`}>
      <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" aria-hidden="true">
        <path
          fill="currentColor"
          d="M10 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16Zm-1-5a1 1 0 0 0 2 0V9a1 1 0 1 0-2 0v4Zm1-8.5A1.25 1.25 0 1 0 10 7a1.25 1.25 0 0 0 0-2.5Z"
        />
      </svg>
      Low
    </span>
  )
}

const StatCard = ({ label, value, tone = 'slate' }) => {
  const tones = {
    slate: 'bg-white/70 ring-slate-200 text-slate-900',
    amber: 'bg-amber-50/80 ring-amber-200 text-amber-900',
    cyan: 'bg-cyan-50/80 ring-cyan-200 text-cyan-900',
    emerald: 'bg-emerald-50/80 ring-emerald-200 text-emerald-900',
  }

  return (
    <div
      className={`rounded-2xl p-4 shadow-sm ring-1 backdrop-blur transition hover:shadow-md ${
        tones[tone] || tones.slate
      }`}
    >
      <div className="text-sm font-medium text-slate-600">{label}</div>
      <div className="mt-1 text-3xl font-semibold tracking-tight">{value}</div>
    </div>
  )
}

const AdminDashboard = () => {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState(null)
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const loadComplaints = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/complaints')
      setComplaints(response.data || [])
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

  const handleStatusChange = async (complaintId, newStatus) => {
    if (!newStatus) return
    setError('')
    try {
      setUpdatingId(complaintId)
      await api.put(`/api/complaints/${complaintId}`, { status: newStatus })
      setComplaints((prev) =>
        prev.map((c) => {
          const id = c.id ?? c._id
          return String(id) === String(complaintId) ? { ...c, status: newStatus } : c
        }),
      )
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to update complaint status.'
      setError(message)
    } finally {
      setUpdatingId(null)
    }
  }

  const categories = useMemo(() => {
    const set = new Set()
    complaints.forEach((c) => {
      if (c.category) set.add(c.category)
    })
    return Array.from(set)
  }, [complaints])

  // Values must match DB enum exactly
  const statuses = ['pending', 'in-progress', 'resolved']

  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      if (categoryFilter && c.category !== categoryFilter) return false
      if (statusFilter && normalizeStatus(c.status) !== normalizeStatus(statusFilter)) return false
      return true
    })
  }, [complaints, categoryFilter, statusFilter])

  const stats = useMemo(() => {
    const total = complaints.length
    const pending = complaints.filter((c) => normalizeStatus(c.status) === 'pending').length
    const inProgress = complaints.filter((c) => normalizeStatus(c.status) === 'in-progress').length
    const resolved = complaints.filter((c) => normalizeStatus(c.status) === 'resolved').length
    return { total, pending, inProgress, resolved }
  }, [complaints])

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Admin Dashboard</h1>
          {/* <p className="mt-1 text-sm text-slate-600">
            Review, filter, and update complaint statuses in one place.
          </p> */}
        </div>
        <div className="text-sm text-slate-500">
          Showing <span className="font-semibold text-slate-700">{filteredComplaints.length}</span> of{' '}
          <span className="font-semibold text-slate-700">{complaints.length}</span>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Complaints" value={stats.total} tone="slate" />
        <StatCard label="Pending" value={stats.pending} tone="amber" />
        <StatCard label="In Progress" value={stats.inProgress} tone="cyan" />
        <StatCard label="Resolved" value={stats.resolved} tone="emerald" />
      </section>

      <section className="rounded-2xl bg-white/70 p-4 shadow-sm ring-1 ring-slate-200 backdrop-blur">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Filters</h2>
            <p className="mt-1 text-sm text-slate-600">Narrow down complaints by category and status.</p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label htmlFor="categoryFilter" className="text-sm font-medium text-slate-700">
                Category
              </label>
              <select
                id="categoryFilter"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="">All</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="statusFilter" className="text-sm font-medium text-slate-700">
                Status
              </label>
              <select
                id="statusFilter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="">All</option>
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status === 'in-progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl bg-white/70 shadow-sm ring-1 ring-slate-200 backdrop-blur">
        <div className="flex items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Complaints</h2>
            
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center px-6 py-12">
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-600" />
              Loading complaints...
            </div>
          </div>
        ) : filteredComplaints.length === 0 ? (
          <div className="px-6 py-10">
            <p className="text-sm text-slate-600">No complaints found for the selected filters.</p>
          </div>
        ) : (
          <div className="max-h-[70vh] overflow-auto">
            <table className="min-w-full border-separate border-spacing-0">
              <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur">
                <tr>
                  {[
                    'Student',
                    'Category',
                    'Description',
                    'Priority',
                    'Status',
                    'Created At',
                    'Update Status',
                  ].map((h) => (
                    <th
                      key={h}
                      scope="col"
                      className="border-b border-slate-200 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 sm:px-6"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredComplaints.map((complaint, idx) => {
                  const id = complaint.id || complaint._id
                  const isSaving = String(updatingId) === String(id)
                  return (
                    <tr
                      key={id}
                      className={`transition hover:bg-emerald-50/40 ${
                        idx % 2 === 0 ? 'bg-white/60' : 'bg-slate-50/60'
                      }`}
                    >
                      <td className="whitespace-nowrap border-b border-slate-100 px-4 py-3 text-sm text-slate-900 sm:px-6">
                        <div className="font-medium">
                          {complaint.studentName || complaint.studentEmail || 'Student'}
                        </div>
                        {complaint.studentEmail && (
                          <div className="mt-0.5 text-xs text-slate-500">{complaint.studentEmail}</div>
                        )}
                      </td>
                      <td className="whitespace-nowrap border-b border-slate-100 px-4 py-3 text-sm text-slate-700 sm:px-6">
                        {complaint.category || '-'}
                      </td>
                      <td className="min-w-[260px] border-b border-slate-100 px-4 py-3 text-sm text-slate-700 sm:px-6">
                        <div className="line-clamp-2" title={complaint.description || ''}>
                          {complaint.description || '-'}
                        </div>
                      </td>
                      <td className="whitespace-nowrap border-b border-slate-100 px-4 py-3 text-sm sm:px-6">
                        <PriorityBadge priority={complaint.priority} />
                      </td>
                      <td className="whitespace-nowrap border-b border-slate-100 px-4 py-3 text-sm sm:px-6">
                        <StatusBadge status={complaint.status} />
                      </td>
                      <td className="whitespace-nowrap border-b border-slate-100 px-4 py-3 text-sm text-slate-700 sm:px-6">
                        {formatCreatedAt(complaint)}
                      </td>
                      <td className="whitespace-nowrap border-b border-slate-100 px-4 py-3 text-sm sm:px-6">
                        <div className="flex items-center gap-2">
                          <select
                            value={normalizeStatus(complaint.status) || 'pending'}
                            onChange={(e) => handleStatusChange(id, e.target.value)}
                            disabled={isSaving}
                            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {statuses.map((status) => (
                              <option key={status} value={status}>
                                {status === 'in-progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)}
                              </option>
                            ))}
                          </select>
                          {isSaving && (
                            <span className="text-xs text-slate-500">Saving…</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {error && (
          <div className="px-6 pb-5">
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

export default AdminDashboard

