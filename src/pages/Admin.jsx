import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useFetch } from '../hooks/useFetch'
import AdminCRUD from '../components/admin/AdminCRUD'
import ImageUploader from '../components/admin/ImageUploader'
import * as api from '../api'
import './Admin.css'

const TABS = ['События', 'Планы', 'Доска почёта', 'Достижения', 'Основатель', 'Страницы', 'Пользователи', 'Инструкторы', 'Ученикам', 'Глоссарий', 'Прогресс', 'Комментарии']

export default function Admin() {
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState(0)

  const logout = () => { signOut(); navigate('/login') }

  // ── Events ────────────────────────────────────────────────────────────
  const events = useFetch(api.listEvents)
  const saveEvent = async (data, id) => {
    id ? await api.updateEvent(id, data) : await api.createEvent(data)
    events.setData(await api.listEvents())
  }
  const delEvent = async id => { await api.deleteEvent(id); events.setData(await api.listEvents()) }

  const users = useFetch(api.listUsers)
  const saveUserRole = async (id, role) => {
    await api.updateUserRole(id, role)
    users.setData(await api.listUsers())
  }

  const instructors = useFetch(api.listInstructors)
  const saveInstructor = async (data) => {
    await api.upsertInstructorProfile(data)
    instructors.setData(await api.listInstructors())
  }

  const knowledge = useFetch(api.listKnowledge)
  const saveKnowledge = async (data, id) => {
    id ? await api.updateKnowledge(id, data) : await api.createKnowledge(data)
    knowledge.setData(await api.listKnowledge())
  }
  const delKnowledge = async id => { await api.deleteKnowledge(id); knowledge.setData(await api.listKnowledge()) }

  const glossary = useFetch(api.listGlossary)
  const saveGlossary = async (data, id) => {
    id ? await api.updateGlossary(id, data) : await api.createGlossary(data)
    glossary.setData(await api.listGlossary())
  }
  const delGlossary = async id => { await api.deleteGlossary(id); glossary.setData(await api.listGlossary()) }

  const progress = useFetch(api.listProgress)
  const saveProgress = async (data) => {
    await api.upsertProgress({ ...data, user_id: Number(data.user_id), passed_checks: splitList(data.passed_checks) })
    progress.setData(await api.listProgress())
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

  // ── Plans ─────────────────────────────────────────────────────────────
  const plans = useFetch(api.listPlans)
  const savePlan = async (data, id) => {
    id ? await api.updatePlan(id, data) : await api.createPlan(data)
    plans.setData(await api.listPlans())
  }
  const delPlan = async id => { await api.deletePlan(id); plans.setData(await api.listPlans()) }

  // ── Honor ─────────────────────────────────────────────────────────────
  const honor = useFetch(api.listHonor)
  const saveHonor = async (data, id) => {
    id ? await api.updateHonorMember(id, data) : await api.createHonorMember(data)
    honor.setData(await api.listHonor())
  }
  const delHonor = async id => { await api.deleteHonorMember(id); honor.setData(await api.listHonor()) }

  // ── Achievements ──────────────────────────────────────────────────────
  const achievements = useFetch(api.listAchievements)
  const saveAch = async (data, id) => {
    id ? await api.updateAchievement(id, data) : await api.createAchievement(data)
    achievements.setData(await api.listAchievements())
  }
  const delAch = async id => { await api.deleteAchievement(id); achievements.setData(await api.listAchievements()) }

  // ── Founder ───────────────────────────────────────────────────────────
  const founderFetch = useFetch(api.getFounder)
  const saveFounder = async (data) => {
    await api.upsertFounder(data)
    founderFetch.setData(await api.getFounder())
  }

  // ── Pages ─────────────────────────────────────────────────────────────
  const PAGE_SLUGS = ['home', 'events', 'plans', 'honor', 'achievements', 'founder']
  const [pageSlug, setPageSlug] = useState('home')
  const [pageTitle, setPageTitle] = useState('')
  const [pageContent, setPageContent] = useState('')
  const pageFetch = useFetch(useCallback(() => api.getPage(pageSlug), [pageSlug]), [pageSlug])

  const loadPage = async (slug) => {
    setPageSlug(slug)
    try {
      const p = await api.getPage(slug)
      setPageTitle(p.title)
      setPageContent(p.content)
    } catch { setPageTitle(''); setPageContent('{}') }
  }
  const savePage = async () => {
    await api.upsertPage(pageSlug, { title: pageTitle, content: pageContent })
    alert('Страница сохранена')
  }

  return (
    <div className="admin-page">
      <div className="page-wrapper">
        <div className="admin-header">
          <h1 className="admin-title">⚔ Управление сайтом</h1>
          <button className="btn btn-danger" onClick={logout}>Выйти</button>
        </div>

        <div className="admin-tabs">
          {TABS.map((t, i) => (
            <button
              key={t}
              className={`admin-tab${tab === i ? ' active' : ''}`}
              onClick={() => setTab(i)}
            >{t}</button>
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
              fields={[
                { key: 'title',       label: 'Название',  required: true },
                { key: 'date',        label: 'Дата',       type: 'datetime-ru', required: true, placeholder: '01.04.2026 10:00' },
                { key: 'location',    label: 'Место',      placeholder: 'г. Москва, ул. ...' },
                { key: 'type',        label: 'Тип',        placeholder: 'training / tournament / open / event' },
                { key: 'status',      label: 'Статус',     placeholder: 'scheduled / changed / cancelled / done' },
                { key: 'discipline',  label: 'Дисциплина', placeholder: 'CourtSword' },
                { key: 'description', label: 'Описание',   type: 'textarea', placeholder: 'Что будет на мероприятии…' },
                { key: 'images',      label: 'Фотографии', type: 'image-gallery', max: 15 },
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
              fields={[
                { key: 'title', label: 'Название' },
                { key: 'period', label: 'Период (напр. Осень 2025)' },
                { key: 'description', label: 'Описание', type: 'textarea' },
                { key: 'items', label: 'Пункты (JSON массив, напр. ["Рапира","Дага"])', type: 'textarea' },
              ]}
            />
          )}

          {tab === 2 && (
            <AdminCRUD
              title="Доска почёта"
              items={honor.data || []}
              loading={honor.loading}
              onSave={saveHonor}
              onDelete={delHonor}
              fields={[
                { key: 'name',        label: 'Имя',               required: true },
                { key: 'title',       label: 'Звание / Титул',     placeholder: 'Мастер клинка' },
                { key: 'description', label: 'Описание',           type: 'textarea', placeholder: 'Заслуги, история, личное…' },
                { key: 'photo_url',   label: 'Главное фото',       type: 'image' },
                { key: 'images',      label: 'Дополнительные фотографии', type: 'image-gallery', max: 8 },
                { key: 'sort_order',  label: 'Порядок сортировки', type: 'number', min: 0, placeholder: '0' },
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
              fields={[
                { key: 'title',       label: 'Название',  required: true },
                { key: 'year',        label: 'Год',       type: 'number', required: true, min: 1900, max: 2100, placeholder: '2024' },
                { key: 'description', label: 'Описание',  type: 'textarea', placeholder: 'Какая победа, кто отличился, чем гордимся…' },
                { key: 'images',      label: 'Фотографии',type: 'image-gallery', max: 10 },
              ]}
            />
          )}

          {tab === 4 && (
            <div className="admin-crud">
              <h3 className="admin-crud-title" style={{ marginBottom: '1rem' }}>Информация об основателе</h3>
              {founderFetch.data && (
                <FounderForm
                  initial={founderFetch.data}
                  onSave={saveFounder}
                />
              )}
              {!founderFetch.data && !founderFetch.loading && (
                <FounderForm initial={{ name: '', bio: '', photo_url: '' }} onSave={saveFounder} />
              )}
            </div>
          )}

          {tab === 5 && (
            <div className="admin-crud">
              <h3 className="admin-crud-title" style={{ marginBottom: '1rem' }}>Редактор страниц</h3>
              <div className="form-field">
                <label>Страница</label>
                <select value={pageSlug} onChange={e => loadPage(e.target.value)}>
                  {PAGE_SLUGS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label>Заголовок страницы</label>
                <input value={pageTitle} onChange={e => setPageTitle(e.target.value)} />
              </div>
              <div className="form-field">
                <label>Контент (JSON)</label>
                <textarea
                  value={pageContent}
                  onChange={e => setPageContent(e.target.value)}
                  style={{ minHeight: '160px', fontFamily: 'monospace', fontSize: '0.85rem' }}
                />
              </div>
              <button className="btn btn-primary" onClick={savePage}>Сохранить страницу</button>
            </div>
          )}

          {tab === 6 && (
            <UsersPanel users={users.data || []} onRole={saveUserRole} />
          )}

          {tab === 7 && (
            <AdminCRUD
              title="Профили инструкторов"
              items={instructors.data || []}
              loading={instructors.loading}
              onSave={saveInstructor}
              onDelete={async () => alert('Удаление профиля пока лучше делать через БД, чтобы не потерять связанного пользователя.')}
              fields={[
                { key: 'user_id', label: 'ID пользователя', type: 'number', required: true },
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
              fields={[
                { key: 'title', label: 'Заголовок', required: true },
                { key: 'category', label: 'Категория' },
                { key: 'visibility', label: 'Видимость', placeholder: 'public / registered / student' },
                { key: 'sort_order', label: 'Порядок', type: 'number' },
                { key: 'body', label: 'Текст', type: 'textarea' },
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
              fields={[
                { key: 'term', label: 'Термин', required: true },
                { key: 'category', label: 'Категория' },
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
              onDelete={async () => alert('Прогресс обновляется, удаление не добавлено в MVP.')}
              fields={[
                { key: 'user_id', label: 'ID ученика', type: 'number', required: true },
                { key: 'discipline', label: 'Дисциплина', required: true },
                { key: 'level', label: 'Уровень' },
                { key: 'passed_checks', label: 'Зачёты через запятую' },
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

function splitList(value) {
  if (Array.isArray(value)) return value
  return String(value || '').split(',').map(v => v.trim()).filter(Boolean)
}

function UsersPanel({ users, onRole }) {
  const roles = ['registered', 'student', 'instructor', 'admin', 'founder']
  return (
    <div className="admin-crud">
      <h3 className="admin-crud-title" style={{ marginBottom: '1rem' }}>Пользователи и роли</h3>
      <div className="crud-list">
        {users.map(user => (
          <div className="crud-item" key={user.id}>
            <div className="crud-item-info">
              <span className="crud-item-label">#{user.id} {user.display_name || user.login}</span>
              <span className="crud-item-meta">{user.login} · {user.email || 'без email'}</span>
            </div>
            <select value={user.role} onChange={e => onRole(user.id, e.target.value)}>
              {roles.map(role => <option key={role} value={role}>{role}</option>)}
            </select>
          </div>
        ))}
      </div>
    </div>
  )
}

function CommentsModeration({ target, setTarget, comments, onLoad, onStatus }) {
  return (
    <div className="admin-crud">
      <h3 className="admin-crud-title" style={{ marginBottom: '1rem' }}>Модерация комментариев</h3>
      <div className="form-field">
        <label>Тип цели</label>
        <select value={target.target_type} onChange={e => setTarget(t => ({ ...t, target_type: e.target.value }))}>
          <option value="event">event</option>
          <option value="achievement">achievement</option>
          <option value="plan">plan</option>
        </select>
      </div>
      <div className="form-field">
        <label>ID цели</label>
        <input value={target.target_id} onChange={e => setTarget(t => ({ ...t, target_id: e.target.value }))} />
      </div>
      <button className="btn btn-primary" onClick={onLoad}>Загрузить комментарии</button>
      <div className="crud-list" style={{ marginTop: '1rem' }}>
        {comments.map(comment => (
          <div className="crud-item" key={comment.id}>
            <div className="crud-item-info">
              <span className="crud-item-label">{comment.user_display_name} · {comment.status}</span>
              <span className="crud-item-meta">{comment.body}</span>
            </div>
            <div className="crud-item-actions">
              <button className="btn btn-outline btn-sm" onClick={() => onStatus(comment.id, 'visible')}>Показать</button>
              <button className="btn btn-outline btn-sm" onClick={() => onStatus(comment.id, 'hidden')}>Скрыть</button>
              <button className="btn btn-danger btn-sm" onClick={() => onStatus(comment.id, 'deleted')}>Удалить</button>
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
  const ch = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const submit = async e => {
    e.preventDefault()
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
        <input value={form.name || ''} onChange={e => ch('name', e.target.value)} />
      </div>
      <div className="form-field">
        <label>Биография</label>
        <textarea value={form.bio || ''} onChange={e => ch('bio', e.target.value)} style={{ minHeight: '160px' }} />
      </div>
      <div className="form-field">
        <label>Фотография</label>
        <ImageUploader
          value={form.photo_url ? [form.photo_url] : []}
          onChange={urls => ch('photo_url', urls[0] || '')}
          multiple={false}
          max={1}
        />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Сохранение…' : 'Сохранить'}
        </button>
        {msg && (
          <span style={{ color: msg.ok ? '#a8e6a8' : 'var(--color-crimson)', fontSize: '0.9rem' }}>
            {msg.text}
          </span>
        )}
      </div>
    </form>
  )
}
