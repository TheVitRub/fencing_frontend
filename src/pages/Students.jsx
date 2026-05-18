import { useFetch } from '../hooks/useFetch'
import { useAuth } from '../context/AuthContext'
import { listKnowledge, listProgress } from '../api'
import PageSection from '../components/common/PageSection'
import './ClubPages.css'

export default function Students() {
  const { isAuthenticated, isStudent } = useAuth()
  const knowledge = useFetch(listKnowledge)
  const progress = useFetch(listProgress)

  return (
    <PageSection title="Ученикам" subtitle="Памятки, правила, экипировка и личный учебный прогресс">
      <div className="club-card-grid">
        {(knowledge.data || []).map(article => (
          <article className="club-panel" key={article.id}>
            <span>{article.category || article.visibility}</span>
            <h3>{article.title}</h3>
            <p>{article.body}</p>
          </article>
        ))}
      </div>
      {!knowledge.loading && (!knowledge.data || knowledge.data.length === 0) && (
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
