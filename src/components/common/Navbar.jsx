import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './Navbar.css'

const links = [
  { to: '/',             label: 'Главная' },
  { to: '/events',       label: 'События' },
  { to: '/plans',        label: 'Планы' },
  { to: '/honor',        label: 'Доска почёта' },
  { to: '/achievements', label: 'Достижения' },
  { to: '/founder',      label: 'Основатель' },
]

export default function Navbar() {
  const { isAdmin } = useAuth()
  return (
    <header className="navbar">
      <div className="navbar-inner page-wrapper">
        <NavLink to="/" className="navbar-logo">
          <span className="logo-sword">⚔</span>
          <span className="logo-text">Ferrum et Gloria</span>
        </NavLink>
        <nav className="navbar-links">
          {links.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
            >
              {l.label}
            </NavLink>
          ))}
          {isAdmin && (
            <NavLink to="/admin" className={({ isActive }) => 'nav-link nav-admin' + (isActive ? ' active' : '')}>
              Админ
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  )
}
