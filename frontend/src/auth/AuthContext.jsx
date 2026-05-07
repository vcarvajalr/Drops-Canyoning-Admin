import { createContext, useContext, useEffect, useMemo, useState } from 'react'

import api, { storage } from '../api/client'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(storage.getUser())
  const [isLoading, setIsLoading] = useState(Boolean(storage.getAccessToken()))

  useEffect(() => {
    const bootstrap = async () => {
      if (!storage.getAccessToken()) {
        setIsLoading(false)
        return
      }

      try {
        const response = await api.get('/api/auth/me/')
        setUser(response.data)
        storage.setSession({
          access: storage.getAccessToken(),
          refresh: storage.getRefreshToken(),
          user: response.data,
        })
      } catch {
        storage.clear()
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    bootstrap()
  }, [])

  const login = async (credentials) => {
    const response = await api.post('/api/auth/token/', credentials)
    storage.setSession(response.data)
    setUser(response.data.user)
    return response.data.user
  }

  const logout = () => {
    storage.clear()
    setUser(null)
  }

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      logout,
    }),
    [isLoading, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
