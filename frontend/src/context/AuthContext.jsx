import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authAPI } from '../utils/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)  // true while checking session on mount

  // Check existing session on app load
  const checkAuth = useCallback(async () => {
    try {
      const data = await authAPI.me()
      if (data.authenticated) {
        setUser(data.user)
        setIsAuthenticated(true)
      } else {
        setUser(null)
        setIsAuthenticated(false)
      }
    } catch {
      // 401 = not logged in, not an error worth logging
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  // Login
  async function login(email, password) {
    const data = await authAPI.login(email, password)
    setUser(data.user)
    setIsAuthenticated(true)
    return data.user
  }

  // Register
  async function register(username, email, password, role = 'viewer') {
    const data = await authAPI.register(username, email, password, role)
    return data
  }

  // Logout
  async function logout() {
    try {
      await authAPI.logout()
    } finally {
      setUser(null)
      setIsAuthenticated(false)
    }
  }

  // Convenience helpers
  const isCreator = user?.role === 'creator'
  const isAdmin = user?.role === 'admin'

  const value = {
    user,
    isAuthenticated,
    loading,
    isCreator,
    isAdmin,
    login,
    register,
    logout,
    checkAuth,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
