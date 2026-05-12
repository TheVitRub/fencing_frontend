import { useFetch } from '../hooks/useFetch'
import { listEvents, getPage } from '../api'
import PageSection from '../components/common/PageSection'

export default function Events() {
  const { data: events, loading, error } = useFetch(listEvents)
  const { data: page } = useFetch(() => getPage('events'))
  const content = page ? JSON.parse(page.content || '{}') : {}

  const formatDate = iso => new Date(iso).toLocaleDateString('ru-RU', {
    day: 'numeric', month: 'long', year: 'numeric'
  })

  return (
    <PageSection
      title={page?.title || 'События'}
      subtitle={content?.subtitle || 'Турниры, показательные выступления, открытые тренировки'}
    >
      {loading && <p className="loading-text">Загрузка...</p>}
      {error && <p className="error-text">Ошибка загрузки событий</p>}
      {events && events.length === 0 && (
        <p className="loading-text">Событий пока нет</p>
      )}
      <div className="card-grid">
        {events?.map(e => (
          <article className="card" key={e.id}>
            {e.image_url && (
              <img src={e.image_url} alt={e.title} style={{ marginBottom: '1rem', borderRadius: '2px', height: '160px', width: '100%', objectFit: 'cover' }} />
            )}
            <h3 className="card-title">{e.title}</h3>
            <p className="card-meta">{formatDate(e.date)}{e.location ? ` · ${e.location}` : ''}</p>
            <p className="card-text">{e.description}</p>
          </article>
        ))}
      </div>
    </PageSection>
  )
}
