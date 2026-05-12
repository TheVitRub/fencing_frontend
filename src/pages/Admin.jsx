import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useFetch } from '../hooks/useFetch'
import AdminCRUD from '../components/admin/AdminCRUD'
import * as api from '../api'
import './Admin.css'

const TABS = ['События', 'Планы', 'Доска почёта', 'Достижения', 'Основатель', 'Страницы']

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
                { key: 'title',       label: 'Название',       required: true },
                { key: 'description', label: 'Описание',        type: 'textarea' },
                { key: 'date',        label: 'Дата',            type: 'datetime-ru', required: true, placeholder: '01.04.2026 10:00' },
                { key: 'location',    label: 'Место' },
                { key: 'image_url',   label: 'URL изображения', type: 'url' },
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
                { key: 'title',       label: 'Звание/Титул' },
                { key: 'description', label: 'Описание',           type: 'textarea' },
                { key: 'photo_url',   label: 'URL фото',           type: 'url' },
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
                { key: 'title',       label: 'Название',       required: true },
                { key: 'year',        label: 'Год',             type: 'number', required: true, min: 1900, max: 2100, placeholder: '2024' },
                { key: 'description', label: 'Описание',        type: 'textarea' },
                { key: 'image_url',   label: 'URL изображения', type: 'url' },
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
        </div>
      </div>
    </div>
  )
}

function FounderForm({ initial, onSave }) {
  const [form, setForm] = useState(initial)
  const ch = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const submit = e => { e.preventDefault(); onSave(form) }
  return (
    <form onSubmit={submit}>
      <div className="form-field"><label>Имя</label><input value={form.name} onChange={e => ch('name', e.target.value)} /></div>
      <div className="form-field"><label>Биография</label><textarea value={form.bio} onChange={e => ch('bio', e.target.value)} style={{ minHeight: '140px' }} /></div>
      <div className="form-field"><label>URL фото</label><input value={form.photo_url} onChange={e => ch('photo_url', e.target.value)} /></div>
      <button type="submit" className="btn btn-primary">Сохранить</button>
    </form>
  )
}
