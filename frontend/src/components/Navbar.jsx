import { Link, useNavigate } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <Link to="/" className="navbar__brand">
          הבלוג
        </Link>

        <nav className="navbar__links">
          {isAuthenticated ? (
            <>
              <span className="navbar__user">
                שלום, <strong>{user.username}</strong>
                {user.groups?.length > 0 && (
                  <span className="badge">{user.groups.join(', ')}</span>
                )}
              </span>
              <button type="button" className="btn btn--ghost" onClick={handleLogout}>
                התנתקות
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn--ghost">
                התחברות
              </Link>
              <Link to="/register" className="btn">
                הרשמה
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
