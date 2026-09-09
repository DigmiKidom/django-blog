import { useCallback, useEffect, useState } from 'react'

import client, { readError } from '../api/client'
import ArticleCard from '../components/ArticleCard'
import HeroArticle from '../components/HeroArticle'
import SearchBar from '../components/SearchBar'
import Sidebar from '../components/Sidebar'
import TagBar from '../components/TagBar'

/**
 * העמוד הראשי, בפריסת מגזין.
 *
 * השרת מוגדר ל-3 כתבות בעמוד (PAGE_SIZE=3), ולכן הבקשה הראשונה
 * מחזירה בדיוק את שלוש הכתבות האחרונות: הראשונה מוצגת ככתבה ראשית
 * והשתיים הנוספות ברשת שמתחתיה. כפתור "הצג כתבות ישנות יותר"
 * טוען את העמוד הבא ומוסיף אותו לרשת.
 */
export default function Home() {
  const [articles, setArticles] = useState([])
  const [search, setSearch] = useState('')
  const [tag, setTag] = useState('')
  const [nextPage, setNextPage] = useState(null)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')

  const [tags, setTags] = useState([])
  const [stats, setStats] = useState(null)
  const [recent, setRecent] = useState([])

  // נתוני סרגל הצד נטענים פעם אחת ואינם תלויים בחיפוש
  useEffect(() => {
    Promise.all([
      client.get('/articles/tags/'),
      client.get('/articles/stats/'),
      client.get('/comments/recent/'),
    ])
      .then(([tagsRes, statsRes, recentRes]) => {
        setTags(tagsRes.data)
        setStats(statsRes.data)
        setRecent(recentRes.data)
      })
      .catch(() => {
        // סרגל הצד הוא תוספת — כישלון בטעינתו לא צריך לשבור את העמוד
      })
  }, [])

  const fetchPage = useCallback(async (page, query, activeTag, append) => {
    const params = { page }
    if (query) params.search = query
    if (activeTag) params.tag = activeTag

    const { data } = await client.get('/articles/', { params })

    setTotal(data.count)
    setNextPage(data.next ? page + 1 : null)
    setArticles((current) => (append ? [...current, ...data.results] : data.results))
  }, [])

  useEffect(() => {
    let cancelled = false

    setLoading(true)
    setError('')

    fetchPage(1, search, tag, false)
      .catch((err) => {
        if (!cancelled) setError(readError(err, 'טעינת הכתבות נכשלה.'))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [search, tag, fetchPage])

  const handleLoadMore = async () => {
    setLoadingMore(true)
    setError('')

    try {
      await fetchPage(nextPage, search, tag, true)
    } catch (err) {
      setError(readError(err, 'טעינת הכתבות הנוספות נכשלה.'))
    } finally {
      setLoadingMore(false)
    }
  }

  const handleTagSelect = (name) => {
    setTag((current) => (current === name ? '' : name))
    setSearch('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const isFiltered = Boolean(search || tag)
  const [hero, ...rest] = articles

  return (
    <div className="home">
      <section className="masthead">
        <p className="masthead__kicker">בלוג אישי</p>
        <h1 className="masthead__title">דברים קטנים מהיום־יום</h1>
        <p className="masthead__sub">
          כסף, טיולים ותחביבים — בקצרה, בלי יומרות, ומתוך ניסיון אישי.
        </p>
        <SearchBar value={search} onChange={setSearch} />
      </section>

      <TagBar tags={tags} active={tag} onSelect={handleTagSelect} />

      {isFiltered && !loading && (
        <p className="resultline">
          {total > 0 ? `${total} כתבות` : 'אין תוצאות'}
          {search && <> עבור <strong>{search}</strong></>}
          {tag && <> בנושא <strong>{tag}</strong></>}
          <button
            type="button"
            className="btn btn--link"
            onClick={() => {
              setSearch('')
              setTag('')
            }}
          >
            ניקוי
          </button>
        </p>
      )}

      {error && <p className="error">{error}</p>}

      <div className="layout">
        <main className="feedcol">
          {loading ? (
            <>
              <div className="hero card--skeleton">
                <div className="skeleton skeleton--title" />
                <div className="skeleton skeleton--line" />
                <div className="skeleton skeleton--line" />
                <div className="skeleton skeleton--line skeleton--short" />
              </div>
              <div className="grid">
                {[0, 1].map((i) => (
                  <div key={i} className="card card--skeleton">
                    <div className="skeleton skeleton--title" />
                    <div className="skeleton skeleton--line" />
                    <div className="skeleton skeleton--line skeleton--short" />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              {hero && <HeroArticle article={hero} />}

              {rest.length > 0 && (
                <>
                  <h2 className="sectiontitle">
                    <span>עוד מהבלוג</span>
                  </h2>

                  <div className="grid">
                    {rest.map((article) => (
                      <ArticleCard
                        key={article.id}
                        article={article}
                        onTagClick={handleTagSelect}
                      />
                    ))}
                  </div>
                </>
              )}

              {nextPage && (
                <div className="center">
                  <button
                    type="button"
                    className="btn btn--wide"
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                  >
                    {loadingMore ? 'טוען…' : 'הצג כתבות ישנות יותר'}
                  </button>
                </div>
              )}

              {!nextPage && articles.length > 0 && (
                <p className="muted center end-note">— הגעת לסוף הרשימה —</p>
              )}

              {articles.length === 0 && !error && (
                <div className="empty">
                  <p>לא נמצאו כתבות התואמות את הסינון.</p>
                  <button
                    type="button"
                    className="btn btn--ghost"
                    onClick={() => {
                      setSearch('')
                      setTag('')
                    }}
                  >
                    הצג את כל הכתבות
                  </button>
                </div>
              )}
            </>
          )}
        </main>

        <Sidebar
          stats={stats}
          tags={tags}
          comments={recent}
          onTagSelect={handleTagSelect}
        />
      </div>
    </div>
  )
}
