import { useEffect, useState } from 'react'

/** פס דק בראש המסך שמראה כמה מהעמוד כבר נקרא. */
export default function ReadingProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const update = () => {
      const scrollable = document.body.scrollHeight - window.innerHeight

      if (scrollable <= 0) {
        setProgress(0)
        return
      }

      setProgress(Math.min(100, (window.scrollY / scrollable) * 100))
    }

    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)

    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  return (
    <div className="progress" aria-hidden="true">
      <div className="progress__bar" style={{ width: `${progress}%` }} />
    </div>
  )
}
