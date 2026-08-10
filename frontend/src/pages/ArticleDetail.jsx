import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import client, { readError } from '../api/client'
import CommentItem from '../components/CommentItem'
import { useAuth } from '../context/AuthContext'
import { formatDate } from '../utils/format'

export default function ArticleDetail() {
  const { id } = useParams()
  const { isAuthenticated } = useAuth()

  const [article, setArticle] = useState(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [draft, setDraft] = useState('')
  const [posting, setPosting] = useState(false)
  const [postError, setPostError] = useState('')

  useEffect(() => {
    let cancelled = false

    setLoading(true)
    setError('')

    client
      .get(`/articles/${id}/`)
      .then(({ data }) => {
        if (cancelled) return
        setArticle(data)
        setComments(data.comments || [])
      })
      .catch((err) => {
        if (!cancelled) setError(readError(err, 'הכתבה לא נמצאה.'))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [id])

  const handleAddComment = async (event) => {
    event.preventDefault()

    const content = draft.trim()
    if (!content) return

    setPosting(true)
    setPostError('')

    try {
      const { data } = await client.post(`/articles/${id}/comments/`, { content })
      setComments((current) => [...current, data])
      setDraft('')
    } catch (err) {
      setPostError(readError(err, 'שליחת התגובה נכשלה.'))
    } finally {
      setPosting(false)
    }
  }

  const handleUpdated = (updated) => {
    setComments((current) =>
      current.map((item) => (item.id === updated.id ? updated : item)),
    )
  }

  const handleDeleted = (deletedId) => {
    setComments((current) => current.filter((item) => item.id !== deletedId))
  }

  if (loading) return <p className="muted page">טוען…</p>

  if (error) {
    return (
      <div className="page">
        <p className="error">{error}</p>
        <Link to="/" className="btn btn--ghost">
          חזרה לעמוד הראשי
        </Link>
      </div>
    )
  }

  return (
    <div className="page">
      <Link to="/" className="back-link">
        → חזרה לכל הכתבות
      </Link>

      <article className="article">
        <h1 className="article__title">{article.title}</h1>

        <p className="card__meta">
          מאת <strong>{article.author.username}</strong>
          <span className="dot">•</span>
          {formatDate(article.published_at)}
        </p>

        {article.tag_list?.length > 0 && (
          <ul className="tags">
            {article.tag_list.map((tag) => (
              <li key={tag} className="tag">
                {tag}
              </li>
            ))}
          </ul>
        )}

        <div className="article__content">
          {article.content.split('\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </article>

      <section className="comments">
        <h2>תגובות ({comments.length})</h2>

        {comments.length === 0 && <p className="muted">אין עדיין תגובות. היה הראשון.</p>}

        <ul className="comments__list">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onUpdated={handleUpdated}
              onDeleted={handleDeleted}
            />
          ))}
        </ul>

        {isAuthenticated ? (
          <form className="comment-form" onSubmit={handleAddComment}>
            <label htmlFor="new-comment">הוספת תגובה</label>
            <textarea
              id="new-comment"
              className="textarea"
              rows={4}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="מה דעתך על הכתבה?"
              disabled={posting}
            />

            {postError && <p className="error error--inline">{postError}</p>}

            <button type="submit" className="btn" disabled={posting || !draft.trim()}>
              {posting ? 'שולח…' : 'שליחת תגובה'}
            </button>
          </form>
        ) : (
          <p className="muted">
            כדי להגיב יש <Link to="/login">להתחבר</Link> או{' '}
            <Link to="/register">להירשם</Link>.
          </p>
        )}
      </section>
    </div>
  )
}
