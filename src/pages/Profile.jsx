import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { listNotifications, listProgress, markNotificationRead } from '../api'
import { useFetch } from '../hooks/useFetch'
import PageSection from '../components/common/PageSection'
import './ClubPages.css'

const ROLE_LABELS = {
  registered: 'Гость',
  student: 'Ученик',
  instructor: 'Инструктор',
  admin: 'Админ',
  founder: 'Основатель',
}

const DISCIPLINES = ['Рапира', 'Дага', 'Меч', 'Сабля', 'CourtSword']

export default function Profile() {
  const { user, role } = useAuth()
  const progress = useFetch(listProgress)
  const notifications = useFetch(listNotifications)

  const unreadCount = useMemo(
    () => (notifications.data || []).filter(item => !item.is_read).length,
    [notifications.data],
  )

  const progressRows = useMemo(() => {
    const source = progress.data || []
    return DISCIPLINES.map(discipline => (
      source.find(item => item.discipline === discipline) || {
        id: `empty-${discipline}`,
        discipline,
        level: 'Не начато',
        instructor_note: 'Инструктор ещё не оставил комментарий по этой дисциплине.',
        passed_checks: [],
      }
    ))
  }, [progress.data])

  const read = async id => {
    await markNotificationRead(id)
    notifications.setData(await listNotifications())
  }

  return (
    <PageSection title="Кабинет участника" subtitle="Личный профиль, уведомления и учебный прогресс">
      <section className="profile-hero">
        <div className="profile-seal">{(user?.display_name || user?.login || '?').slice(0, 1).toUpperCase()}</div>
        <div>
          <span>{ROLE_LABELS[role] || 'Участник'}</span>
          <h3>{user?.display_name || user?.login}</h3>
          <p>{user?.email || 'Email не указан'} · логин: {user?.login}</p>
        </div>
      </section>

      <div className="profile-grid">
        <article className="profile-panel">
          <header>
            <span>Уведомления</span>
            {unreadCount > 0 && <strong>{unreadCount}</strong>}
          </header>
          <div className="profile-list">
            {(notifications.data || []).map(item => (
              <button
                type="button"
                className={`profile-note${item.is_read ? '' : ' is-new'}`}
                key={item.id}
                onClick={() => !item.is_read && read(item.id)}
              >
                <strong>{item.title}</strong>
                <span>{item.body || 'Без подробностей'}</span>
              </button>
            ))}
            {!notifications.loading && (!notifications.data || notifications.data.length === 0) && (
              <p>Пока нет уведомлений.</p>
            )}
          </div>
        </article>

        <article className="profile-panel">
          <header>
            <span>Учебный прогресс</span>
          </header>
          <div className="profile-list">
            {progressRows.map(item => (
              <div className="profile-progress" key={item.id}>
                <strong>{item.discipline}</strong>
                <span>{item.level || 'Уровень еще не выставлен'}</span>
                <p>{item.instructor_note || 'Комментарий инструктора появится после заполнения.'}</p>
                {item.passed_checks?.length > 0 && <small>{item.passed_checks.join(', ')}</small>}
              </div>
            ))}
          </div>
        </article>
      </div>

      <div className="profile-actions">
        <Link to="/calendar">Перейти к календарю</Link>
        <Link to="/students">Материалы ученикам</Link>
        <Link to="/glossary">Глоссарий</Link>
      </div>
    </PageSection>
  )
}
