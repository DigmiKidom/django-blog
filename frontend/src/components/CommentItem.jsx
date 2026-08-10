import { useState } from 'react'

import client, { readError } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { formatDateTime } from '../utils/format'

export default function CommentItem({ comment, onUpdated, onDeleted }) {
  const { user, isManager } = useAuth()

  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(comment.content)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  // הסתרת הכפתורים היא נוחות בלבד — האכיפה האמיתית היא בשרת,
  // דרך CommentPermission. בקשה ישירה מלקוח אחר תקבל 403.
  const isOwner = user?.id === comment.author.id
  const canEdit = isOwner
  const canDelete = isOwner || isManager

  const handleSave = async () => {
    const content = draft.trim()
    if (!content) {
      setError('לא ניתן לשמור תגובה ריקה.')
      return
    }

    setBusy(true)
    setError('')

    try {
      const { data } = await client.patch(`/comments/${comment.id}/`, { content })
      onUpdated(data)
      setIsEditing(false)
    } catch (err) {
      setError(readError(err, 'עריכת התגובה נכשלה.'))
    } finally {
      setBusy(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('למחוק את התגובה?')) return

    setBusy(true)
    setError('')

    try {
      await client.delete(`/comments/${comment.id}/`)
      onDeleted(comment.id)
    } catch (err) {
      setError(readError(err, 'מחיקת התגובה נכשלה.'))
      setBusy(false)
    }
  }

  return (
    <li className="comment">
      <div className="comment__head">
        <strong>{comment.author.username}</strong>
        <span className="comment__date">{formatDateTime(comment.created_at)}</span>
        {comment.updated_at !== comment.created_at && (
          <span className="comment__edited">(נערך)</span>
        )}
      </div>

      {isEditing ? (
        <div className="comment__edit">
          <textarea
            className="textarea"
            rows={3}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            disabled={busy}
          />
          <div className="comment__actions">
            <button type="button" className="btn" onClick={handleSave} disabled={busy}>
              שמירה
            </button>
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => {
                setDraft(comment.content)
                setError('')
                setIsEditing(false)
              }}
              disabled={busy}
            >
              ביטול
            </button>
          </div>
        </div>
      ) : (
        <p className="comment__body">{comment.content}</p>
      )}

      {error && <p className="error error--inline">{error}</p>}

      {!isEditing && (canEdit || canDelete) && (
        <div className="comment__actions">
          {canEdit && (
            <button
              type="button"
              className="btn btn--link"
              onClick={() => setIsEditing(true)}
            >
              עריכה
            </button>
          )}
          {canDelete && (
            <button
              type="button"
              className="btn btn--link btn--danger"
              onClick={handleDelete}
              disabled={busy}
            >
              מחיקה
            </button>
          )}
        </div>
      )}
    </li>
  )
}
