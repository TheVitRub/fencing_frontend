import { useEffect, useState, useCallback } from 'react'
import './ImageGallery.css'

/**
 * ImageGallery — отображение массива изображений с лайтбоксом.
 *
 * Layout:
 *   1 фото  — одна большая картинка
 *   2 фото  — две колонки
 *   3+ фото — большая картинка слева + сетка справа (как у Airbnb/Booking)
 *
 * Клик по любой картинке открывает полноэкранный просмотрщик
 * с навигацией стрелками и закрытием по Esc.
 */
export default function ImageGallery({ images = [] }) {
  const [openIdx, setOpenIdx] = useState(null)

  const close = useCallback(() => setOpenIdx(null), [])
  const prev = useCallback(() => {
    setOpenIdx(i => (i === null ? null : (i - 1 + images.length) % images.length))
  }, [images.length])
  const next = useCallback(() => {
    setOpenIdx(i => (i === null ? null : (i + 1) % images.length))
  }, [images.length])

  // Управление клавиатурой
  useEffect(() => {
    if (openIdx === null) return
    const handler = e => {
      if (e.key === 'Escape')      close()
      else if (e.key === 'ArrowLeft')  prev()
      else if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [openIdx, close, prev, next])

  if (!images || images.length === 0) return null

  const cls = images.length === 1
    ? 'gallery gallery--one'
    : images.length === 2
      ? 'gallery gallery--two'
      : 'gallery gallery--many'

  return (
    <>
      <div className={cls}>
        {images.length === 1 && (
          <button className="gallery-item gallery-item--hero" onClick={() => setOpenIdx(0)}>
            <img src={images[0]} alt="" loading="lazy" />
          </button>
        )}

        {images.length === 2 && images.map((url, i) => (
          <button key={i} className="gallery-item" onClick={() => setOpenIdx(i)}>
            <img src={url} alt="" loading="lazy" />
          </button>
        ))}

        {images.length >= 3 && (
          <>
            <button className="gallery-item gallery-item--main" onClick={() => setOpenIdx(0)}>
              <img src={images[0]} alt="" loading="lazy" />
            </button>
            <div className="gallery-side">
              {images.slice(1, 5).map((url, i) => {
                const idx = i + 1
                const isLast = idx === 4 && images.length > 5
                return (
                  <button
                    key={idx}
                    className="gallery-item"
                    onClick={() => setOpenIdx(idx)}
                  >
                    <img src={url} alt="" loading="lazy" />
                    {isLast && (
                      <span className="gallery-more">+{images.length - 5}</span>
                    )}
                  </button>
                )
              })}
            </div>
          </>
        )}
      </div>

      {openIdx !== null && (
        <div className="lightbox" onClick={close}>
          <button
            className="lightbox-close"
            onClick={(e) => { e.stopPropagation(); close() }}
            aria-label="Закрыть"
          >×</button>

          {images.length > 1 && (
            <>
              <button
                className="lightbox-arrow lightbox-arrow--left"
                onClick={(e) => { e.stopPropagation(); prev() }}
                aria-label="Предыдущая"
              >‹</button>
              <button
                className="lightbox-arrow lightbox-arrow--right"
                onClick={(e) => { e.stopPropagation(); next() }}
                aria-label="Следующая"
              >›</button>
            </>
          )}

          <img
            className="lightbox-img"
            src={images[openIdx]}
            alt=""
            onClick={e => e.stopPropagation()}
          />

          <div className="lightbox-counter">
            {openIdx + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  )
}
