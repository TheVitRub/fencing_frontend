import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useFetch } from '../hooks/useFetch'
import { useAuth } from '../context/AuthContext'
import { attendEvent, createComment, getPage, listComments, listEventAttendees, listEvents } from '../api'
import ImageGallery from '../components/common/ImageGallery'
import PageSection from '../components/common/PageSection'
import { readAttendingEvents, rememberAttendance } from '../utils/attendanceStorage'
import { formatSchoolCommentTime, formatSchoolDate, formatSchoolTime, getSchoolDateParts } from '../utils/schoolTime'
import './Events.css'

const FALLBACK_GLYPHS = ['⚔', '♜', '✦', '◇', '†']

function parsePageContent(page) {
  try {
    return page ? JSON.parse(page.content || '{}') : {}
  } catch {
    return {}
  }
}

function formatDateParts(iso) {
  const parts = getSchoolDateParts(iso)
  if (!parts) return { day: '—', month: '', year: '', full: '', time: '' }
  return {
    day: parts.day,
    month: formatSchoolDate(iso, { month: 'short' }).replace('.', ''),
    year: parts.year,
    full: formatSchoolDate(iso, { day: 'numeric', month: 'long', year: 'numeric' }),
    time: formatSchoolTime(iso),
  }
}

function formatClock(date) {
  return formatSchoolTime(date)
}

function formatCommentTime(iso) {
  return formatSchoolCommentTime(iso)
}

function isUpcoming(iso) {
  return new Date(iso) > new Date()
}

function EventComments({ eventId }) {
  const { isAuthenticated } = useAuth()
  const [comments, setComments] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)

  const load = async () => setComments(await listComments('event', eventId))

  useEffect(() => {
    load().catch(() => setComments([]))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId])

  async function submitComment(e) {
    e.preventDefault()
    const body = text.trim()
    if (!body || !isAuthenticated) return
    setLoading(true)
    try {
      await createComment({ target_type: 'event', target_id: eventId, body })
      setText('')
      await load()
    } finally {
      setLoading(false)
    }
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
                <strong>{comment.user_display_name}</strong>
                <time>{formatCommentTime(comment.created_at)}</time>
              </div>
              <p>{comment.body}</p>
            </article>
          ))}
        </div>
      ) : (
        <p className="event-comment-empty">Пока тихо. Первая короткая реплика задаст тон обсуждению.</p>
      )}

      {isAuthenticated ? (
        <form className="event-comment-form" onSubmit={submitComment}>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            maxLength={280}
            placeholder="Комментарий к записи"
          />
          <button type="submit" disabled={loading}>{loading ? '...' : 'Отправить'}</button>
        </form>
      ) : (
        <p className="event-comment-empty"><Link to="/login">Войдите или зарегистрируйтесь</Link>, чтобы оставить комментарий.</p>
      )}
    </div>
  )
}

function EventRow({ event, idx }) {
  const { isAuthenticated, user } = useAuth()
  const [expanded, setExpanded] = useState(false)
  const [attending, setAttending] = useState(() => !!readAttendingEvents(user)[event.id])
  const [attendeeCount, setAttendeeCount] = useState(null)
  const [attendanceBusy, setAttendanceBusy] = useState(false)
  const [attendanceError, setAttendanceError] = useState('')
  const { day, month, year, full, time } = formatDateParts(event.date)
  const images = (event.images && event.images.length > 0) ? event.images : event.image_url ? [event.image_url] : []
  const fallback = FALLBACK_GLYPHS[idx % FALLBACK_GLYPHS.length]
  const upcoming = isUpcoming(event.date)
  const longDesc = event.description && event.description.length > 240

  useEffect(() => {
    setAttending(!!readAttendingEvents(user)[event.id])
  }, [event.id, user?.id])

  useEffect(() => {
    let cancelled = false
    if (!upcoming) return undefined
    listEventAttendees(event.id)
      .then(items => {
        if (cancelled) return
        setAttendeeCount(items.length)
        if (user?.id && items.some(item => item.user_id === user.id)) {
          setAttending(true)
          rememberAttendance(user, event.id)
        }
      })
      .catch(() => {
        if (!cancelled) setAttendeeCount(null)
      })
    return () => {
      cancelled = true
    }
  }, [event.id, upcoming, user?.id])

  async function markGoing() {
    if (!isAuthenticated || attending || attendanceBusy) return
    setAttendanceBusy(true)
    setAttendanceError('')
    try {
      await attendEvent(event.id, 'going')
      setAttending(true)
      rememberAttendance(user, event.id)
      setAttendeeCount(count => typeof count === 'number' ? count + 1 : count)
    } catch (err) {
      setAttendanceError(err?.response?.data?.error || 'Не удалось записаться. Попробуйте еще раз.')
    } finally {
      setAttendanceBusy(false)
    }
  }

  return (
    <article className={`event-row${expanded ? ' is-expanded' : ''}`}>
      <div className={`event-row-media${images.length > 0 ? ' has-image' : ' has-fallback'}`}>
        {images.length > 0 ? <img src={images[0]} alt={event.title} loading="lazy" /> : <div className="event-row-fallback">{fallback}</div>}
        <div className="event-date-stamp">
          <span className="event-date-stamp-day">{day}</span>
          <span className="event-date-stamp-month">{month}</span>
          <span className="event-date-stamp-year">{year}</span>
        </div>
      </div>

      <div className="event-row-body">
        <div className="event-row-meta">
          <span className={`event-status ${upcoming ? 'event-status--up' : 'event-status--past'}`}>
            {event.status === 'cancelled' ? 'Отменено' : upcoming ? 'Предстоит' : 'Прошло'}
          </span>
          <span className="event-row-time">{full}{time && time !== '00:00' ? ` · ${time}` : ''}</span>
          {event.location && <span className="event-row-loc">{event.location}</span>}
        </div>

        <h3 className="event-row-title">{event.title}</h3>

        {event.description && (
          <p className="event-row-desc">
            {expanded || !longDesc ? event.description : event.description.slice(0, 240).trimEnd() + '…'}
          </p>
        )}

        <div className="event-row-actions">
          {longDesc && (
            <button className="event-row-more" onClick={() => setExpanded(e => !e)}>
              {expanded ? 'Свернуть' : 'Читать полностью'}
            </button>
          )}
          {upcoming && event.status !== 'cancelled' && (
            isAuthenticated
              ? <button className="event-row-more" onClick={markGoing} disabled={attending || attendanceBusy}>{attendanceBusy ? 'Записываю...' : attending ? 'Вы записаны' : 'Я приду'}</button>
              : <Link className="event-row-more" to={`/login?next=/events&attend=${event.id}`}>Войти и записаться</Link>
          )}
          {typeof attendeeCount === 'number' && (
            <span className="event-attendee-count">{attendeeCount} придут</span>
          )}
        </div>
        {attendanceError && <p className="event-attendance-error">{attendanceError}</p>}

        {expanded && images.length > 1 && <ImageGallery images={images} />}
        <EventComments eventId={event.id} />
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

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30000)
    return () => window.clearInterval(timer)
  }, [])

  const sortedEvents = useMemo(() => [...(events || [])].sort((a, b) => new Date(b.date) - new Date(a.date)), [events])
  const filtered = sortedEvents.filter(e => {
    if (filter === 'upcoming') return isUpcoming(e.date)
    if (filter === 'past') return !isUpcoming(e.date)
    return true
  })
  const upcomingCount = sortedEvents.filter(e => isUpcoming(e.date)).length
  const pastCount = sortedEvents.length - upcomingCount
  const nextEvent = [...sortedEvents].reverse().find(e => isUpcoming(e.date))

  return (
    <PageSection
      title={page?.title || 'События'}
      subtitle={content?.subtitle || 'Турниры, открытые тренировки, показательные выступления и короткие записи клубной жизни'}
    >
      <div className="event-broadcast">
        <div className="event-broadcast-main">
          <span className="event-broadcast-kicker">Новостная сводка</span>
          <h3>{nextEvent ? nextEvent.title : 'Клубная хроника в рабочем режиме'}</h3>
          <p>{nextEvent ? `Следующая заметка в календаре: ${formatDateParts(nextEvent.date).full}.` : 'Когда администратор добавит событие, оно сразу попадёт в эту ленту.'}</p>
        </div>
        <div className="event-broadcast-stats">
          <span><strong>{formatClock(now)}</strong> сейчас</span>
          <span><strong>{sortedEvents.length}</strong> записей</span>
          <span><strong>{upcomingCount}</strong> впереди</span>
        </div>
      </div>

      {loading && <p className="loading-text">Загрузка…</p>}
      {error && <p className="error-text">Ошибка загрузки событий</p>}

      {sortedEvents.length > 0 && (
        <div className="event-filter">
          <button className={`event-filter-btn${filter === 'all' ? ' is-active' : ''}`} onClick={() => setFilter('all')}>Все <span>{sortedEvents.length}</span></button>
          <button className={`event-filter-btn${filter === 'upcoming' ? ' is-active' : ''}`} onClick={() => setFilter('upcoming')}>Предстоящие <span>{upcomingCount}</span></button>
          <button className={`event-filter-btn${filter === 'past' ? ' is-active' : ''}`} onClick={() => setFilter('past')}>Прошедшие <span>{pastCount}</span></button>
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
        {filtered.map((e, i) => <EventRow key={e.id} event={e} idx={i} />)}
      </div>
    </PageSection>
  )
}
