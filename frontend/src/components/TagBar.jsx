/**
 * שורת תגיות לסינון מהיר.
 *
 * כל לחיצה שולחת `?tag=<name>` לשרת — כלומר מנצלת את ה-FilterSet
 * שהוגדר ב-articles/filters.py ולא מסננת בצד הלקוח.
 */
export default function TagBar({ tags, active, onSelect }) {
  if (!tags.length) return null

  return (
    <div className="tagbar">
      <button
        type="button"
        className={`chip${!active ? ' chip--active' : ''}`}
        onClick={() => onSelect('')}
      >
        הכל
      </button>

      {tags.map((tag) => (
        <button
          key={tag.name}
          type="button"
          className={`chip${active === tag.name ? ' chip--active' : ''}`}
          onClick={() => onSelect(tag.name)}
        >
          {tag.name}
          <span className="chip__count">{tag.count}</span>
        </button>
      ))}
    </div>
  )
}
