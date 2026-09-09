import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import client, { readError } from '../api/client'
import Avatar from '../components/Avatar'
import CommentItem from '../components/CommentItem'
import ReadingProgress from '../components/ReadingProgress'
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
    window.scrollTo({ top: 0 })

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

  if (loading) {
    return (
      <div className="page">
        <div className="card card--skeleton">
          <div className="skeleton skeleton--title" />
          <div className="skeleton skeleton--line" />
          <div className="skeleton skeleton--line" />
          <div className="skeleton skeleton--line" />
          <div className="skeleton skeleton--line skeleton--short" />
        </div>
      </div>
    )
  }

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
    <>
      <ReadingProgress />

      <div className="page page--read">
        <Link to="/" className="back-link">
          → חזרה לכל הכתבות
        </Link>

        <article className="article">
          {article.tag_list?.length > 0 && (
            <ul className="tags">
              {article.tag_list.map((tag) => (
                <li key={tag} className="tag">
                  {tag}
                </li>
              ))}
            </ul>
          )}

          <h1 className="article__title">{article.title}</h1>

          <div className="byline byline--article">
            <Avatar name={article.author.username} size={44} />
            <div>
              <strong>{article.author.username}</strong>
              <div className="byline__meta">
                {formatDate(article.published_at)}
                <span className="dot">•</span>
                {article.reading_time} דק׳ קריאה
                <span className="dot">•</span>
                {comments.length} תגובות
              </div>
            </div>
          </div>

          <div className="article__content">
            {article.content.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          {article.author.bio && (
            <div className="authorcard">
              <Avatar name={article.author.username} size={48} />
              <div>
                <div className="authorcard__label">נכתב על ידי</div>
                <strong>{article.author.username}</strong>
                <p className="authorcard__bio">{article.author.bio}</p>
              </div>
            </div>
          )}
        </article>

        <section className="comments">
          <h2 className="sectiontitle">
            <span>תגובות ({comments.length})</span>
          </h2>

          {comments.length === 0 && (
            <p className="muted">אין עדיין תגובות. היה הראשון.</p>
          )}

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
            <div className="cta">
              <p>
                רוצה להגיב? <Link to="/login">התחבר</Link> או{' '}
                <Link to="/register">הירשם</Link> — לוקח פחות מדקה.
              </p>
            </div>
          )}
        </section>
      </div>
    </>
  )
}
