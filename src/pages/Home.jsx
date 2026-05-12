import { useFetch } from '../hooks/useFetch'
import { getPage } from '../api'
import PageSection from '../components/common/PageSection'
import './Home.css'

export default function Home() {
  const { data: page } = useFetch(() => getPage('home'))
  const content = page ? JSON.parse(page.content || '{}') : {}

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-bg-overlay" />
        <div className="hero-content page-wrapper">
          <div className="hero-emblem">⚔</div>
          <h1 className="hero-title">
            {content?.hero?.title || 'Школа фехтования'}
          </h1>
          <p className="hero-subtitle">
            {content?.hero?.subtitle || 'XVI–XVII век · Исторический бой на клинках'}
          </p>
          <div className="hero-rule" />
          <p className="hero-tagline">
            Железо и слава — не просто слова. Это путь.
          </p>
        </div>
      </section>

      <PageSection title="О школе" centered>
        <p className="intro-text">
          {content?.intro ||
            'Мы изучаем боевые искусства европейских мастеров эпохи Возрождения — рапиру, дагу, двуручный меч. ' +
            'Наш путь основан на исторических трактатах Сальватора Фабриса, Джорджо Маройяса и других великих мастеров клинка.'}
        </p>
      </PageSection>

      <section className="pillars">
        <div className="page-wrapper pillars-grid">
          {[
            { icon: '📜', title: 'Исторические источники', text: 'Каждая техника основана на трактатах XVI–XVII века' },
            { icon: '🗡️', title: 'Подлинное снаряжение', text: 'Реплики оружия и доспехов по историческим образцам' },
            { icon: '🏆', title: 'Соревнования', text: 'Участие в турнирах HEMA по всей России и Европе' },
          ].map(p => (
            <div className="pillar-card" key={p.title}>
              <div className="pillar-icon">{p.icon}</div>
              <h3 className="pillar-title">{p.title}</h3>
              <p className="pillar-text">{p.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
