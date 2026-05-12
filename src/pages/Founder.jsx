import { useFetch } from '../hooks/useFetch'
import { getFounder, getPage } from '../api'
import PageSection from '../components/common/PageSection'
import './Founder.css'

export default function Founder() {
  const { data: founder, loading, error } = useFetch(getFounder)
  const { data: page } = useFetch(() => getPage('founder'))

  return (
    <PageSection title={page?.title || 'Об основателе'}>
      {loading && <p className="loading-text">Загрузка...</p>}
      {error && <p className="error-text">Сведения об основателе не найдены</p>}
      {founder && (
        <div className="founder-layout">
          <div className="founder-photo-wrap">
            {founder.photo_url
              ? <img src={founder.photo_url} alt={founder.name} className="founder-photo" />
              : <div className="founder-photo-placeholder">⚔</div>
            }
          </div>
          <div className="founder-info">
            <h2 className="founder-name">{founder.name}</h2>
            <div className="ornament-divider" style={{ margin: '1rem 0', textAlign: 'left' }}>✦</div>
            <p className="founder-bio">{founder.bio}</p>
          </div>
        </div>
      )}
    </PageSection>
  )
}
