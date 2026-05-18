import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useFetch } from '../hooks/useFetch'
import { listEvents } from '../api'
import PageSection from '../components/common/PageSection'
import './ClubPages.css'

function formatDate(iso) {
  const d = new Date(iso)
  if (isNaN(d)) return ''
  return d.toLocaleString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })
}

export default function Calendar() {
  const { data: events, loading } = useFetch(listEvents)
  const [mode, setMode] = useState('list')
  const upcoming = useMemo(() => [...(events || [])].sort((a, b) => new Date(a.date) - new Date(b.date)), [events])
  const grouped = upcoming.reduce((acc, event) => {
    const d = new Date(event.date)
    const key = isNaN(d) ? 'Без даты' : d.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })
    acc[key] = acc[key] || []
    acc[key].push(event)
    return acc
  }, {})

  return (
    <PageSection title="Календарь занятий" subtitle="Тренировки, турниры, открытые уроки и сборы">
      <div className="club-toolbar">
        <button className={mode === 'list' ? 'is-active' : ''} onClick={() => setMode('list')}>Лента</button>
        <button className={mode === 'month' ? 'is-active' : ''} onClick={() => setMode('month')}>По месяцам</button>
      </div>
      {loading && <p className="loading-text">Загрузка...</p>}
      {mode === 'list' ? (
        <div className="club-list">
          {upcoming.map(event => (
            <article className="club-panel" key={event.id}>
              <time>{formatDate(event.date)}</time>
              <h3>{event.title}</h3>
              <p>{event.location || 'Место уточняется'}</p>
              <span>{event.status === 'cancelled' ? 'Отменено' : event.type || 'event'}</span>
              <Link to="/events">Открыть запись</Link>
            </article>
          ))}
        </div>
      ) : (
        <div className="club-list">
          {Object.entries(grouped).map(([month, items]) => (
            <section className="club-panel" key={month}>
              <h3>{month}</h3>
              {items.map(event => <p key={event.id}>{formatDate(event.date)} — {event.title}</p>)}
            </section>
          ))}
        </div>
      )}
    </PageSection>
  )
}
