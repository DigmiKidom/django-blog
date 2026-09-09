import { Link } from 'react-router-dom'

import { formatDate } from '../utils/format'
import Avatar from './Avatar'

/**
 * הכתבה הראשית בראש העמוד.
 *
 * מקבלת נוכחות גדולה יותר משאר הכרטיסים — כותרת בולטת,
 * תקציר מלא ורקע נבדל, בדומה לכתבה ראשית במגזין.
 */
export default function HeroArticle({ article }) {
  return (
    <article className="hero">
      <div className="hero__label">הכתבה האחרונה</div>

      <h2 className="hero__title">
        <Link to={`/articles/${article.id}`}>{article.title}</Link>
      </h2>

      <p className="hero__excerpt">{article.excerpt}</p>

      <div className="hero__footer">
        <div className="byline">
          <Avatar name={article.author.username} size={38} />
          <div>
            <strong>{article.author.username}</strong>
            <div className="byline__meta">
              {formatDate(article.published_at)}
              <span className="dot">•</span>
              {article.reading_time} דק׳ קריאה
              <span className="dot">•</span>
              {article.comments_count} תגובות
            </div>
          </div>
        </div>

        <Link to={`/articles/${article.id}`} className="btn">
          לקריאה
        </Link>
      </div>

      {article.tag_list?.length > 0 && (
        <ul className="tags tags--hero">
          {article.tag_list.map((tag) => (
            <li key={tag} className="tag">
              {tag}
            </li>
          ))}
        </ul>
      )}
    </article>
  )
}
