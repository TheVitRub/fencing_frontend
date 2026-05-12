import { useFetch } from '../hooks/useFetch'
import { listPlans, getPage } from '../api'
import PageSection from '../components/common/PageSection'
import './Plans.css'

function PlanCard({ p, idx }) {
  let items = []
  try { items = JSON.parse(p.items) } catch { /* ignore */ }

  return (
    <article className="plan-card">
      <div className="plan-card-header">
        <span className="plan-card-num">{String(idx + 1).padStart(2, '0')}</span>
        <div>
          <h3 className="plan-card-title">{p.title}</h3>
          <p className="plan-card-period">{p.period}</p>
        </div>
      </div>

      {p.description && (
        <p className="plan-card-desc">{p.description}</p>
      )}

      {items.length > 0 && (
        <>
          <div className="plan-card-divider">
            <span>Программа</span>
            <small>{items.length} {pluralize(items.length, ['модуль', 'модуля', 'модулей'])}</small>
          </div>
          <ol className="plan-card-items">
            {items.map((it, i) => (
              <li key={i}>
                <span className="plan-item-marker" />
                {it}
              </li>
            ))}
          </ol>
        </>
      )}
    </article>
  )
}

export default function Plans() {
  const { data: plans, loading, error } = useFetch(listPlans)
  const { data: page } = useFetch(() => getPage('plans'))
  const content = page ? JSON.parse(page.content || '{}') : {}

  return (
    <PageSection
      title={page?.title || 'Учебные планы'}
      subtitle={content?.subtitle || 'Программа обучения на каждый период'}
    >
      {loading && <p className="loading-text">Загрузка…</p>}
      {error  && <p className="error-text">Ошибка загрузки планов</p>}

      {plans && plans.length === 0 && (
        <div className="plan-empty">
          <p>Учебные планы пока не опубликованы</p>
        </div>
      )}

      <div className="plan-grid">
        {plans?.map((p, idx) => <PlanCard key={p.id} p={p} idx={idx} />)}
      </div>
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
