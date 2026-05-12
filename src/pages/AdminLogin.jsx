import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './AdminLogin.css'

export default function AdminLogin() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn(login, password)
      navigate('/admin')
    } catch {
      setError('Неверный логин или пароль')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-box">
        <div className="login-emblem">⚔</div>
        <h1 className="login-title">Вход в цитадель</h1>
        <p className="login-sub">Только для посвящённых</p>
        <form onSubmit={submit} className="login-form">
          <div className="form-field">
            <label>Логин</label>
            <input value={login} onChange={e => setLogin(e.target.value)} autoComplete="username" />
          </div>
          <div className="form-field">
            <label>Пароль</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" />
          </div>
          {error && <p className="login-error">{error}</p>}
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Входим...' : 'Войти'}
          </button>
        </form>
      </div>
    </div>
  )
}
