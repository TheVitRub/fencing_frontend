import { useFetch } from '../hooks/useFetch'
import { listInstructors } from '../api'
import PageSection from '../components/common/PageSection'
import './ClubPages.css'

export default function Instructors() {
  const { data: instructors, loading } = useFetch(listInstructors)
  return (
    <PageSection title="Инструкторы" subtitle="Люди, которые держат технику, безопасность и ритм школы">
      {loading && <p className="loading-text">Загрузка...</p>}
      <div className="club-card-grid">
        {(instructors || []).map(profile => (
          <article className="club-profile" key={profile.id}>
            <div className="club-profile-photo">
              {profile.photo_url ? <img src={profile.photo_url} alt={profile.name} /> : <span>Портрет</span>}
            </div>
            <div>
              <h3>{profile.name || 'Инструктор школы'}</h3>
              <p>{profile.specialization}</p>
              <small>{profile.weapons}</small>
              {profile.quote && <blockquote>{profile.quote}</blockquote>}
              {profile.bio && <p>{profile.bio}</p>}
            </div>
          </article>
        ))}
      </div>
      {!loading && (!instructors || instructors.length === 0) && <p className="club-empty">Профили инструкторов пока не заполнены.</p>}
    </PageSection>
  )
}
