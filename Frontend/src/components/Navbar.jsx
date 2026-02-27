import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

const Navbar = () => {
  const [role, setRole] = useState(localStorage.getItem('role'))
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const handleStorageChange = () => {
      setRole(localStorage.getItem('role'))
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    setRole(null)
    navigate('/login')
  }

  const isAuthenticated = !!localStorage.getItem('token')

  const roleLabel = role === 'admin' ? 'Admin' : role === 'student' ? 'Student' : null

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <span className="navbar-brand">HostelOps</span>
        {isAuthenticated && roleLabel && (
          <span className="navbar-role-pill">{roleLabel}</span>
        )}
      </div>
      <div className="navbar-right">
        {isAuthenticated && role === 'student' && (
          <Link
            to="/student"
            className={location.pathname === '/student' ? 'nav-link active' : 'nav-link'}
          >
            Student Dashboard
          </Link>
        )}
        {isAuthenticated && role === 'admin' && (
          <Link
            to="/admin"
            className={location.pathname === '/admin' ? 'nav-link active' : 'nav-link'}
          >
            Admin Dashboard
          </Link>
        )}
        {!isAuthenticated && (
          <>
            <Link
              to="/login"
              className={location.pathname === '/login' ? 'nav-link active' : 'nav-link'}
            >
              Login
            </Link>
            <Link
              to="/register"
              className={location.pathname === '/register' ? 'nav-link active' : 'nav-link'}
            >
              Register
            </Link>
          </>
        )}
        {isAuthenticated && (
          <button type="button" className="btn btn-secondary" onClick={handleLogout}>
            Logout
          </button>
        )}
      </div>
    </nav>
  )
}

export default Navbar

