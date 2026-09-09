import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'

import client, { readError } from '../api/client'
import Avatar from '../components/Avatar'
import { useAuth } from '../context/AuthContext'
import { formatDate } from '../utils/format'

const GROUP_LABELS = {
  users: 'משתמש',
  editors: 'עורך',
  managers: 'ניהול',
}

const MAX_BIO = 300

export default function Profile() {
  const { isAuthenticated, syncUser } = useAuth()

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState({ email: '', bio: '' })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) return undefined

    let cancelled = false

    client
      .get('/users/me/')
      .then(({ data }) => {
        if (cancelled) return
        setProfile(data)
        setForm({ email: data.email, bio: data.bio || '' })
      })
      .catch((err) => {
        if (!cancelled) setError(readError(err, 'טעינת הפרופיל נכשלה.'))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [isAuthenticated])

  if (!isAuthenticated) return <Navigate to="/login" replace />

  const handleSubmit = async (event) => {
    event.preventDefault()

    setSaving(true)
    setError('')
    setSaved(false)

    try {
      const { data } = await client.patch('/users/me/', {
        email: form.email,
        bio: form.bio,
      })

      setProfile(data)
      // מעדכן גם את המשתמש השמור, כדי שסרגל הניווט יישאר מסונכרן
      syncUser(data)
      setIsEditing(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(readError(err, 'שמירת הפרופיל נכשלה.'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="page page--narrow">
        <div className="skeleton skeleton--avatar" />
        <div className="skeleton skeleton--line" />
        <div className="skeleton skeleton--line skeleton--short" />
      </div>
    )
  }

  if (error && !profile) {
    return (
      <div className="page page--narrow">
        <p className="error">{error}</p>
      </div>
    )
  }

  return (
    <div className="page page--narrow">
      <div className="profile__header">
        <Avatar name={profile.username} size={72} />
        <div>
          <h1 className="profile__name">{profile.username}</h1>
          <div className="profile__groups">
            {profile.groups.map((group) => (
              <span key={group} className={`badge badge--${group}`}>
                {GROUP_LABELS[group] || group}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="stats">
        <div className="stat">
          <span className="stat__value">{profile.articles_count}</span>
          <span className="stat__label">כתבות</span>
        </div>
        <div className="stat">
          <span className="stat__value">{profile.comments_count}</span>
          <span className="stat__label">תגובות</span>
        </div>
        <div className="stat">
          <span className="stat__value">{formatDate(profile.date_joined)}</span>
          <span className="stat__label">הצטרף</span>
        </div>
      </div>

      {saved && <p className="notice notice--ok">הפרופיל נשמר.</p>}

      {isEditing ? (
        <form className="form card card--flat" onSubmit={handleSubmit}>
          <label htmlFor="email">אימייל</label>
          <input
            id="email"
            type="email"
            className="input"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            required
          />

          <label htmlFor="bio">קצת עליי</label>
          <textarea
            id="bio"
            className="textarea"
            rows={4}
            maxLength={MAX_BIO}
            value={form.bio}
            onChange={(event) => setForm({ ...form, bio: event.target.value })}
            placeholder="במה אתה מתעניין? מה מביא אותך לכאן?"
          />
          <p className="hint">
            {form.bio.length} / {MAX_BIO}
          </p>

          {error && <p className="error">{error}</p>}

          <div className="row">
            <button type="submit" className="btn" disabled={saving}>
              {saving ? 'שומר…' : 'שמירה'}
            </button>
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => {
                setForm({ email: profile.email, bio: profile.bio || '' })
                setError('')
                setIsEditing(false)
              }}
              disabled={saving}
            >
              ביטול
            </button>
          </div>
        </form>
      ) : (
        <div className="card card--flat">
          <dl className="details">
            <dt>אימייל</dt>
            <dd>{profile.email}</dd>

            <dt>קצת עליי</dt>
            <dd>{profile.bio || <span className="muted">עדיין לא נכתב תיאור.</span>}</dd>
          </dl>

          <button type="button" className="btn" onClick={() => setIsEditing(true)}>
            עריכת פרופיל
          </button>
        </div>
      )}

      <p className="hint">
        שם המשתמש והקבוצות אינם ניתנים לשינוי מכאן. שיוך לקבוצה הוא פעולת ניהול.
      </p>
    </div>
  )
}
