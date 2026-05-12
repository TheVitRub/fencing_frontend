import { useFetch } from '../hooks/useFetch'
import { listAchievements, getPage } from '../api'
import PageSection from '../components/common/PageSection'

export default function Achievements() {
  const { data: list, loading, error } = useFetch(listAchievements)
  const { data: page } = useFetch(() => getPage('achievements'))
  const content = page ? JSON.parse(page.content || '{}') : {}

  return (
    <PageSection
      title={page?.title || 'Достижения школы'}
      subtitle={content?.subtitle || 'Победы, которыми мы гордимся'}
    >
      {loading && <p className="loading-text">Загрузка...</p>}
      {error && <p className="error-text">Ошибка загрузки</p>}
      {list && list.length === 0 && <p className="loading-text">Достижения будут добавлены</p>}
      <div className="card-grid">
        {list?.map(a => (
          <article className="card" key={a.id}>
            {a.image_url && (
              <img src={a.image_url} alt={a.title} style={{ marginBottom: '1rem', borderRadius: '2px', height: '140px', width: '100%', objectFit: 'cover' }} />
            )}
            <h3 className="card-title">{a.title}</h3>
            <p className="card-meta">{a.year} год</p>
            <p className="card-text">{a.description}</p>
          </article>
        ))}
      </div>
    </PageSection>
  )
}
