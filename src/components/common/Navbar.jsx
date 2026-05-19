import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './Navbar.css'

const links = [
  { to: '/', label: 'Главная' },
  { to: '/events', label: 'События' },
  { to: '/calendar', label: 'Календарь' },
  { to: '/instructors', label: 'Инструкторы' },
  { to: '/students', label: 'Ученикам' },
  { to: '/glossary', label: 'Глоссарий' },
  { to: '/plans', label: 'Планы' },
  { to: '/honor', label: 'Почёт' },
  { to: '/achievements', label: 'Достижения' },
  { to: '/founder', label: 'Основатель' },
]

export default function Navbar() {
  const { isAuthenticated, isInstructor, signOut } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  const closeMenu = () => setIsOpen(false)

  return (
    <header className="navbar">
      <div className="navbar-inner page-wrapper">
        <NavLink to="/" className="navbar-logo" onClick={closeMenu}>
          <span className="logo-sword">F·G</span>
          <span className="logo-text">Ferrum et Gloria</span>
          <span className="logo-place">Кемерово</span>
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
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              onClick={closeMenu}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              {link.label}
            </NavLink>
          ))}
          {isAuthenticated && (
            <NavLink to="/profile" onClick={closeMenu} className={({ isActive }) => `nav-link nav-admin${isActive ? ' active' : ''}`}>
              Кабинет
            </NavLink>
          )}
          {isInstructor && (
            <NavLink to="/admin" onClick={closeMenu} className={({ isActive }) => `nav-link nav-admin${isActive ? ' active' : ''}`}>
              Панель
            </NavLink>
          )}
          {isAuthenticated ? (
            <button className="nav-link nav-button" onClick={() => { signOut(); closeMenu() }}>
              Выйти
            </button>
          ) : (
            <NavLink to="/login" onClick={closeMenu} className={({ isActive }) => `nav-link nav-admin${isActive ? ' active' : ''}`}>
              Вход
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  )
}
