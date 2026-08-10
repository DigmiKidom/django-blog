import { Link } from 'react-router-dom'

import { formatDate } from '../utils/format'

export default function ArticleCard({ article }) {
  return (
    <article className="card">
      <h2 className="card__title">
        <Link to={`/articles/${article.id}`}>{article.title}</Link>
      </h2>

      <p className="card__meta">
        מאת <strong>{article.author.username}</strong>
        <span className="dot">•</span>
        {formatDate(article.published_at)}
        <span className="dot">•</span>
        {article.comments_count} תגובות
      </p>

      <p className="card__excerpt">{article.excerpt}</p>

      {article.tag_list?.length > 0 && (
        <ul className="tags">
          {article.tag_list.map((tag) => (
            <li key={tag} className="tag">
              {tag}
            </li>
          ))}
        </ul>
      )}

      <Link to={`/articles/${article.id}`} className="card__more">
        המשך קריאה ←
      </Link>
    </article>
  )
}
