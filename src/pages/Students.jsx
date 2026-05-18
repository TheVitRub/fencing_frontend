import { useCallback, useMemo, useState } from 'react'
import { useFetch } from '../hooks/useFetch'
import { useAuth } from '../context/AuthContext'
import { listKnowledge, listProgress } from '../api'
import PageSection from '../components/common/PageSection'
import './ClubPages.css'

function firstImage(article) {
  return article.image_url || article.images?.[0] || ''
}
function preview(text) {
  const value = String(text || '').trim()
  return value.length > 170 ? `${value.slice(0, 170)}...` : value
}

export default function Students() {
  const { isAuthenticated, isStudent } = useAuth()
  const [activeTopic, setActiveTopic] = useState('Все')
  const [selected, setSelected] = useState(null)
  const knowledge = useFetch(listKnowledge)
  const progressFn = useCallback(() => isAuthenticated ? listProgress() : Promise.resolve([]), [isAuthenticated])
  const progress = useFetch(progressFn, [progressFn])

  const articles = knowledge.data || []
  const topics = useMemo(() => {
    const list = Array.from(new Set(articles.map(article => article.category || 'Без темы')))
    return ['Все', ...list]
  }, [articles])

  const filtered = useMemo(() => {
    if (activeTopic === 'Все') return articles
    return articles.filter(article => (article.category || 'Без темы') === activeTopic)
  }, [articles, activeTopic])

  const grouped = useMemo(() => {
    return filtered.reduce((acc, article) => {
      const topic = article.category || 'Без темы'
      acc[topic] = acc[topic] || []
      acc[topic].push(article)
      return acc
    }, {})
  }, [filtered])

  return (
    <PageSection title="Ученикам" subtitle="Статьи, правила, экипировка и личный учебный прогресс">
      <div className="student-topics" role="tablist" aria-label="Темы материалов">
        {topics.map(topic => (
          <button
            type="button"
            key={topic}
            className={activeTopic === topic ? 'is-active' : ''}
            onClick={() => {
              setActiveTopic(topic)
              setSelected(null)
            }}
          >
            {topic}
          </button>
        ))}
      </div>

      {selected ? (
        <article className="student-article">
          <button type="button" className="club-inline-btn" onClick={() => setSelected(null)}>Назад к статьям</button>
          {firstImage(selected) && (
            <div className="student-article-cover">
              <img src={firstImage(selected)} alt={selected.title} />
            </div>
          )}
          <span>{selected.category || selected.visibility}</span>
          <h3>{selected.title}</h3>
          <p>{selected.body}</p>
          {selected.images?.length > 0 && (
            <div className="student-article-gallery">
              {selected.images.map(url => <img src={url} alt="" key={url} />)}
            </div>
          )}
        </article>
      ) : (
        <div className="student-sections">
          {Object.entries(grouped).map(([topic, items]) => (
            <section className="student-topic-section" key={topic}>
              <header>
                <span>{topic}</span>
                <strong>{items.length}</strong>
              </header>
              <div className="student-article-grid">
                {items.map(article => (
                  <button className="student-article-card" type="button" key={article.id} onClick={() => setSelected(article)}>
                    {firstImage(article) ? (
                      <img src={firstImage(article)} alt={article.title} />
                    ) : (
                      <span className="student-article-mark">{(article.category || article.title || '?').slice(0, 1)}</span>
                    )}
                    <small>{article.visibility === 'student' ? 'Для учеников' : article.visibility === 'registered' ? 'После регистрации' : 'Открыто'}</small>
                    <strong>{article.title}</strong>
                    <p>{preview(article.body)}</p>
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {!knowledge.loading && articles.length === 0 && (
        <p className="club-empty">Материалы для учеников пока не добавлены.</p>
      )}

      {isAuthenticated && isStudent && (
        <section className="club-progress">
          <h3>Мой прогресс</h3>
          <div className="club-card-grid">
            {(progress.data || []).map(item => (
              <article className="club-panel" key={item.id}>
                <span>{item.discipline}</span>
                <h3>{item.level || 'Без уровня'}</h3>
                <p>{item.instructor_note || 'Комментариев инструктора пока нет.'}</p>
                {item.passed_checks?.length > 0 && <small>{item.passed_checks.join(', ')}</small>}
              </article>
            ))}
          </div>
        </section>
      )}
    </PageSection>
  )
}
