import { useState } from 'react'
import { useFetch } from '../hooks/useFetch'
import { listHonor, getPage } from '../api'
import PageSection from '../components/common/PageSection'
import ImageGallery from '../components/common/ImageGallery'
import './Honor.css'

const PREVIEW_LENGTH = 140

function HonorCard({ m }) {
  const [expanded, setExpanded] = useState(false)
  const hasLongDesc = m.description && m.description.length > PREVIEW_LENGTH
  const displayDesc = hasLongDesc && !expanded
    ? m.description.slice(0, PREVIEW_LENGTH).trimEnd() + '…'
    : m.description

  // Объединяем основное фото и галерею, без дубликатов
  const allImages = [
    ...(m.photo_url ? [m.photo_url] : []),
    ...((m.images || []).filter(u => u !== m.photo_url)),
  ]

  return (
    <article className={`honor-card${expanded ? ' is-expanded' : ''}`}>
      <div className="honor-photo-wrap">
        {m.photo_url
          ? <img src={m.photo_url} alt={m.name} className="honor-photo" loading="lazy" />
          : <div className="honor-photo-placeholder">⚔</div>
        }
      </div>
      <h3 className="honor-name">{m.name}</h3>
      {m.title && <p className="honor-title">{m.title}</p>}

      {m.description && (
        <p className="honor-desc">{displayDesc}</p>
      )}

      {(hasLongDesc || allImages.length > 1) && (
        <button
          className="honor-toggle"
          onClick={() => setExpanded(e => !e)}
        >
          {expanded ? 'Свернуть ▲' : 'Подробнее ▼'}
        </button>
      )}

      {expanded && allImages.length > 1 && (
        <div className="honor-gallery">
          <ImageGallery images={allImages} />
        </div>
      )}
    </article>
  )
}

export default function Honor() {
  const { data: members, loading, error } = useFetch(listHonor)
  const { data: page } = useFetch(() => getPage('honor'))
  const content = page ? JSON.parse(page.content || '{}') : {}

  return (
    <PageSection
      title={page?.title || 'Доска почёта'}
      subtitle={content?.subtitle || 'Те, кто прославил наш клуб'}
    >
      {loading && <p className="loading-text">Загрузка…</p>}
      {error && <p className="error-text">Ошибка загрузки</p>}
      {members && members.length === 0 && (
        <p className="loading-text">Пока никто не отличился</p>
      )}
      <div className="honor-grid">
        {members?.map(m => <HonorCard key={m.id} m={m} />)}
      </div>
    </PageSection>
  )
}
