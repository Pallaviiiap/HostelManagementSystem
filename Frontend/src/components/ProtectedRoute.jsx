import { Navigate, Outlet } from 'react-router-dom'

const getRedirectPathForRole = (role) => {
  if (role === 'student') return '/student'
  if (role === 'admin') return '/admin'
  return '/login'
}

const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')

  if (!token) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    const redirectPath = getRedirectPathForRole(role)
    return <Navigate to={redirectPath} replace />
  }

  return <Outlet />
}

export default ProtectedRoute

