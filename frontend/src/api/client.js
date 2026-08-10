import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'

export const STORAGE_KEYS = {
  access: 'blog_access',
  refresh: 'blog_refresh',
  user: 'blog_user',
}

export const tokenStore = {
  getAccess: () => localStorage.getItem(STORAGE_KEYS.access),
  getRefresh: () => localStorage.getItem(STORAGE_KEYS.refresh),

  getUser: () => {
    const raw = localStorage.getItem(STORAGE_KEYS.user)
    if (!raw) return null
    try {
      return JSON.parse(raw)
    } catch {
      return null
    }
  },

  save: ({ access, refresh, user }) => {
    localStorage.setItem(STORAGE_KEYS.access, access)
    localStorage.setItem(STORAGE_KEYS.refresh, refresh)
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user))
  },

  saveAccess: (access) => localStorage.setItem(STORAGE_KEYS.access, access),

  clear: () => Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k)),
}

const client = axios.create({ baseURL: BASE_URL })

// מצרף את טוקן הגישה לכל בקשה יוצאת
client.interceptors.request.use((config) => {
  const access = tokenStore.getAccess()
  if (access) {
    config.headers.Authorization = `Bearer ${access}`
  }
  return config
})

/**
 * מטפל בטוקן שפג תוקפו.
 *
 * בתשובת 401 מנסים פעם אחת לחדש את הטוקן באמצעות ה-refresh,
 * ואז מריצים מחדש את הבקשה המקורית. אם גם החידוש נכשל —
 * הטוקנים נמחקים והמשתמש מנותק.
 *
 * הדגל _retry מונע לולאה אינסופית של ניסיונות חידוש.
 */
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    const isAuthCall = original?.url?.includes('/token/')

    if (error.response?.status !== 401 || original._retry || isAuthCall) {
      return Promise.reject(error)
    }

    const refresh = tokenStore.getRefresh()
    if (!refresh) {
      tokenStore.clear()
      return Promise.reject(error)
    }

    original._retry = true

    try {
      const { data } = await axios.post(`${BASE_URL}/token/refresh/`, { refresh })
      tokenStore.saveAccess(data.access)
      original.headers.Authorization = `Bearer ${data.access}`
      return client(original)
    } catch (refreshError) {
      tokenStore.clear()
      window.dispatchEvent(new Event('auth:logout'))
      return Promise.reject(refreshError)
    }
  },
)

/** ממיר שגיאת DRF להודעה קריאה בעברית. */
export function readError(error, fallback = 'אירעה שגיאה. נסה שוב.') {
  const data = error?.response?.data

  if (!data) return fallback
  if (typeof data === 'string') return data
  if (data.detail) return data.detail

  const messages = Object.entries(data).map(([field, value]) => {
    const text = Array.isArray(value) ? value.join(' ') : String(value)
    return field === 'non_field_errors' ? text : `${field}: ${text}`
  })

  return messages.join(' | ') || fallback
}

export default client
