import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { readError } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    setBusy(true)
    setError('')

    try {
      await login(form.username, form.password)
      navigate('/')
    } catch (err) {
      setError(readError(err, 'שם משתמש או סיסמה שגויים.'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="page page--narrow">
      <h1>התחברות</h1>

      <form className="form" onSubmit={handleSubmit}>
        <label htmlFor="username">שם משתמש</label>
        <input
          id="username"
          name="username"
          className="input"
          value={form.username}
          onChange={handleChange}
          autoComplete="username"
          required
        />

        <label htmlFor="password">סיסמה</label>
        <input
          id="password"
          name="password"
          type="password"
          className="input"
          value={form.password}
          onChange={handleChange}
          autoComplete="current-password"
          required
        />

        {error && <p className="error">{error}</p>}

        <button type="submit" className="btn btn--wide" disabled={busy}>
          {busy ? 'מתחבר…' : 'התחברות'}
        </button>
      </form>

      <p className="muted">
        אין לך חשבון? <Link to="/register">הרשמה</Link>
      </p>
    </div>
  )
}
