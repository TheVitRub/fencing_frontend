import { useState, useEffect } from 'react'
import ImageUploader from './ImageUploader'
import './AdminCRUD.css'

// ── Дата-хелперы ───────────────────────────────────────────────────────────

// "DD.MM.YYYY HH:MM"  →  "YYYY-MM-DDTHH:MM:00Z"
function ruToISO(str) {
  if (!str) return ''
  const m = str.match(/^(\d{2})\.(\d{2})\.(\d{4})(?:\s+(\d{2}):(\d{2}))?$/)
  if (!m) return ''
  const [, dd, mm, yyyy, hh = '00', min = '00'] = m
  return `${yyyy}-${mm}-${dd}T${hh}:${min}:00Z`
}

// ISO / любое что Date() распарсит  →  "DD.MM.YYYY HH:MM"
function isoToRu(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d)) return ''
  const p = n => String(n).padStart(2, '0')
  return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`
}

// ── Toast ─────────────────────────────────────────────────────────────────

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div className={`crud-toast crud-toast--${type}`} onClick={onClose}>
      <span>{message}</span>
      <button className="crud-toast-close" aria-label="закрыть">×</button>
    </div>
  )
}

// ── Основной компонент ─────────────────────────────────────────────────────

/**
 * fields: { key, label, type?, required?, min?, max?, placeholder?, max? }
 * type:
 *   'text'           — обычный input
 *   'textarea'       — многострочный
 *   'number'         — int с валидацией
 *   'datetime-ru'    — ДД.ММ.ГГГГ ЧЧ:ММ, отправляется как ISO
 *   'url'            — input type="url"
 *   'image'          — загрузка одного изображения
 *   'image-gallery'  — загрузка массива изображений
 */
export default function AdminCRUD({ title, fields, items, onSave, onDelete, loading }) {
  const [form, setForm]   = useState(null)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'success') => setToast({ message, type })
  const hideToast = () => setToast(null)

  const emptyForm = () => Object.fromEntries(
    fields.map(f => {
      if (f.type === 'image-gallery') return [f.key, []]
      return [f.key, '']
    })
  )

  const openNew  = () => { setErrors({}); setForm(emptyForm()) }
  const openEdit = item => {
    setErrors({})
    const copy = { ...item }
    fields.forEach(f => {
      if (f.type === 'datetime-ru') copy[f.key] = isoToRu(copy[f.key])
      if (f.type === 'image-gallery' && !Array.isArray(copy[f.key])) {
        copy[f.key] = []
      }
    })
    setForm(copy)
  }
  const closeForm = () => setForm(null)

  const change = (key, rawVal, fieldType) => {
    setErrors(e => ({ ...e, [key]: undefined }))
    setForm(f => ({
      ...f,
      [key]: fieldType === 'number' ? rawVal : rawVal,
    }))
  }

  // ── Клиентская валидация ──────────────────────────────────────────────

  const validate = formData => {
    const errs = {}
    fields.forEach(f => {
      const val = formData[f.key]
      const isEmpty = val === '' || val === null || val === undefined

      if (f.required && isEmpty) {
        errs[f.key] = `Поле обязательно для заполнения`
      }

      if (f.type === 'number' && !isEmpty) {
        const n = Number(val)
        if (isNaN(n) || !Number.isInteger(n)) {
          errs[f.key] = 'Введите целое число'
        } else if (f.min !== undefined && n < f.min) {
          errs[f.key] = `Минимум: ${f.min}`
        } else if (f.max !== undefined && n > f.max) {
          errs[f.key] = `Максимум: ${f.max}`
        }
      }

      if (f.type === 'datetime-ru' && !isEmpty) {
        if (!ruToISO(val)) {
          errs[f.key] = 'Формат: ДД.ММ.ГГГГ ЧЧ:ММ'
        }
      }
    })
    return errs
  }

  // ── Сохранение ────────────────────────────────────────────────────────

  const save = async e => {
    e.preventDefault()
    const errs = validate(form)
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    // Санитизация: приводим типы перед отправкой на backend
    const payload = { ...form }
    fields.forEach(f => {
      if (f.type === 'number') {
        payload[f.key] = payload[f.key] === '' ? 0 : parseInt(payload[f.key], 10)
      }
      if (f.type === 'datetime-ru') {
        payload[f.key] = ruToISO(payload[f.key]) || undefined
      }
    })

    setSaving(true)
    try {
      await onSave(payload, payload.id)
      closeForm()
      showToast(payload.id ? 'Изменения сохранены' : 'Запись добавлена')
    } catch (err) {
      const msg = err?.response?.data?.error || 'Ошибка при сохранении'
      showToast(msg, 'error')
    } finally {
      setSaving(false)
    }
  }

  // ── Удаление ──────────────────────────────────────────────────────────

  const handleDelete = async id => {
    if (!window.confirm('Удалить запись? Это действие нельзя отменить.')) return
    try {
      await onDelete(id)
      showToast('Запись удалена')
    } catch (err) {
      const msg = err?.response?.data?.error || 'Ошибка при удалении'
      showToast(msg, 'error')
    }
  }

  // ── Отображение значения в списке ─────────────────────────────────────

  const itemSubtitle = item => {
    if (item.year)     return String(item.year)
    if (item.date)     return isoToRu(item.date)
    if (item.period)   return item.period
    return null
  }

  return (
    <div className="admin-crud">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

      <div className="admin-crud-header">
        <h3 className="admin-crud-title">{title}</h3>
        <button className="btn btn-outline" onClick={openNew}>+ Добавить</button>
      </div>

      {loading && <p className="loading-text">Загрузка...</p>}

      <div className="crud-list">
        {items?.map(item => {
          const sub = itemSubtitle(item)
          return (
            <div className="crud-item" key={item.id}>
              <div className="crud-item-info">
                <span className="crud-item-label">
                  {item.title || item.name || item.period || `#${item.id}`}
                </span>
                {sub && <span className="crud-item-meta">{sub}</span>}
              </div>
              <div className="crud-item-actions">
                <button className="btn btn-outline btn-sm" onClick={() => openEdit(item)}>Изменить</button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item.id)}>Удалить</button>
              </div>
            </div>
          )
        })}
        {items?.length === 0 && !loading && (
          <p className="crud-empty">Нет записей. Нажмите «+ Добавить».</p>
        )}
      </div>

      {form !== null && (
        <div className="crud-modal-overlay" onClick={closeForm}>
          <div className="crud-modal" onClick={e => e.stopPropagation()}>
            <h4 className="crud-modal-title">
              {form.id ? 'Редактировать' : 'Добавить'}: {title}
            </h4>

            <form onSubmit={save} noValidate>
              {fields.map(f => (
                <div className={`form-field${errors[f.key] ? ' form-field--error' : ''}`} key={f.key}>
                  <label>
                    {f.label}
                    {f.required && <span className="field-required"> *</span>}
                  </label>

                  {f.type === 'textarea' ? (
                    <textarea
                      value={form[f.key] ?? ''}
                      onChange={e => change(f.key, e.target.value, f.type)}
                      placeholder={f.placeholder}
                    />
                  ) : f.type === 'datetime-ru' ? (
                    <input
                      type="text"
                      value={form[f.key] ?? ''}
                      onChange={e => change(f.key, e.target.value, f.type)}
                      placeholder="ДД.ММ.ГГГГ ЧЧ:ММ"
                      maxLength={16}
                    />
                  ) : f.type === 'image-gallery' ? (
                    <ImageUploader
                      value={Array.isArray(form[f.key]) ? form[f.key] : []}
                      onChange={urls => change(f.key, urls, f.type)}
                      multiple
                      max={f.max || 12}
                    />
                  ) : f.type === 'image' ? (
                    <ImageUploader
                      value={form[f.key] ? [form[f.key]] : []}
                      onChange={urls => change(f.key, urls[0] || '', f.type)}
                      multiple={false}
                      max={1}
                    />
                  ) : (
                    <input
                      type={f.type === 'number' ? 'number' : (f.type || 'text')}
                      value={form[f.key] ?? ''}
                      onChange={e => change(f.key, e.target.value, f.type)}
                      min={f.min}
                      max={f.max}
                      placeholder={f.placeholder}
                    />
                  )}

                  {errors[f.key] && (
                    <span className="field-error-msg">{errors[f.key]}</span>
                  )}
                </div>
              ))}

              <div className="crud-modal-actions">
                <button type="button" className="btn btn-outline" onClick={closeForm}>
                  Отмена
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Сохранение…' : 'Сохранить'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
