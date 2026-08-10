import { useCallback, useEffect, useState } from 'react'

import client, { readError } from '../api/client'
import ArticleCard from '../components/ArticleCard'
import SearchBar from '../components/SearchBar'

/**
 * העמוד הראשי.
 *
 * השרת מוגדר ל-3 כתבות בעמוד (PAGE_SIZE=3), ולכן הבקשה הראשונה
 * מחזירה בדיוק את שלוש הכתבות האחרונות. כפתור "הצג כתבות ישנות יותר"
 * טוען את העמוד הבא ומוסיף אותו לרשימה הקיימת.
 */
export default function Home() {
  const [articles, setArticles] = useState([])
  const [search, setSearch] = useState('')
  const [nextPage, setNextPage] = useState(null)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')

  const fetchPage = useCallback(async (page, query, append) => {
    const params = { page }
    if (query) params.search = query

    const { data } = await client.get('/articles/', { params })

    setTotal(data.count)
    setNextPage(data.next ? page + 1 : null)
    setArticles((current) => (append ? [...current, ...data.results] : data.results))
  }, [])

  // טעינה ראשונה, וכל שינוי במונח החיפוש מאפס חזרה לעמוד הראשון
  useEffect(() => {
    let cancelled = false

    setLoading(true)
    setError('')

    fetchPage(1, search, false)
      .catch((err) => {
        if (!cancelled) setError(readError(err, 'טעינת הכתבות נכשלה.'))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [search, fetchPage])

  const handleLoadMore = async () => {
    setLoadingMore(true)
    setError('')

    try {
      await fetchPage(nextPage, search, true)
    } catch (err) {
      setError(readError(err, 'טעינת הכתבות הנוספות נכשלה.'))
    } finally {
      setLoadingMore(false)
    }
  }

  return (
    <div className="page">
      <div className="page__header">
        <h1>כתבות אחרונות</h1>
        <SearchBar value={search} onChange={setSearch} />
      </div>

      {search && !loading && (
        <p className="muted">
          {total > 0
            ? `נמצאו ${total} תוצאות עבור "${search}"`
            : `לא נמצאו תוצאות עבור "${search}"`}
        </p>
      )}

      {error && <p className="error">{error}</p>}

      {loading ? (
        <p className="muted">טוען…</p>
      ) : (
        <>
          <div className="articles">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>

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
            <p className="muted center">הגעת לסוף הרשימה.</p>
          )}
        </>
      )}
    </div>
  )
}
