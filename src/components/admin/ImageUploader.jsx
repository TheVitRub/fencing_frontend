import { useRef, useState } from 'react'
import { uploadFile } from '../../api'
import './ImageUploader.css'

/**
 * ImageUploader — загрузка одного или нескольких изображений на бэкенд.
 *
 * Props:
 *   value:    string[]                  // текущие URL
 *   onChange: (urls: string[]) => void  // вызывается при добавлении/удалении/перетаскивании
 *   multiple: boolean                   // разрешить выбор нескольких файлов (по умолчанию true)
 *   max:      number                    // максимальное количество (по умолчанию 12)
 *
 * Поведение:
 *   - drag-and-drop файлов в зону загрузки
 *   - клик по зоне открывает системный диалог
 *   - превью с возможностью удалить
 *   - первая картинка всегда «обложкой» — её можно сделать любую через «Сделать обложкой»
 *   - перетаскивание превью для смены порядка
 */
export default function ImageUploader({
  value = [],
  onChange,
  multiple = true,
  max = 12,
}) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState(null)
  const [dragSrc, setDragSrc] = useState(null) // индекс перетаскиваемого превью

  const remaining = max - value.length

  const handleFiles = async (filesRaw) => {
    setError(null)
    const files = Array.from(filesRaw).filter(f => f.type.startsWith('image/'))
    if (files.length === 0) {
      setError('Только изображения')
      return
    }
    const allowed = files.slice(0, remaining)
    if (files.length > remaining) {
      setError(`Можно добавить не более ${max} (осталось ${remaining})`)
    }

    setUploading(true)
    const next = [...value]
    try {
      for (const file of allowed) {
        try {
          const { url } = await uploadFile(file)
          next.push(url)
          onChange(next.slice())
        } catch (err) {
          const msg = err?.response?.data?.error || err?.message || 'Ошибка загрузки'
          setError(msg)
        }
      }
    } finally {
      setUploading(false)
    }
  }

  const onInputChange = e => {
    if (e.target.files?.length) handleFiles(e.target.files)
    e.target.value = ''
  }

  const onDrop = e => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files)
  }

  const remove = i => {
    const next = value.filter((_, idx) => idx !== i)
    onChange(next)
  }

  const makeCover = i => {
    if (i === 0) return
    const next = value.slice()
    const [item] = next.splice(i, 1)
    next.unshift(item)
    onChange(next)
  }

  // Drag-to-reorder поверх превью
  const onPreviewDragStart = i => setDragSrc(i)
  const onPreviewDragOver = (e, i) => {
    e.preventDefault()
    if (dragSrc === null || dragSrc === i) return
    const next = value.slice()
    const [item] = next.splice(dragSrc, 1)
    next.splice(i, 0, item)
    onChange(next)
    setDragSrc(i)
  }
  const onPreviewDragEnd = () => setDragSrc(null)

  const reachedMax = value.length >= max

  return (
    <div className="img-uploader">
      {value.length > 0 && (
        <div className="img-uploader-grid">
          {value.map((url, i) => (
            <div
              key={url + i}
              className={`img-uploader-thumb${i === 0 ? ' is-cover' : ''}`}
              draggable
              onDragStart={() => onPreviewDragStart(i)}
              onDragOver={e => onPreviewDragOver(e, i)}
              onDragEnd={onPreviewDragEnd}
            >
              <img src={url} alt="" />
              {i === 0 && <span className="img-uploader-cover-badge">Обложка</span>}
              <div className="img-uploader-thumb-actions">
                {i !== 0 && (
                  <button
                    type="button"
                    className="img-uploader-mini-btn"
                    onClick={() => makeCover(i)}
                    title="Сделать обложкой"
                  >★</button>
                )}
                <button
                  type="button"
                  className="img-uploader-mini-btn danger"
                  onClick={() => remove(i)}
                  title="Удалить"
                >×</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!reachedMax && (
        <div
          className={`img-uploader-drop${dragOver ? ' is-dragging' : ''}${uploading ? ' is-loading' : ''}`}
          onClick={() => !uploading && inputRef.current?.click()}
          onDragEnter={e => { e.preventDefault(); setDragOver(true) }}
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple={multiple}
            onChange={onInputChange}
            hidden
          />
          {uploading
            ? <span>Загрузка…</span>
            : (
              <>
                <strong>Перетащите файлы сюда</strong>
                <span>или нажмите, чтобы выбрать</span>
                <small>jpg · png · webp · gif · до 10 МБ</small>
              </>
            )
          }
        </div>
      )}

      {error && <p className="img-uploader-error">{error}</p>}
      {value.length > 0 && (
        <p className="img-uploader-hint">
          Первая фотография — обложка. Перетащите превью, чтобы изменить порядок.
        </p>
      )}
    </div>
  )
}
