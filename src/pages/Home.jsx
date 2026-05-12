import { Link } from 'react-router-dom'
import { useFetch } from '../hooks/useFetch'
import { getPage, listEvents } from '../api'
import PageSection from '../components/common/PageSection'
import './Home.css'

function formatDateShort(iso) {
  const d = new Date(iso)
  if (isNaN(d)) return ''
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
}

export default function Home() {
  const { data: page } = useFetch(() => getPage('home'))
  const { data: events } = useFetch(listEvents)
  const content = page ? JSON.parse(page.content || '{}') : {}

  const upcoming = (events || [])
    .filter(e => new Date(e.date) > new Date())
    .slice(0, 3)

  return (
    <div className="home">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-bg-overlay" />
        <div className="hero-content page-wrapper">
          <div className="hero-frame">
            <span className="hero-emblem">⚔</span>
            <h1 className="hero-title">
              {content?.hero?.title || 'Ferrum et Gloria'}
            </h1>
            <div className="hero-rule" />
            <p className="hero-subtitle">
              {content?.hero?.subtitle || 'XVI–XVII век · Исторический бой на клинках'}
            </p>
          </div>
          <p className="hero-tagline">
            Железо и слава — не просто слова. Это путь.
          </p>
        </div>
      </section>

      {/* ── Двухколоночный блок: текст + цитата ──────────────────────────── */}
      <section className="home-intro page-wrapper">
        <div className="home-intro-text">
          <span className="home-eyebrow">О школе</span>
          <h2 className="home-intro-title">
            Мы изучаем боевые искусства<br/>европейских мастеров
          </h2>
          <p>
            {content?.intro ||
              'Мы изучаем боевые искусства европейских мастеров эпохи Возрождения — рапиру, дагу, двуручный меч. Наш путь основан на исторических трактатах Сальватора Фабриса, Джорджо Маройяса и других великих мастеров клинка.'
            }
          </p>
          <Link to="/founder" className="home-link-arrow">
            История основателя <span>→</span>
          </Link>
        </div>
        <aside className="home-quote">
          <p className="home-quote-text">
            «Фехтование — это не разрушение, а искусство сохранять жизнь себе и противнику».
          </p>
          <footer className="home-quote-author">Сальватор Фабрис, XVI в.</footer>
        </aside>
      </section>

      {/* ── Ближайшие события (если есть) ─────────────────────────────────── */}
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
                    {e.location && <p>📍 {e.location}</p>}
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* ── Что мы делаем (раздел вместо «столпов»-эмодзи) ───────────────── */}
      <section className="home-disciplines page-wrapper">
        <span className="home-eyebrow">Дисциплины</span>
        <h2 className="home-disciplines-title">Чему мы учим</h2>
        <div className="home-disciplines-grid">
          <article className="home-discipline">
            <h3>Рапира и дага</h3>
            <p>Школы Италии и Испании XVI–XVII вв. — основа классического фехтования: уколы, защиты, обманные действия.</p>
          </article>
          <article className="home-discipline">
            <h3>Двуручный меч</h3>
            <p>Немецкая и итальянская традиции longsword: стойки, мастер-удары, работа в полу-длинных дистанциях.</p>
          </article>
          <article className="home-discipline">
            <h3>Сабля и тесак</h3>
            <p>Гражданское и военное фехтование рубящим оружием XVII–XVIII вв. — динамика, рубящие связки.</p>
          </article>
          <article className="home-discipline">
            <h3>Турнирная подготовка</h3>
            <p>Соревнования HEMA по правилам IFHEMA: спарринги в защитном снаряжении, судейство, тактика.</p>
          </article>
        </div>
      </section>
    </div>
  )
}
