import { useFetch } from '../hooks/useFetch'
import { listPlans, getPage } from '../api'
import PageSection from '../components/common/PageSection'

export default function Plans() {
  const { data: plans, loading, error } = useFetch(listPlans)
  const { data: page } = useFetch(() => getPage('plans'))
  const content = page ? JSON.parse(page.content || '{}') : {}

  return (
    <PageSection
      title={page?.title || 'Учебные планы'}
      subtitle={content?.subtitle || 'Программа обучения на каждый период'}
    >
      {loading && <p className="loading-text">Загрузка...</p>}
      {error && <p className="error-text">Ошибка загрузки планов</p>}
      {plans && plans.length === 0 && <p className="loading-text">Планов пока нет</p>}
      <div className="card-grid">
        {plans?.map(p => {
          const items = (() => { try { return JSON.parse(p.items) } catch { return [] } })()
          return (
            <article className="card" key={p.id}>
              <h3 className="card-title">{p.title}</h3>
              <p className="card-meta">{p.period}</p>
              <p className="card-text" style={{ marginBottom: items.length ? '1rem' : 0 }}>{p.description}</p>
              {items.length > 0 && (
                <ul style={{ paddingLeft: '1.2rem', color: 'var(--color-text)' }}>
                  {items.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              )}
            </article>
          )
        })}
      </div>
    </PageSection>
  )
}
