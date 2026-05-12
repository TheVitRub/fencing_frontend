import './PageSection.css'

export default function PageSection({ title, subtitle, children, centered = false }) {
  return (
    <section className={`page-section${centered ? ' centered' : ''}`}>
      <div className="page-wrapper">
        {title && <h2 className="section-title">{title}</h2>}
        {subtitle && <p className="section-subtitle">{subtitle}</p>}
        <div className="ornament-divider">✦</div>
        {children}
      </div>
    </section>
  )
}
