import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { attendEvent, oauthStartUrl } from '../api'
import { useAuth } from '../context/AuthContext'
import { rememberAttendance } from '../utils/attendanceStorage'
import './AdminLogin.css'

function defaultTarget(session, mode) {
  const role = session?.user?.role
  if (role === 'admin' || role === 'founder') return '/admin'
  if (mode === 'register') return '/profile'
  return '/profile'
}
export default function AdminLogin() {
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [mode, setMode] = useState('login')
  const [login, setLogin] = useState('')
  const [email, setEmail] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async event => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const session = mode === 'register'
        ? await signUp({ login, email, display_name: displayName, password })
        : await signIn(login, password)

      const attendId = searchParams.get('attend')
      if (attendId) {
        await attendEvent(attendId, 'going')
        rememberAttendance(session.user, attendId)
      }

      navigate(searchParams.get('next') || defaultTarget(session, mode))
    } catch (err) {
      setError(err?.response?.data?.error || (mode === 'register' ? 'Не удалось зарегистрироваться' : 'Неверный логин или пароль'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-box">
        <div className="login-emblem">F·G</div>
        <h1 className="login-title">{mode === 'register' ? 'Создать аккаунт' : 'Вход на сайт'}</h1>
        <p className="login-sub">
          {mode === 'register'
            ? 'Сначала создается гостевой аккаунт, роль ученика назначат старшие.'
            : 'Для админов, инструкторов, учеников и гостей.'}
        </p>
        <form onSubmit={submit} className="login-form">
          <div className="oauth-buttons">
            <a href={oauthStartUrl('vk')}>Войти через VK</a>
            <a href={oauthStartUrl('google')}>Войти через Google</a>
          </div>
          <div className="login-divider"><span>или</span></div>
          <div className="form-field">
            <label>Логин</label>
            <input value={login} onChange={event => setLogin(event.target.value)} autoComplete="username" />
          </div>
          {mode === 'register' && (
            <>
              <div className="form-field">
                <label>Имя на сайте</label>
                <input value={displayName} onChange={event => setDisplayName(event.target.value)} />
              </div>
              <div className="form-field">
                <label>Email</label>
                <input value={email} onChange={event => setEmail(event.target.value)} autoComplete="email" />
              </div>
            </>
          )}
          <div className="form-field">
            <label>Пароль</label>
            <input type="password" value={password} onChange={event => setPassword(event.target.value)} autoComplete="current-password" />
          </div>
          {error && <p className="login-error">{error}</p>}
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Подождите...' : (mode === 'register' ? 'Зарегистрироваться' : 'Войти')}
          </button>
          <button
            type="button"
            className="btn btn-outline"
            style={{ width: '100%', marginTop: '0.75rem' }}
            onClick={() => setMode(mode === 'register' ? 'login' : 'register')}
          >
            {mode === 'register' ? 'Уже есть аккаунт' : 'Создать аккаунт гостя'}
          </button>
        </form>
      </div>
    </div>
  )
}
