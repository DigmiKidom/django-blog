import { Link } from 'react-router-dom'

import { formatDate } from '../utils/format'
import Avatar from './Avatar'

export default function ArticleCard({ article, onTagClick }) {
  return (
    <article className="card">
      <div className="card__body">
        <h3 className="card__title">
          <Link to={`/articles/${article.id}`}>{article.title}</Link>
        </h3>

        <p className="card__excerpt">{article.excerpt}</p>
      </div>

      {article.tag_list?.length > 0 && (
        <ul className="tags">
          {article.tag_list.map((tag) => (
            <li key={tag}>
              <button
                type="button"
                className="tag tag--button"
                onClick={() => onTagClick?.(tag)}
              >
                {tag}
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="card__meta">
        <Avatar name={article.author.username} size={26} />
        <strong>{article.author.username}</strong>
        <span className="dot">•</span>
        {formatDate(article.published_at)}
        <span className="dot">•</span>
        {article.reading_time} דק׳
        <span className="dot">•</span>
        {article.comments_count} תגובות
      </div>
    </article>
  )
}
