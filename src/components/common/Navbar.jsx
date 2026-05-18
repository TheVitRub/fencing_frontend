import { useState } from 'react'
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
  const [isOpen, setIsOpen] = useState(false)

  const closeMenu = () => setIsOpen(false)

  return (
    <header className="navbar">
      <div className="navbar-inner page-wrapper">
        <NavLink to="/" className="navbar-logo" onClick={closeMenu}>
          <span className="logo-sword">⚔</span>
          <span className="logo-text">Ferrum et Gloria</span>
        </NavLink>
        <button
          className="navbar-toggle"
          type="button"
          aria-expanded={isOpen}
          aria-controls="site-navigation"
          aria-label={isOpen ? 'Закрыть меню' : 'Открыть меню'}
          onClick={() => setIsOpen(value => !value)}
        >
          <span />
          <span />
          <span />
        </button>
        <nav id="site-navigation" className={`navbar-links${isOpen ? ' is-open' : ''}`}>
          {links.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              onClick={closeMenu}
              className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
            >
              {l.label}
            </NavLink>
          ))}
          {isAdmin && (
            <NavLink to="/admin" onClick={closeMenu} className={({ isActive }) => 'nav-link nav-admin' + (isActive ? ' active' : '')}>
              Админ
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  )
}
