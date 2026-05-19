import { useMemo, useState } from 'react'
import { useFetch } from '../hooks/useFetch'
import { listGlossary } from '../api'
import PageSection from '../components/common/PageSection'
import './ClubPages.css'

function termImage(term) {
  return term.image_url || term.images?.[0] || ''
}
export default function Glossary() {
  const { data: terms, loading } = useFetch(listGlossary)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('Все')
  const [selectedId, setSelectedId] = useState(null)

  const allTerms = terms || []
  const categories = useMemo(() => ['Все', ...Array.from(new Set(allTerms.map(term => term.category || 'Без раздела')))], [allTerms])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return allTerms.filter(term => {
      const categoryOk = category === 'Все' || (term.category || 'Без раздела') === category
      const textOk = !q
        || term.term.toLowerCase().includes(q)
        || term.definition.toLowerCase().includes(q)
        || (term.category || '').toLowerCase().includes(q)
      return categoryOk && textOk
    })
  }, [allTerms, category, query])

  const selected = filtered.find(term => term.id === selectedId) || filtered[0]

  return (
    <PageSection title="Глоссарий" subtitle="Техника, тактика, оружие и короткие объяснения">
      <div className="glossary-layout">
        <aside className="glossary-index">
          <div className="club-search">
            <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Найти термин" />
          </div>
          <div className="glossary-categories">
            {categories.map(item => (
              <button
                type="button"
                key={item}
                className={category === item ? 'is-active' : ''}
                onClick={() => {
                  setCategory(item)
                  setSelectedId(null)
                }}
              >
                {item}
              </button>
            ))}
          </div>
        </aside>

        <section className="glossary-stage">
          {selected && (
            <article className="glossary-feature">
              <div className="glossary-feature-media">
                {termImage(selected) ? (
                  <img src={termImage(selected)} alt={selected.term} />
                ) : (
                  <span className="glossary-feature-placeholder" aria-hidden="true">
                    <strong>{selected.term.slice(0, 1)}</strong>
                    <small>{selected.category || 'Термин'}</small>
                  </span>
                )}
              </div>
              <div>
                <span>{selected.category || 'Термин'}</span>
                <h3>{selected.term}</h3>
                <p>{selected.definition}</p>
                {selected.images?.length > 1 && (
                  <div className="glossary-thumbs">
                    {selected.images.slice(1).map(url => <img src={url} alt="" key={url} />)}
                  </div>
                )}
              </div>
            </article>
          )}

          {loading && <p className="loading-text">Загрузка...</p>}
          <div className="glossary-grid">
            {filtered.map(term => (
              <button
                type="button"
                className={`glossary-term${selected?.id === term.id ? ' is-active' : ''}`}
                key={term.id}
                onClick={() => setSelectedId(term.id)}
              >
                <span>{term.term.slice(0, 1)}</span>
                <strong>{term.term}</strong>
                <small>{term.category || 'Термин'}</small>
              </button>
            ))}
          </div>
          {!loading && filtered.length === 0 && <p className="club-empty">Ничего не найдено.</p>}
        </section>
      </div>
    </PageSection>
  )
}
