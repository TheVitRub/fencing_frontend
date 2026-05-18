import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { attendEvent, listEvents } from '../api'
import { useFetch } from '../hooks/useFetch'
import PageSection from '../components/common/PageSection'
import './ClubPages.css'

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate()
}

function formatTime(iso) {
  const d = new Date(iso)
  if (isNaN(d)) return ''
  return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}

function isFutureEvent(event) {
  return new Date(event.date) >= startOfDay(new Date())
}

function buildMonthDays(monthDate) {
  const first = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
  const startOffset = (first.getDay() + 6) % 7
  const gridStart = new Date(first)
  gridStart.setDate(first.getDate() - startOffset)

  return Array.from({ length: 42 }, (_, index) => {
    const d = new Date(gridStart)
    d.setDate(gridStart.getDate() + index)
    return d
  })
}

function eventLabel(event) {
  return event.discipline || (event.title?.toLowerCase().includes('courtsword') ? 'CourtSword' : event.type || 'Занятие')
}

export default function Calendar() {
  const { data: events, loading, setData } = useFetch(listEvents)
  const { isAuthenticated } = useAuth()
  const [monthDate, setMonthDate] = useState(() => new Date())
  const [attending, setAttending] = useState({})
  const today = startOfDay(new Date())

  const monthEvents = useMemo(() => {
    return (events || [])
      .filter(event => {
        const d = new Date(event.date)
        return !isNaN(d)
          && d.getFullYear() === monthDate.getFullYear()
          && d.getMonth() === monthDate.getMonth()
          && d >= today
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date))
  }, [events, monthDate, today])

  const days = useMemo(() => buildMonthDays(monthDate), [monthDate])
  const monthTitle = monthDate.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })

  function shiftMonth(delta) {
    setMonthDate(current => new Date(current.getFullYear(), current.getMonth() + delta, 1))
  }

  async function markGoing(event) {
    if (!isAuthenticated) return
    await attendEvent(event.id, 'going')
    setAttending(current => ({ ...current, [event.id]: true }))
    if (setData) setData(await listEvents())
  }

  return (
    <PageSection title="Календарь занятий" subtitle="Месяц занятий, дисциплина и запись прямо в ячейке">
      <div className="calendar-shell">
        <header className="calendar-head">
          <button type="button" onClick={() => shiftMonth(-1)} aria-label="Предыдущий месяц">‹</button>
          <div>
            <span>Расписание</span>
            <h3>{monthTitle}</h3>
          </div>
          <button type="button" onClick={() => shiftMonth(1)} aria-label="Следующий месяц">›</button>
        </header>

        <div className="calendar-actions">
          <button type="button" onClick={() => setMonthDate(new Date())}>Сегодня</button>
          <span>{monthEvents.length} занятий в месяце</span>
        </div>

        {loading && <p className="loading-text">Загрузка...</p>}

        <div className="calendar-grid">
          {WEEKDAYS.map(day => <div className="calendar-weekday" key={day}>{day}</div>)}
          {days.map(day => {
            const inMonth = day.getMonth() === monthDate.getMonth()
            const dayEvents = monthEvents.filter(event => sameDay(new Date(event.date), day))
            const pastDay = day < startOfDay(new Date())

            const isToday = sameDay(day, today)

            return (
              <div className={`calendar-day${inMonth ? '' : ' is-muted'}${pastDay ? ' is-past' : ''}${isToday ? ' is-today' : ''}`} key={day.toISOString()}>
                <span className="calendar-day-number">{day.getDate()}</span>
                <div className="calendar-day-events">
                  {dayEvents.map(event => {
                    const canAttend = isFutureEvent(event) && event.status !== 'cancelled'
                    return (
                      <article className={`calendar-event${event.status === 'cancelled' ? ' is-cancelled' : ''}`} key={event.id}>
                        <div className="calendar-event-top">
                          <time>{formatTime(event.date)}</time>
                          <strong>{eventLabel(event)}</strong>
                        </div>
                        <p>{event.title}</p>
                        {event.location && <small>{event.location}</small>}
                        {canAttend && (
                          isAuthenticated
                            ? <button type="button" onClick={() => markGoing(event)}>{attending[event.id] ? 'Вы записаны' : 'Записаться'}</button>
                            : <Link to="/login">Войти для записи</Link>
                        )}
                      </article>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </PageSection>
  )
}
