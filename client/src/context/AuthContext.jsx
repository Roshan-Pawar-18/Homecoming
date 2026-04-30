import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // Try to load user from localStorage (persists across page refresh)
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('hc_user')
    return saved ? JSON.parse(saved) : null
  })

  const [token, setToken] = useState(() => localStorage.getItem('hc_token') || null)

  // login: save user + JWT token to state AND localStorage
  const login = (userData, jwtToken) => {
    setUser(userData)
    setToken(jwtToken)
    localStorage.setItem('hc_user', JSON.stringify(userData))
    localStorage.setItem('hc_token', jwtToken)
  }

  // logout: clear everything
  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('hc_user')
    localStorage.removeItem('hc_token')
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook — use this anywhere: const { user, login, logout } = useAuth()
export function useAuth() {
  return useContext(AuthContext)
}