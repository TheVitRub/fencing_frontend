import { createContext, useContext, useState } from 'react'
import { login as apiLogin } from '../api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('fc_token'))

  const signIn = async (loginVal, password) => {
    const data = await apiLogin(loginVal, password)
    localStorage.setItem('fc_token', data.token)
    setToken(data.token)
  }

  const signOut = () => {
    localStorage.removeItem('fc_token')
    setToken(null)
  }

  return (
    <AuthContext.Provider value={{ token, isAdmin: !!token, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
