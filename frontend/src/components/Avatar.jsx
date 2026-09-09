/**
 * אווטר מבוסס אות ראשונה.
 *
 * הצבע נגזר משם המשתמש, כך שאותו משתמש מקבל תמיד את אותו גוון —
 * בלי לשמור דבר בשרת ובלי להעלות תמונות.
 */

const PALETTE = [
  '#b5502a',
  '#4a7c59',
  '#3d6b9c',
  '#8a5a9e',
  '#a67c1f',
  '#2f7d7d',
]

function colorFor(name = '') {
  let sum = 0
  for (let i = 0; i < name.length; i += 1) {
    sum += name.charCodeAt(i)
  }
  return PALETTE[sum % PALETTE.length]
}

export default function Avatar({ name = '', size = 36 }) {
  const initial = name.trim().charAt(0).toUpperCase() || '?'

  return (
    <span
      className="avatar"
      style={{
        width: size,
        height: size,
        background: colorFor(name),
        fontSize: size * 0.42,
      }}
      aria-hidden="true"
    >
      {initial}
    </span>
  )
}
