import { useEffect, useMemo, useState } from 'react'
import { useFetch } from '../hooks/useFetch'
import { listEvents, getPage } from '../api'
import ImageGallery from '../components/common/ImageGallery'
import PageSection from '../components/common/PageSection'
import './Events.css'

const COMMENT_STORAGE_KEY = 'fc_event_comments_v1'
const REACTION_STORAGE_KEY = 'fc_event_reactions_v1'
const FALLBACK_GLYPHS = ['⚔', '♜', '✦', '◇', '†']
const REACTION_OPTIONS = [
  { id: 'attend', label: 'Буду' },
  { id: 'thanks', label: 'Спасибо' },
  { id: 'question', label: 'Вопрос' },
]

function parsePageContent(page) {
  try {
    return page ? JSON.parse(page.content || '{}') : {}
  } catch {
    return {}
  }
}

function readStorage(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function formatDateParts(iso) {
  const d = new Date(iso)
  if (isNaN(d)) return { day: '—', month: '', year: '', full: '', time: '' }
  return {
    day: d.getDate(),
    month: d.toLocaleString('ru-RU', { month: 'short' }).replace('.', ''),
    year: d.getFullYear(),
    full: d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }),
    time: d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
  }
}

function formatClock(date) {
  return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}

function formatCommentTime(iso) {
  const d = new Date(iso)
  if (isNaN(d)) return ''
  return d.toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).replace('.', '')
}

function isUpcoming(iso) {
  return new Date(iso) > new Date()
}

function EventComments({ eventId, comments, onAddComment }) {
  const [author, setAuthor] = useState('')
  const [text, setText] = useState('')

  function submitComment(e) {
    e.preventDefault()
    const cleanText = text.trim()
    if (!cleanText) return

    onAddComment(eventId, {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      author: author.trim() || 'Гость зала',
      text: cleanText,
      createdAt: new Date().toISOString(),
    })
    setText('')
  }

  return (
    <div className="event-comments">
      <div className="event-comments-head">
        <h4>Реплики у стойки</h4>
        <span>{comments.length}</span>
      </div>

      {comments.length > 0 ? (
        <div className="event-comment-list">
          {comments.map(comment => (
            <article className="event-comment" key={comment.id}>
              <div>
                <strong>{comment.author}</strong>
                <time>{formatCommentTime(comment.createdAt)}</time>
              </div>
              <p>{comment.text}</p>
            </article>
          ))}
        </div>
      ) : (
        <p className="event-comment-empty">Пока тихо. Первая короткая реплика задаст тон обсуждению.</p>
      )}

      <form className="event-comment-form" onSubmit={submitComment}>
        <input
          value={author}
          onChange={e => setAuthor(e.target.value)}
          maxLength={32}
          placeholder="Имя"
        />
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          maxLength={280}
          placeholder="Комментарий к записи"
        />
        <button type="submit">Отправить</button>
      </form>
    </div>
  )
}

function EventRow({ event, idx, comments, reactions, onAddComment, onReact }) {
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
          {event.location && <span className="event-row-loc">{event.location}</span>}
        </div>

        <h3 className="event-row-title">{event.title}</h3>

        {event.description && (
          <p className="event-row-desc">
            {expanded || !longDesc
              ? event.description
              : event.description.slice(0, 240).trimEnd() + '…'}
          </p>
        )}

        <div className="event-row-actions">
          {longDesc && (
            <button className="event-row-more" onClick={() => setExpanded(e => !e)}>
              {expanded ? 'Свернуть' : 'Читать полностью'}
            </button>
          )}

          <div className="event-reactions" aria-label="Реакции">
            {REACTION_OPTIONS.map(option => (
              <button key={option.id} onClick={() => onReact(event.id, option.id)}>
                {option.label} <span>{reactions?.[option.id] || 0}</span>
              </button>
            ))}
          </div>
        </div>

        {expanded && images.length > 1 && <ImageGallery images={images} />}

        <EventComments
          eventId={event.id}
          comments={comments}
          onAddComment={onAddComment}
        />
      </div>
    </article>
  )
}

export default function Events() {
  const { data: events, loading, error } = useFetch(listEvents)
  const { data: page } = useFetch(() => getPage('events'))
  const content = parsePageContent(page)
  const [filter, setFilter] = useState('all')
  const [now, setNow] = useState(() => new Date())
  const [commentsByEvent, setCommentsByEvent] = useState(() => readStorage(COMMENT_STORAGE_KEY, {}))
  const [reactionsByEvent, setReactionsByEvent] = useState(() => readStorage(REACTION_STORAGE_KEY, {}))

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    window.localStorage.setItem(COMMENT_STORAGE_KEY, JSON.stringify(commentsByEvent))
  }, [commentsByEvent])

  useEffect(() => {
    window.localStorage.setItem(REACTION_STORAGE_KEY, JSON.stringify(reactionsByEvent))
  }, [reactionsByEvent])

  const sortedEvents = useMemo(() => {
    return [...(events || [])].sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [events])

  const filtered = sortedEvents.filter(e => {
    if (filter === 'upcoming') return isUpcoming(e.date)
    if (filter === 'past') return !isUpcoming(e.date)
    return true
  })

  const upcomingCount = sortedEvents.filter(e => isUpcoming(e.date)).length
  const pastCount = sortedEvents.length - upcomingCount
  const commentCount = Object.values(commentsByEvent).reduce((sum, list) => sum + (Array.isArray(list) ? list.length : 0), 0)
  const nextEvent = [...sortedEvents].reverse().find(e => isUpcoming(e.date))

  function addComment(eventId, comment) {
    setCommentsByEvent(current => ({
      ...current,
      [eventId]: [...(current[eventId] || []), comment],
    }))
  }

  function addReaction(eventId, reactionId) {
    setReactionsByEvent(current => ({
      ...current,
      [eventId]: {
        ...(current[eventId] || {}),
        [reactionId]: ((current[eventId] || {})[reactionId] || 0) + 1,
      },
    }))
  }

  return (
    <PageSection
      title={page?.title || 'События'}
      subtitle={content?.subtitle || 'Турниры, открытые тренировки, показательные выступления и короткие записи клубной жизни'}
    >
      <div className="event-broadcast">
        <div className="event-broadcast-main">
          <span className="event-broadcast-kicker">Новостная сводка</span>
          <h3>{nextEvent ? nextEvent.title : 'Клубная хроника в рабочем режиме'}</h3>
          <p>
            {nextEvent
              ? `Следующая заметка в календаре: ${formatDateParts(nextEvent.date).full}.`
              : 'Когда администратор добавит событие, оно сразу попадёт в эту ленту.'}
          </p>
        </div>
        <div className="event-broadcast-stats">
          <span><strong>{formatClock(now)}</strong> сейчас</span>
          <span><strong>{sortedEvents.length}</strong> записей</span>
          <span><strong>{commentCount}</strong> реплик</span>
        </div>
      </div>

      {loading && <p className="loading-text">Загрузка…</p>}
      {error && <p className="error-text">Ошибка загрузки событий</p>}

      {sortedEvents.length > 0 && (
        <div className="event-filter">
          <button
            className={`event-filter-btn${filter === 'all' ? ' is-active' : ''}`}
            onClick={() => setFilter('all')}
          >Все <span>{sortedEvents.length}</span></button>
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

      {sortedEvents.length === 0 && !loading && (
        <div className="event-empty">
          <p className="event-empty-glyph">⚔</p>
          <p>Событий пока нет</p>
          <small>Сводка начнётся с первой публикации</small>
        </div>
      )}

      <div className="event-list">
        {filtered.map((e, i) => (
          <EventRow
            key={e.id}
            event={e}
            idx={i}
            comments={commentsByEvent[e.id] || []}
            reactions={reactionsByEvent[e.id] || {}}
            onAddComment={addComment}
            onReact={addReaction}
          />
        ))}
      </div>
    </PageSection>
  )
}
