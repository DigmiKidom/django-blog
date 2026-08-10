import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { readError } from '../api/client'
import { useAuth } from '../context/AuthContext'

const EMPTY = { username: '', email: '', password: '', password2: '' }

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (form.password !== form.password2) {
      setError('הסיסמאות אינן תואמות.')
      return
    }

    setBusy(true)
    setError('')

    try {
      // הרשמה מוצלחת מתחברת אוטומטית ומעבירה לעמוד הראשי
      await register(form)
      navigate('/')
    } catch (err) {
      setError(readError(err, 'ההרשמה נכשלה.'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="page page--narrow">
      <h1>הרשמה</h1>

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

        <label htmlFor="email">אימייל</label>
        <input
          id="email"
          name="email"
          type="email"
          className="input"
          value={form.email}
          onChange={handleChange}
          autoComplete="email"
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
          autoComplete="new-password"
          required
        />
        <p className="hint">לפחות 8 תווים, לא סיסמה נפוצה ולא מספרים בלבד.</p>

        <label htmlFor="password2">אימות סיסמה</label>
        <input
          id="password2"
          name="password2"
          type="password"
          className="input"
          value={form.password2}
          onChange={handleChange}
          autoComplete="new-password"
          required
        />

        {error && <p className="error">{error}</p>}

        <button type="submit" className="btn btn--wide" disabled={busy}>
          {busy ? 'נרשם…' : 'הרשמה'}
        </button>
      </form>

      <p className="muted">
        כבר רשום? <Link to="/login">התחברות</Link>
      </p>
    </div>
  )
}
