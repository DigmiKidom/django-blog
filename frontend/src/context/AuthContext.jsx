import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import client, { tokenStore } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => tokenStore.getUser())

  const logout = useCallback(() => {
    // התנתקות ב-JWT היא מחיקת הטוקנים בצד הלקוח.
    // אין מצב התחברות שמור בשרת שצריך לבטל.
    tokenStore.clear()
    setUser(null)
  }, [])

  // ה-interceptor משדר את האירוע הזה כשחידוש הטוקן נכשל
  useEffect(() => {
    window.addEventListener('auth:logout', logout)
    return () => window.removeEventListener('auth:logout', logout)
  }, [logout])

  const login = useCallback(async (username, password) => {
    const { data } = await client.post('/token/', { username, password })
    tokenStore.save({ access: data.access, refresh: data.refresh, user: data.user })
    setUser(data.user)
    return data.user
  }, [])

  const register = useCallback(
    async (payload) => {
      await client.post('/register/', payload)
      // הרשמה מוצלחת מתחברת אוטומטית, כדי לחסוך מהמשתמש טופס שני
      return login(payload.username, payload.password)
    },
    [login],
  )

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isManager: Boolean(user?.groups?.includes('managers')),
      login,
      register,
      logout,
    }),
    [user, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth חייב להיקרא בתוך AuthProvider')
  }
  return context
}
