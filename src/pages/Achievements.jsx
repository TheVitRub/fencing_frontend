import { useState, useMemo } from 'react'
import { useFetch } from '../hooks/useFetch'
import { listAchievements, getPage } from '../api'
import PageSection from '../components/common/PageSection'
import ImageGallery from '../components/common/ImageGallery'
import './Achievements.css'

function AchievementCard({ a }) {
  const [open, setOpen] = useState(false)
  const images = (a.images && a.images.length > 0)
    ? a.images
    : a.image_url ? [a.image_url] : []
  const longDesc = a.description && a.description.length > 180

  return (
    <article className={`ach-card${open ? ' is-open' : ''}`}>
      {images[0] ? (
        <button
          className="ach-card-media"
          onClick={() => images.length > 0 && setOpen(true)}
        >
          <img src={images[0]} alt={a.title} loading="lazy" />
          {images.length > 1 && (
            <span className="ach-card-count">📷 {images.length}</span>
          )}
        </button>
      ) : (
        <div className="ach-card-media ach-card-media--empty">🏆</div>
      )}

      <div className="ach-card-body">
        <h3 className="ach-card-title">{a.title}</h3>
        {a.description && (
          <p className="ach-card-desc">
            {open || !longDesc
              ? a.description
              : a.description.slice(0, 180).trimEnd() + '…'}
          </p>
        )}
        {longDesc && (
          <button className="ach-card-more" onClick={() => setOpen(o => !o)}>
            {open ? 'Свернуть' : 'Подробнее'}
          </button>
        )}
        {open && images.length > 1 && <ImageGallery images={images} />}
      </div>
    </article>
  )
}

export default function Achievements() {
  const { data: list, loading, error } = useFetch(listAchievements)
  const { data: page } = useFetch(() => getPage('achievements'))
  const content = page ? JSON.parse(page.content || '{}') : {}

  // Группируем достижения по годам (по убыванию)
  const grouped = useMemo(() => {
    if (!list) return []
    const map = new Map()
    for (const a of list) {
      if (!map.has(a.year)) map.set(a.year, [])
      map.get(a.year).push(a)
    }
    return Array.from(map.entries()).sort((x, y) => y[0] - x[0])
  }, [list])

  return (
    <PageSection
      title={page?.title || 'Достижения школы'}
      subtitle={content?.subtitle || 'Победы, которыми мы гордимся'}
    >
      {loading && <p className="loading-text">Загрузка…</p>}
      {error  && <p className="error-text">Ошибка загрузки</p>}

      {list && list.length === 0 && (
        <div className="ach-empty">
          <span className="ach-empty-glyph">🏆</span>
          <p>Достижения скоро появятся</p>
        </div>
      )}

      {grouped.map(([year, items]) => (
        <section className="ach-year-block" key={year}>
          <div className="ach-year-header">
            <span className="ach-year-num">{year}</span>
            <span className="ach-year-line" />
            <span className="ach-year-count">{items.length} {pluralize(items.length, ['победа', 'победы', 'побед'])}</span>
          </div>
          <div className="ach-grid">
            {items.map(a => <AchievementCard key={a.id} a={a} />)}
          </div>
        </section>
      ))}
    </PageSection>
  )
}

function pluralize(n, forms) {
  const mod10  = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return forms[0]
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return forms[1]
  return forms[2]
}
