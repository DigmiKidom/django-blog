import { Link, NavLink, useNavigate } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'
import Avatar from './Avatar'

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
          <span className="navbar__dot" />
          הבלוג
        </Link>

        <nav className="navbar__links">
          {isAuthenticated ? (
            <>
              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  `navbar__profile${isActive ? ' navbar__profile--active' : ''}`
                }
                title="הפרופיל שלי"
              >
                <Avatar name={user.username} size={30} />
                <span className="navbar__username">{user.username}</span>
              </NavLink>

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
