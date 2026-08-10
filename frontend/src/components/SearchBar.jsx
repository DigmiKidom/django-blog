import { useEffect, useState } from 'react'

/**
 * שורת חיפוש כתבות.
 *
 * החיפוש נשלח לשרת רק אחרי 400 מילישניות ללא הקלדה,
 * כדי לא לשגר בקשה על כל תו שהמשתמש מקליד.
 */
export default function SearchBar({ value, onChange }) {
  const [text, setText] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (text !== value) onChange(text)
    }, 400)

    return () => clearTimeout(timer)
  }, [text, value, onChange])

  // מסנכרן כשהערך משתנה מבחוץ (למשל בלחיצה על "נקה")
  useEffect(() => {
    setText(value)
  }, [value])

  return (
    <div className="search">
      <input
        type="search"
        className="search__input"
        placeholder="חיפוש לפי כותרת, תוכן, תגית או שם מחבר…"
        value={text}
        onChange={(event) => setText(event.target.value)}
        aria-label="חיפוש כתבות"
      />

      {text && (
        <button type="button" className="btn btn--ghost" onClick={() => setText('')}>
          נקה
        </button>
      )}
    </div>
  )
}
