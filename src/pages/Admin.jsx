import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useFetch } from '../hooks/useFetch'
import AdminCRUD from '../components/admin/AdminCRUD'
import ImageUploader from '../components/admin/ImageUploader'
import * as api from '../api'
import './Admin.css'

const TABS = [
  'События',
  'Планы',
  'Доска почета',
  'Достижения',
  'Основатель',
  'Страницы',
  'Пользователи',
  'Инструкторы',
  'Ученикам',
  'Глоссарий',
  'Прогресс',
  'Комментарии',
]

const ROLE_OPTIONS = [
  { value: 'registered', label: 'Гость' },
  { value: 'student', label: 'Ученик' },
  { value: 'instructor', label: 'Инструктор' },
  { value: 'admin', label: 'Админ' },
  { value: 'founder', label: 'Основатель' },
]

const EVENT_TYPE_OPTIONS = [
  { value: 'training', label: 'Тренировка' },
  { value: 'open', label: 'Открытое занятие' },
  { value: 'tournament', label: 'Турнир' },
  { value: 'event', label: 'Событие' },
]

const EVENT_STATUS_OPTIONS = [
  { value: 'scheduled', label: 'Запланировано' },
  { value: 'changed', label: 'Изменено' },
  { value: 'cancelled', label: 'Отменено' },
  { value: 'done', label: 'Проведено' },
]

const VISIBILITY_OPTIONS = [
  { value: 'public', label: 'Всем' },
  { value: 'registered', label: 'После регистрации' },
  { value: 'student', label: 'Только ученикам' },
]

const PAGE_OPTIONS = [
  { value: 'home', label: 'Главная' },
  { value: 'events', label: 'События' },
  { value: 'plans', label: 'Планы обучения' },
  { value: 'honor', label: 'Доска почета' },
  { value: 'achievements', label: 'Достижения' },
  { value: 'founder', label: 'Основатель' },
]

const COMMENT_TARGET_OPTIONS = [
  { value: 'event', label: 'Событие' },
  { value: 'achievement', label: 'Достижение' },
  { value: 'plan', label: 'План' },
]

const COMMENT_STATUS_OPTIONS = [
  { value: 'visible', label: 'Показать' },
  { value: 'hidden', label: 'Скрыть' },
  { value: 'deleted', label: 'Удалить' },
]

function optionLabel(options, value) {
  return options.find(option => option.value === value)?.label || value || 'Не задано'
}
function userLabel(user) {
  if (!user) return ''
  const name = user.display_name || user.login
  const email = user.email ? `, ${user.email}` : ''
  return `${name} (${optionLabel(ROLE_OPTIONS, user.role)}${email})`
}

function splitList(value) {
  if (Array.isArray(value)) return value
  return String(value || '').split(',').map(v => v.trim()).filter(Boolean)
}

export default function Admin() {
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState(0)

  const logout = () => {
    signOut()
    navigate('/login')
  }

  const events = useFetch(api.listEvents)
  const plans = useFetch(api.listPlans)
  const honor = useFetch(api.listHonor)
  const achievements = useFetch(api.listAchievements)
  const founderFetch = useFetch(api.getFounder)
  const users = useFetch(api.listUsers)
  const studentUsers = useFetch(api.listStudentUsers)
  const instructorUsers = useFetch(api.listInstructorUsers)
  const instructors = useFetch(api.listInstructors)
  const knowledge = useFetch(api.listKnowledge)
  const glossary = useFetch(api.listGlossary)
  const progress = useFetch(api.listProgress)

  const studentOptions = useMemo(() => {
    const source = studentUsers.data?.length ? studentUsers.data : (users.data || []).filter(user => user.role === 'student')
    return source.map(user => ({ value: String(user.id), label: userLabel(user) }))
  }, [studentUsers.data, users.data])

  const instructorOptions = useMemo(() => {
    const source = instructorUsers.data?.length
      ? instructorUsers.data
      : (users.data || []).filter(user => ['instructor', 'admin', 'founder'].includes(user.role))
    return source.map(user => ({ value: String(user.id), label: userLabel(user) }))
  }, [instructorUsers.data, users.data])

  const saveEvent = async (data, id) => {
    id ? await api.updateEvent(id, data) : await api.createEvent(data)
    events.setData(await api.listEvents())
  }
  const delEvent = async id => {
    await api.deleteEvent(id)
    events.setData(await api.listEvents())
  }

  const savePlan = async (data, id) => {
    id ? await api.updatePlan(id, data) : await api.createPlan(data)
    plans.setData(await api.listPlans())
  }
  const delPlan = async id => {
    await api.deletePlan(id)
    plans.setData(await api.listPlans())
  }

  const saveHonor = async (data, id) => {
    id ? await api.updateHonorMember(id, data) : await api.createHonorMember(data)
    honor.setData(await api.listHonor())
  }
  const delHonor = async id => {
    await api.deleteHonorMember(id)
    honor.setData(await api.listHonor())
  }

  const saveAch = async (data, id) => {
    id ? await api.updateAchievement(id, data) : await api.createAchievement(data)
    achievements.setData(await api.listAchievements())
  }
  const delAch = async id => {
    await api.deleteAchievement(id)
    achievements.setData(await api.listAchievements())
  }

  const saveFounder = async data => {
    await api.upsertFounder(data)
    founderFetch.setData(await api.getFounder())
  }

  const saveUserRole = async (id, role) => {
    await api.updateUserRole(id, role)
    users.setData(await api.listUsers())
    studentUsers.setData(await api.listStudentUsers())
    instructorUsers.setData(await api.listInstructorUsers())
  }

  const saveInstructor = async data => {
    await api.upsertInstructorProfile({ ...data, user_id: Number(data.user_id) })
    instructors.setData(await api.listInstructors())
  }

  const saveKnowledge = async (data, id) => {
    id ? await api.updateKnowledge(id, data) : await api.createKnowledge(data)
    knowledge.setData(await api.listKnowledge())
  }
  const delKnowledge = async id => {
    await api.deleteKnowledge(id)
    knowledge.setData(await api.listKnowledge())
  }

  const saveGlossary = async (data, id) => {
    id ? await api.updateGlossary(id, data) : await api.createGlossary(data)
    glossary.setData(await api.listGlossary())
  }
  const delGlossary = async id => {
    await api.deleteGlossary(id)
    glossary.setData(await api.listGlossary())
  }

  const saveProgress = async data => {
    await api.upsertProgress({
      ...data,
      user_id: Number(data.user_id),
      passed_checks: splitList(data.passed_checks),
    })
    progress.setData(await api.listProgress())
  }

  const [pageSlug, setPageSlug] = useState('home')
  const [pageTitle, setPageTitle] = useState('')
  const [pageContent, setPageContent] = useState('{}')

  const loadPage = useCallback(async slug => {
    setPageSlug(slug)
    try {
      const page = await api.getPage(slug)
      setPageTitle(page.title)
      setPageContent(page.content)
    } catch {
      setPageTitle(optionLabel(PAGE_OPTIONS, slug))
      setPageContent('{}')
    }
  }, [])

  useEffect(() => {
    loadPage('home')
  }, [loadPage])

  const savePage = async () => {
    await api.upsertPage(pageSlug, { title: pageTitle, content: pageContent })
    alert('Страница сохранена')
  }

  const [commentTarget, setCommentTarget] = useState({ target_type: 'event', target_id: '' })
  const [comments, setComments] = useState([])
  const loadComments = async () => {
    if (!commentTarget.target_id) return
    setComments(await api.listAdminComments(commentTarget.target_type, Number(commentTarget.target_id)))
  }
  const setCommentStatus = async (id, status) => {
    await api.updateCommentStatus(id, status)
    await loadComments()
  }

  return (
    <div className="admin-page">
      <div className="page-wrapper">
        <div className="admin-header">
          <h1 className="admin-title">Управление сайтом</h1>
          <button className="btn btn-danger" onClick={logout}>Выйти</button>
        </div>

        <div className="admin-tabs">
          {TABS.map((label, index) => (
            <button
              key={label}
              className={`admin-tab${tab === index ? ' active' : ''}`}
              onClick={() => setTab(index)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="admin-content">
          {tab === 0 && (
            <AdminCRUD
              title="События"
              items={events.data || []}
              loading={events.loading}
              onSave={saveEvent}
              onDelete={delEvent}
              displayKey="title"
              getItemMeta={item => `${optionLabel(EVENT_STATUS_OPTIONS, item.status)} · ${item.discipline || optionLabel(EVENT_TYPE_OPTIONS, item.type)}`}
              fields={[
                { key: 'title', label: 'Название', required: true },
                { key: 'date', label: 'Дата и время', type: 'datetime-ru', required: true, placeholder: '01.04.2026 19:00' },
                { key: 'location', label: 'Место', placeholder: 'Зал школы, подробности в VK' },
                { key: 'type', label: 'Тип', type: 'select', options: EVENT_TYPE_OPTIONS, placeholder: 'Выберите тип' },
                { key: 'status', label: 'Состояние', type: 'select', options: EVENT_STATUS_OPTIONS, placeholder: 'Выберите состояние' },
                { key: 'discipline', label: 'Дисциплина', placeholder: 'CourtSword' },
                { key: 'description', label: 'Описание', type: 'textarea', placeholder: 'Что будет на занятии или событии' },
                { key: 'images', label: 'Фотографии', type: 'image-gallery', max: 15 },
              ]}
            />
          )}

          {tab === 1 && (
            <AdminCRUD
              title="Планы обучения"
              items={plans.data || []}
              loading={plans.loading}
              onSave={savePlan}
              onDelete={delPlan}
              displayKey="title"
              fields={[
                { key: 'title', label: 'Название' },
                { key: 'period', label: 'Период', placeholder: 'Осень 2026' },
                { key: 'description', label: 'Описание', type: 'textarea' },
                { key: 'items', label: 'Пункты плана (JSON-массив)', type: 'textarea', placeholder: '["Рапира", "Дага"]' },
              ]}
            />
          )}

          {tab === 2 && (
            <AdminCRUD
              title="Доска почета"
              items={honor.data || []}
              loading={honor.loading}
              onSave={saveHonor}
              onDelete={delHonor}
              displayKey="name"
              fields={[
                { key: 'name', label: 'Имя', required: true },
                { key: 'title', label: 'Звание или роль', placeholder: 'Мастер клинка' },
                { key: 'description', label: 'Описание', type: 'textarea' },
                { key: 'photo_url', label: 'Главное фото', type: 'image' },
                { key: 'images', label: 'Дополнительные фото', type: 'image-gallery', max: 8 },
                { key: 'sort_order', label: 'Порядок сортировки', type: 'number', min: 0, placeholder: '0' },
              ]}
            />
          )}

          {tab === 3 && (
            <AdminCRUD
              title="Достижения школы"
              items={achievements.data || []}
              loading={achievements.loading}
              onSave={saveAch}
              onDelete={delAch}
              displayKey="title"
              fields={[
                { key: 'title', label: 'Название', required: true },
                { key: 'year', label: 'Год', type: 'number', required: true, min: 1900, max: 2100, placeholder: '2026' },
                { key: 'description', label: 'Описание', type: 'textarea' },
                { key: 'images', label: 'Фотографии', type: 'image-gallery', max: 10 },
              ]}
            />
          )}

          {tab === 4 && (
            <div className="admin-crud">
              <h3 className="admin-crud-title">Информация об основателе</h3>
              {founderFetch.data && <FounderForm initial={founderFetch.data} onSave={saveFounder} />}
              {!founderFetch.data && !founderFetch.loading && (
                <FounderForm initial={{ name: '', bio: '', photo_url: '' }} onSave={saveFounder} />
              )}
            </div>
          )}

          {tab === 5 && (
            <div className="admin-crud">
              <h3 className="admin-crud-title">Редактор страниц</h3>
              <div className="form-field">
                <label>Страница</label>
                <select value={pageSlug} onChange={event => loadPage(event.target.value)}>
                  {PAGE_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label>Заголовок страницы</label>
                <input value={pageTitle} onChange={event => setPageTitle(event.target.value)} />
              </div>
              <div className="form-field">
                <label>Контент (JSON)</label>
                <textarea
                  value={pageContent}
                  onChange={event => setPageContent(event.target.value)}
                  style={{ minHeight: '180px', fontFamily: 'monospace', fontSize: '0.85rem' }}
                />
              </div>
              <button className="btn btn-primary" onClick={savePage}>Сохранить страницу</button>
            </div>
          )}

          {tab === 6 && (
            <UsersPanel users={users.data || []} progress={progress.data || []} onRole={saveUserRole} />
          )}

          {tab === 7 && (
            <AdminCRUD
              title="Профили инструкторов"
              items={instructors.data || []}
              loading={instructors.loading}
              onSave={saveInstructor}
              onDelete={async () => alert('Удаление профиля пока отключено: так меньше риска случайно потерять связанного пользователя.')}
              displayKey="name"
              getItemMeta={item => item.specialization || optionLabel(ROLE_OPTIONS, item.role)}
              fields={[
                { key: 'user_id', label: 'Пользователь', type: 'relation-select', required: true, options: instructorOptions, placeholder: 'Выберите инструктора' },
                { key: 'name', label: 'Имя', required: true },
                { key: 'photo_url', label: 'Фото', type: 'image' },
                { key: 'specialization', label: 'Специализация' },
                { key: 'weapons', label: 'Оружие' },
                { key: 'experience', label: 'Опыт' },
                { key: 'quote', label: 'Цитата' },
                { key: 'bio', label: 'Описание', type: 'textarea' },
              ]}
            />
          )}

          {tab === 8 && (
            <AdminCRUD
              title="Материалы ученикам"
              items={knowledge.data || []}
              loading={knowledge.loading}
              onSave={saveKnowledge}
              onDelete={delKnowledge}
              displayKey="title"
              getItemMeta={item => `${item.category || 'Без темы'} · ${optionLabel(VISIBILITY_OPTIONS, item.visibility)}`}
              fields={[
                { key: 'title', label: 'Заголовок', required: true },
                { key: 'category', label: 'Тема', placeholder: 'Новичкам, Безопасность, Экипировка, CourtSword' },
                { key: 'visibility', label: 'Кому видно', type: 'select', options: VISIBILITY_OPTIONS, placeholder: 'Выберите доступ' },
                { key: 'sort_order', label: 'Порядок', type: 'number' },
                { key: 'image_url', label: 'Обложка статьи', type: 'image' },
                { key: 'images', label: 'Галерея внутри статьи', type: 'image-gallery', max: 12 },
                { key: 'body', label: 'Текст статьи', type: 'textarea' },
              ]}
            />
          )}

          {tab === 9 && (
            <AdminCRUD
              title="Глоссарий"
              items={glossary.data || []}
              loading={glossary.loading}
              onSave={saveGlossary}
              onDelete={delGlossary}
              displayKey="term"
              getItemMeta={item => item.category || 'Термин'}
              fields={[
                { key: 'term', label: 'Термин', required: true },
                { key: 'category', label: 'Раздел', placeholder: 'Техника, Тактика, Оружие' },
                { key: 'image_url', label: 'Иллюстрация', type: 'image' },
                { key: 'images', label: 'Дополнительные фото', type: 'image-gallery', max: 8 },
                { key: 'definition', label: 'Определение', type: 'textarea' },
              ]}
            />
          )}

          {tab === 10 && (
            <AdminCRUD
              title="Учебный прогресс"
              items={progress.data || []}
              loading={progress.loading}
              onSave={saveProgress}
              onDelete={async () => alert('Прогресс обновляется поверх существующей записи; удаление добавим отдельным действием, когда оно понадобится.')}
              getItemTitle={item => item.user_display_name || `Ученик #${item.user_id}`}
              getItemMeta={item => `${item.discipline || 'Дисциплина'} · ${item.level || 'Уровень не задан'}`}
              fields={[
                { key: 'user_id', label: 'Ученик', type: 'relation-select', required: true, options: studentOptions, placeholder: 'Выберите ученика' },
                { key: 'discipline', label: 'Дисциплина', required: true, placeholder: 'CourtSword' },
                { key: 'level', label: 'Уровень' },
                { key: 'passed_checks', label: 'Зачеты через запятую' },
                { key: 'instructor_note', label: 'Комментарий инструктора', type: 'textarea' },
              ]}
            />
          )}

          {tab === 11 && (
            <CommentsModeration
              target={commentTarget}
              setTarget={setCommentTarget}
              comments={comments}
              onLoad={loadComments}
              onStatus={setCommentStatus}
            />
          )}
        </div>
      </div>
    </div>
  )
}

function UsersPanel({ users, progress, onRole }) {
  const [openUserId, setOpenUserId] = useState(null)

  return (
    <div className="admin-crud">
      <h3 className="admin-crud-title">Пользователи и роли</h3>
      <div className="crud-list">
        {users.map(user => {
          const isOpen = openUserId === user.id
          const userProgress = progress.filter(item => item.user_id === user.id)
          return (
            <div className="crud-item crud-item--stacked" key={user.id}>
              <div className="crud-item-main">
                <button
                  type="button"
                  className="crud-item-info crud-item-button"
                  onClick={() => setOpenUserId(isOpen ? null : user.id)}
                >
                  <span className="crud-item-label">{user.display_name || user.login}</span>
                  <span className="crud-item-meta">{user.login} · {user.email || 'без email'} · {optionLabel(ROLE_OPTIONS, user.role)}</span>
                </button>
                <select value={user.role} onChange={event => onRole(user.id, event.target.value)}>
                  {ROLE_OPTIONS.map(role => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </select>
              </div>
              {isOpen && (
                <div className="user-profile-admin">
                  <dl>
                    <div><dt>ID</dt><dd>{user.id}</dd></div>
                    <div><dt>Логин</dt><dd>{user.login}</dd></div>
                    <div><dt>Email</dt><dd>{user.email || 'не указан'}</dd></div>
                    <div><dt>Имя</dt><dd>{user.display_name || 'не указано'}</dd></div>
                    <div><dt>Роль</dt><dd>{optionLabel(ROLE_OPTIONS, user.role)}</dd></div>
                  </dl>
                  <h4>Учебный профиль</h4>
                  {userProgress.length > 0 ? (
                    <ul>
                      {userProgress.map(item => (
                        <li key={item.id}>
                          <strong>{item.discipline}</strong>
                          <span>{item.level || 'уровень не задан'}</span>
                          {item.passed_checks?.length > 0 && <small>{item.passed_checks.join(', ')}</small>}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>Прогресс пока не заполнен.</p>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function CommentsModeration({ target, setTarget, comments, onLoad, onStatus }) {
  return (
    <div className="admin-crud">
      <h3 className="admin-crud-title">Модерация комментариев</h3>
      <div className="form-field">
        <label>Раздел</label>
        <select value={target.target_type} onChange={event => setTarget(current => ({ ...current, target_type: event.target.value }))}>
          {COMMENT_TARGET_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>
      <div className="form-field">
        <label>ID записи</label>
        <input value={target.target_id} onChange={event => setTarget(current => ({ ...current, target_id: event.target.value }))} />
      </div>
      <button className="btn btn-primary" onClick={onLoad}>Загрузить комментарии</button>
      <div className="crud-list" style={{ marginTop: '1rem' }}>
        {comments.map(comment => (
          <div className="crud-item" key={comment.id}>
            <div className="crud-item-info">
              <span className="crud-item-label">{comment.user_display_name} · {optionLabel(COMMENT_STATUS_OPTIONS, comment.status)}</span>
              <span className="crud-item-meta">{comment.body}</span>
            </div>
            <div className="crud-item-actions">
              {COMMENT_STATUS_OPTIONS.map(option => (
                <button
                  key={option.value}
                  className={option.value === 'deleted' ? 'btn btn-danger btn-sm' : 'btn btn-outline btn-sm'}
                  onClick={() => onStatus(comment.id, option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function FounderForm({ initial, onSave }) {
  const [form, setForm] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState(null)
  const change = (key, value) => setForm(current => ({ ...current, [key]: value }))

  const submit = async event => {
    event.preventDefault()
    setSaving(true)
    try {
      await onSave(form)
      setMsg({ ok: true, text: 'Сохранено' })
    } catch (err) {
      setMsg({ ok: false, text: err?.response?.data?.error || 'Ошибка сохранения' })
    } finally {
      setSaving(false)
      setTimeout(() => setMsg(null), 3000)
    }
  }

  return (
    <form onSubmit={submit}>
      <div className="form-field">
        <label>Имя</label>
        <input value={form.name || ''} onChange={event => change('name', event.target.value)} />
      </div>
      <div className="form-field">
        <label>Биография</label>
        <textarea value={form.bio || ''} onChange={event => change('bio', event.target.value)} style={{ minHeight: '160px' }} />
      </div>
      <div className="form-field">
        <label>Фотография</label>
        <ImageUploader
          value={form.photo_url ? [form.photo_url] : []}
          onChange={urls => change('photo_url', urls[0] || '')}
          multiple={false}
          max={1}
        />
      </div>
      <div className="form-actions-row">
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Сохранение...' : 'Сохранить'}
        </button>
        {msg && <span className={msg.ok ? 'form-message ok' : 'form-message error'}>{msg.text}</span>}
      </div>
    </form>
  )
}
