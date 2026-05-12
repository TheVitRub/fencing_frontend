import { useState } from 'react'
import { useFetch } from '../hooks/useFetch'
import { listHonor, getPage } from '../api'
import PageSection from '../components/common/PageSection'
import './Honor.css'

const PREVIEW_LENGTH = 120

function HonorCard({ m }) {
  const [expanded, setExpanded] = useState(false)
  const hasLongDesc = m.description && m.description.length > PREVIEW_LENGTH
  const displayDesc = hasLongDesc && !expanded
    ? m.description.slice(0, PREVIEW_LENGTH).trimEnd() + '…'
    : m.description

  return (
    <div className={`honor-card${expanded ? ' honor-card--expanded' : ''}`}>
      <div className="honor-photo-wrap">
        {m.photo_url
          ? <img src={m.photo_url} alt={m.name} className="honor-photo" />
          : <div className="honor-photo-placeholder">⚔</div>
        }
      </div>
      <h3 className="honor-name">{m.name}</h3>
      {m.title && <p className="honor-title">{m.title}</p>}
      {m.description && (
        <>
          <p className="honor-desc">{displayDesc}</p>
          {hasLongDesc && (
            <button
              className="honor-toggle"
              onClick={() => setExpanded(e => !e)}
            >
              {expanded ? 'Свернуть ▲' : 'Читать далее ▼'}
            </button>
          )}
        </>
      )}
    </div>
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
      {loading && <p className="loading-text">Загрузка...</p>}
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
