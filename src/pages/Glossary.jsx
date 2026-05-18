import { useMemo, useState } from 'react'
import { useFetch } from '../hooks/useFetch'
import { listGlossary } from '../api'
import PageSection from '../components/common/PageSection'
import './ClubPages.css'

export default function Glossary() {
  const { data: terms, loading } = useFetch(listGlossary)
  const [query, setQuery] = useState('')
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return (terms || []).filter(t => !q || t.term.toLowerCase().includes(q) || t.definition.toLowerCase().includes(q))
  }, [terms, query])

  return (
    <PageSection title="Глоссарий" subtitle="Термины, оружие, стойки и короткие объяснения">
      <div className="club-search">
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Найти термин" />
      </div>
      {loading && <p className="loading-text">Загрузка...</p>}
      <div className="club-card-grid">
        {filtered.map(term => (
          <article className="club-panel" key={term.id}>
            <span>{term.category || 'Термин'}</span>
            <h3>{term.term}</h3>
            <p>{term.definition}</p>
          </article>
        ))}
      </div>
    </PageSection>
  )
}
