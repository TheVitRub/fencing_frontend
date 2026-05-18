import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { oauthStartUrl } from '../api'
import { useAuth } from '../context/AuthContext'
import './AdminLogin.css'

export default function AdminLogin() {
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState('login')
  const [login, setLogin] = useState('')
  const [email, setEmail] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'register') {
        await signUp({ login, email, display_name: displayName, password })
        navigate('/events')
      } else {
        await signIn(login, password)
        navigate('/admin')
      }
    } catch {
      setError(mode === 'register' ? 'Не удалось зарегистрироваться' : 'Неверный логин или пароль')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-box">
        <div className="login-emblem">⚔</div>
        <h1 className="login-title">{mode === 'register' ? 'Вступить в хронику' : 'Вход в цитадель'}</h1>
        <p className="login-sub">{mode === 'register' ? 'Аккаунт гостя создаётся сразу, роль ученика назначат старшие' : 'Для админов, инструкторов и учеников'}</p>
        <form onSubmit={submit} className="login-form">
          <div className="oauth-buttons">
            <a href={oauthStartUrl('vk')}>Войти через VK</a>
            <a href={oauthStartUrl('google')}>Войти через Google</a>
          </div>
          <div className="login-divider"><span>или</span></div>
          <div className="form-field">
            <label>Логин</label>
            <input value={login} onChange={e => setLogin(e.target.value)} autoComplete="username" />
          </div>
          {mode === 'register' && (
            <>
              <div className="form-field">
                <label>Имя на сайте</label>
                <input value={displayName} onChange={e => setDisplayName(e.target.value)} />
              </div>
              <div className="form-field">
                <label>Email</label>
                <input value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
              </div>
            </>
          )}
          <div className="form-field">
            <label>Пароль</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" />
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
