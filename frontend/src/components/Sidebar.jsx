import { Link } from 'react-router-dom'

import { formatDateTime } from '../utils/format'
import Avatar from './Avatar'

/**
 * סרגל הצד של העמוד הראשי.
 *
 * כל הנתונים כאן מגיעים מנקודות קצה ייעודיות ולא מחושבים בלקוח:
 * `/api/articles/stats/`, `/api/articles/tags/` ו-`/api/comments/recent/`.
 */
export default function Sidebar({ stats, tags, comments, onTagSelect }) {
  return (
    <aside className="sidebar">
      <section className="panel panel--about">
        <h3 className="panel__title">על בקטנה</h3>
        <p className="panel__text">
          כתבות קצרות על כסף, טיולים ותחביבים. דברים קטנים מחיי היום־יום
          שהתברר שכדאי לספר עליהם — בקטנה, בלי להפוך את זה לעניין גדול.
        </p>

        {stats && (
          <div className="minibar">
            <div>
              <strong>{stats.articles}</strong>
              <span>כתבות</span>
            </div>
            <div>
              <strong>{stats.comments}</strong>
              <span>תגובות</span>
            </div>
            <div>
              <strong>{stats.authors}</strong>
              <span>כותבים</span>
            </div>
          </div>
        )}
      </section>

      {tags.length > 0 && (
        <section className="panel">
          <h3 className="panel__title">נושאים פופולריים</h3>
          <ul className="toplist">
            {tags.slice(0, 6).map((tag, index) => (
              <li key={tag.name}>
                <button type="button" onClick={() => onTagSelect(tag.name)}>
                  <span className="toplist__rank">{index + 1}</span>
                  <span className="toplist__name">{tag.name}</span>
                  <span className="toplist__count">{tag.count}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {comments.length > 0 && (
        <section className="panel">
          <h3 className="panel__title">תגובות אחרונות</h3>
          <ul className="feed">
            {comments.map((comment) => (
              <li key={comment.id} className="feed__item">
                <Avatar name={comment.author_name} size={28} />
                <div className="feed__body">
                  <p className="feed__text">{comment.excerpt}</p>
                  <p className="feed__meta">
                    <strong>{comment.author_name}</strong> על{' '}
                    <Link to={`/articles/${comment.article}`}>
                      {comment.article_title}
                    </Link>
                  </p>
                  <p className="feed__date">{formatDateTime(comment.created_at)}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </aside>
  )
}
