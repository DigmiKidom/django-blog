/** מעצב תאריך ISO לתצוגה בעברית, למשל: 10 באוגוסט 2026 */
export function formatDate(iso) {
  if (!iso) return ''

  return new Date(iso).toLocaleDateString('he-IL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/** מעצב תאריך ושעה, לשימוש בתגובות. */
export function formatDateTime(iso) {
  if (!iso) return ''

  return new Date(iso).toLocaleString('he-IL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
