import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { login as apiLogin, register as apiRegister, me as apiMe } from '../api'

const AuthContext = createContext(null)

function readUser() {
  try {
    const raw = localStorage.getItem('fc_user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('fc_token'))
  const [user, setUser] = useState(readUser)

  useEffect(() => {
    if (!token) return
    apiMe()
      .then(data => {
        setUser(data)
        localStorage.setItem('fc_user', JSON.stringify(data))
      })
      .catch(() => signOut())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const applySession = data => {
    localStorage.setItem('fc_token', data.token)
    localStorage.setItem('fc_user', JSON.stringify(data.user))
    setToken(data.token)
    setUser(data.user)
  }

  const signIn = async (loginVal, password) => {
    const session = await apiLogin(loginVal, password)
    applySession(session)
    return session
  }

  const signUp = async data => {
    const session = await apiRegister(data)
    applySession(session)
    return session
  }

  const signOut = () => {
    localStorage.removeItem('fc_token')
    localStorage.removeItem('fc_user')
    setToken(null)
    setUser(null)
  }

  const value = useMemo(() => {
    const role = user?.role || ''
    const isAdmin = role === 'admin' || role === 'founder'
    const isInstructor = role === 'instructor' || isAdmin
    const isStudent = role === 'student' || isInstructor
    return { token, user, role, isAuthenticated: !!token, isAdmin, isInstructor, isStudent, signIn, signUp, signOut }
  }, [token, user])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
