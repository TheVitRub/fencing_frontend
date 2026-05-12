import { useState } from 'react'
import { useFetch } from '../hooks/useFetch'
import { listEvents, getPage } from '../api'
import PageSection from '../components/common/PageSection'
import ImageGallery from '../components/common/ImageGallery'
import './Events.css'

// Возвращает список из 12 фолбэк-эмодзи на разные виды событий —
// если у админа нет картинки, не показываем «пустой прямоугольник».
const FALLBACK_GLYPHS = ['⚔', '🛡', '🏰', '⚜', '🗡']

function formatDateParts(iso) {
  const d = new Date(iso)
  if (isNaN(d)) return { day: '—', month: '', year: '', full: '', time: '' }
  return {
    day:   d.getDate(),
    month: d.toLocaleString('ru-RU', { month: 'short' }).replace('.', ''),
    year:  d.getFullYear(),
    full:  d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }),
    time:  d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
  }
}

function isUpcoming(iso) {
  return new Date(iso) > new Date()
}

function EventRow({ event, idx }) {
  const [expanded, setExpanded] = useState(false)
  const { day, month, year, full, time } = formatDateParts(event.date)
  const images = (event.images && event.images.length > 0)
    ? event.images
    : event.image_url
      ? [event.image_url]
      : []
  const fallback = FALLBACK_GLYPHS[idx % FALLBACK_GLYPHS.length]
  const upcoming = isUpcoming(event.date)
  const longDesc = event.description && event.description.length > 240

  return (
    <article className={`event-row${expanded ? ' is-expanded' : ''}`}>
      <div className="event-row-media">
        {images.length > 0 ? (
          <img src={images[0]} alt={event.title} loading="lazy" />
        ) : (
          <div className="event-row-fallback">{fallback}</div>
        )}
        <div className="event-date-stamp">
          <span className="event-date-stamp-day">{day}</span>
          <span className="event-date-stamp-month">{month}</span>
          <span className="event-date-stamp-year">{year}</span>
        </div>
      </div>

      <div className="event-row-body">
        <div className="event-row-meta">
          <span className={`event-status ${upcoming ? 'event-status--up' : 'event-status--past'}`}>
            {upcoming ? 'Предстоит' : 'Прошло'}
          </span>
          <span className="event-row-time">{full}{time && time !== '00:00' ? ` · ${time}` : ''}</span>
          {event.location && <span className="event-row-loc">📍 {event.location}</span>}
        </div>

        <h3 className="event-row-title">{event.title}</h3>

        {event.description && (
          <p className="event-row-desc">
            {expanded || !longDesc
              ? event.description
              : event.description.slice(0, 240).trimEnd() + '…'}
          </p>
        )}

        {longDesc && (
          <button className="event-row-more" onClick={() => setExpanded(e => !e)}>
            {expanded ? 'Свернуть' : 'Читать полностью'}
          </button>
        )}

        {expanded && images.length > 1 && <ImageGallery images={images} />}
      </div>
    </article>
  )
}

export default function Events() {
  const { data: events, loading, error } = useFetch(listEvents)
  const { data: page } = useFetch(() => getPage('events'))
  const content = page ? JSON.parse(page.content || '{}') : {}
  const [filter, setFilter] = useState('all') // all | upcoming | past

  const filtered = events?.filter(e => {
    if (filter === 'upcoming') return isUpcoming(e.date)
    if (filter === 'past')     return !isUpcoming(e.date)
    return true
  }) || []

  const upcomingCount = events?.filter(e => isUpcoming(e.date)).length || 0
  const pastCount = (events?.length || 0) - upcomingCount

  return (
    <PageSection
      title={page?.title || 'События'}
      subtitle={content?.subtitle || 'Турниры, показательные выступления, открытые тренировки'}
    >
      {loading && <p className="loading-text">Загрузка…</p>}
      {error  && <p className="error-text">Ошибка загрузки событий</p>}

      {events && events.length > 0 && (
        <div className="event-filter">
          <button
            className={`event-filter-btn${filter === 'all' ? ' is-active' : ''}`}
            onClick={() => setFilter('all')}
          >Все <span>{events.length}</span></button>
          <button
            className={`event-filter-btn${filter === 'upcoming' ? ' is-active' : ''}`}
            onClick={() => setFilter('upcoming')}
          >Предстоящие <span>{upcomingCount}</span></button>
          <button
            className={`event-filter-btn${filter === 'past' ? ' is-active' : ''}`}
            onClick={() => setFilter('past')}
          >Прошедшие <span>{pastCount}</span></button>
        </div>
      )}

      {events && events.length === 0 && (
        <div className="event-empty">
          <p className="event-empty-glyph">⚔</p>
          <p>Событий пока нет</p>
          <small>Следите за обновлениями</small>
        </div>
      )}

      <div className="event-list">
        {filtered.map((e, i) => (
          <EventRow key={e.id} event={e} idx={i} />
        ))}
      </div>
    </PageSection>
  )
}
