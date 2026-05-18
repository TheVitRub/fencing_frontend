import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useFetch } from '../hooks/useFetch'
import { getPage, listEvents } from '../api'
import { formatSchoolDate, formatSchoolTime } from '../utils/schoolTime'
import './Home.css'

function parsePageContent(page) {
  try {
    return page ? JSON.parse(page.content || '{}') : {}
  } catch {
    return {}
  }
}

function formatDateShort(iso) {
  return formatSchoolDate(iso, { day: 'numeric', month: 'long' })
}

function formatClock(date) {
  return formatSchoolTime(date)
}

function formatBulletinTime(iso) {
  const d = new Date(iso)
  if (isNaN(d)) return 'Сейчас'

  const date = formatSchoolDate(iso, { day: 'numeric', month: 'short' }).replace('.', '')
  const time = formatSchoolTime(iso)
  return time === '00:00' ? date : `${date}, ${time}`
}

function isUpcoming(iso) {
  return new Date(iso) > new Date()
}

export default function Home() {
  const { data: page } = useFetch(() => getPage('home'))
  const { data: events } = useFetch(listEvents)
  const [now, setNow] = useState(() => new Date())
  const content = parsePageContent(page)

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30000)
    return () => window.clearInterval(timer)
  }, [])

  const orderedEvents = useMemo(() => {
    return [...(events || [])].sort((a, b) => new Date(a.date) - new Date(b.date))
  }, [events])

  const upcoming = orderedEvents.filter(e => isUpcoming(e.date)).slice(0, 3)
  const latest = [...(events || [])]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 3)

  const bulletinItems = useMemo(() => {
    const source = [
      ...orderedEvents.filter(event => isUpcoming(event.date)),
      ...[...orderedEvents].reverse().filter(event => !isUpcoming(event.date)),
    ].filter((event, index, list) => list.findIndex(item => item.id === event.id) === index).slice(0, 5)

    if (source.length === 0) {
      return [
        { time: formatClock(now), kind: 'Дежурная строка', title: 'Зал готов к тренировкам', note: 'Новости появятся после первых публикаций администратора.' },
        { time: '20-30', kind: 'Состав', title: 'Камерная школа', note: 'Основатель, инструкторы и небольшой круг учеников.' },
        { time: 'Открыто', kind: 'Гости', title: 'Можно следить со стороны', note: 'Для друзей школы и коллег из других городов.' },
      ]
    }

    return source.map(event => ({
      time: formatBulletinTime(event.date),
      kind: isUpcoming(event.date) ? 'Анонс' : 'Итог',
      title: event.title,
      note: event.location || 'Клубная хроника',
    }))
  }, [orderedEvents, now])

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-bg-overlay" />
        <div className="hero-content page-wrapper">
          <div className="hero-stage">
            <div className="hero-main">
              <div className="hero-frame">
                <span className="hero-emblem">⚔</span>
                <h1 className="hero-title">
                  {content?.hero?.title || 'Ferrum et Gloria'}
                </h1>
                <div className="hero-rule" />
                <p className="hero-subtitle">
                  {content?.hero?.subtitle || 'XVI-XVII век · исторический бой на клинках'}
                </p>
              </div>
              <p className="hero-tagline">
                Железо и слава не просто слова. Это путь, который виден в тренировках, турнирах и ежедневной работе зала.
              </p>
            </div>

            <aside className="hero-dispatch" aria-label="Клубная сводка">
              <div className="hero-dispatch-top">
                <span>Сводка клуба</span>
                <time>{formatClock(now)}</time>
              </div>
              <div className="hero-dispatch-signal">
                <strong>{upcoming.length > 0 ? upcoming[0].title : 'Тренировочный режим'}</strong>
                <small>{upcoming.length > 0 ? `Ближайшая запись: ${formatDateShort(upcoming[0].date)}` : 'Небольшая школа, живой ритм, точные объявления.'}</small>
              </div>
              <Link to="/events" className="hero-dispatch-link">Открыть хронику <span>→</span></Link>
            </aside>
          </div>
        </div>
      </section>

      <section className="home-broadcast page-wrapper">
        <div className="home-broadcast-header">
          <div>
            <span className="home-eyebrow">Живая лента</span>
            <h2 className="home-broadcast-title">Новости школы в формате сводки</h2>
          </div>
          <div className="home-broadcast-clock">
            <span>Местное время</span>
            <strong>{formatClock(now)}</strong>
          </div>
        </div>

        <div className="home-broadcast-grid">
          <div className="home-news-tape">
            {bulletinItems.map((item, index) => (
              <article className="home-news-item" key={`${item.title}-${index}`}>
                <time>{item.time}</time>
                <div>
                  <span>{item.kind}</span>
                  <h3>{item.title}</h3>
                  <p>{item.note}</p>
                </div>
              </article>
            ))}
          </div>

          <aside className="home-club-scale">
            <span className="home-eyebrow">Масштаб</span>
            <h3>Закрытый круг, открытая хроника</h3>
            <p>
              Сайт рассчитан на школу примерно из 20-30 человек, основателя, нескольких инструкторов и малое число внешних зрителей. Поэтому лента выглядит как точный клубный журнал, а не как шумная социальная сеть.
            </p>
            <div className="home-scale-grid" aria-label="Состав школы">
              <span><strong>1</strong> основатель</span>
              <span><strong>3-4</strong> инструктора</span>
              <span><strong>20-30</strong> учеников</span>
              <span><strong>+</strong> гости школ</span>
            </div>
          </aside>
        </div>
      </section>

      <section className="home-intro page-wrapper">
        <div className="home-intro-text">
          <span className="home-eyebrow">О школе</span>
          <h2 className="home-intro-title">
            Мы изучаем боевые искусства<br />европейских мастеров
          </h2>
          <p>
            {content?.intro ||
              'Мы изучаем боевые искусства европейских мастеров эпохи Возрождения: рапиру, дагу, двуручный меч, саблю и тесак. Наш путь основан на исторических трактатах, аккуратной технике и уважении к партнёру.'
            }
          </p>
          <Link to="/founder" className="home-link-arrow">
            История основателя <span>→</span>
          </Link>
        </div>
        <aside className="home-quote">
          <p className="home-quote-text">
            «Фехтование начинается там, где сила уступает место вниманию».
          </p>
          <footer className="home-quote-author">Клубная заметка Ferrum et Gloria</footer>
        </aside>
      </section>

      {upcoming.length > 0 && (
        <section className="home-upcoming page-wrapper">
          <header className="home-upcoming-header">
            <div>
              <span className="home-eyebrow">Афиша</span>
              <h2 className="home-upcoming-title">Ближайшие события</h2>
            </div>
            <Link to="/events" className="home-link-arrow">Все события <span>→</span></Link>
          </header>
          <div className="home-upcoming-grid">
            {upcoming.map(e => {
              const cover = (e.images && e.images[0]) || e.image_url
              return (
                <Link to="/events" className="home-upcoming-card" key={e.id}>
                  <div className="home-upcoming-media">
                    {cover
                      ? <img src={cover} alt={e.title} loading="lazy" />
                      : <span className="home-upcoming-glyph">⚔</span>
                    }
                  </div>
                  <div className="home-upcoming-body">
                    <span className="home-upcoming-date">{formatDateShort(e.date)}</span>
                    <h3>{e.title}</h3>
                    {e.location && <p>{e.location}</p>}
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {latest.length > 0 && (
        <section className="home-field-notes page-wrapper">
          <span className="home-eyebrow">После боя</span>
          <h2 className="home-field-title">Последние записи хроники</h2>
          <div className="home-field-grid">
            {latest.map(event => (
              <article className="home-field-card" key={event.id}>
                <time>{formatDateShort(event.date)}</time>
                <h3>{event.title}</h3>
                <p>{event.description || event.location || 'Короткая запись в клубном журнале.'}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="home-disciplines page-wrapper">
        <span className="home-eyebrow">Дисциплины</span>
        <h2 className="home-disciplines-title">Чему мы учим</h2>
        <div className="home-disciplines-grid">
          <article className="home-discipline">
            <h3>Рапира и дага</h3>
            <p>Итальянская и испанская традиции XVI-XVII веков: уколы, защиты, работа второй рукой и обманные действия.</p>
          </article>
          <article className="home-discipline">
            <h3>Двуручный меч</h3>
            <p>Немецкая и итальянская традиции longsword: стойки, мастер-удары, контроль дистанции и переходы в ближний бой.</p>
          </article>
          <article className="home-discipline">
            <h3>Сабля и тесак</h3>
            <p>Гражданское и военное фехтование рубящим оружием: темп, связки, защита корпуса и работа по линии атаки.</p>
          </article>
          <article className="home-discipline">
            <h3>Турнирная подготовка</h3>
            <p>Спарринги в защитном снаряжении, судейство, тактика и спокойная работа под давлением зрителей.</p>
          </article>
        </div>
      </section>
    </div>
  )
}
