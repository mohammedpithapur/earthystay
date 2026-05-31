'use client'
import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import type { User } from '@/lib/types'

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000'

// ── Types ──────────────────────────────────────────────────────────────────────

export interface AuthContextType {
  user: User | null
  accessToken: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, fullName: string, phone?: string) => Promise<void>
  logout: () => Promise<void>
  /** Use instead of raw fetch() for any protected API call.
   *  Automatically injects the Authorization header and retries once on 401. */
  fetchWithAuth: (url: string, options?: RequestInit) => Promise<Response>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Parse the `exp` claim from a JWT without a library. */
function parseJwtExp(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    return payload.exp ? payload.exp * 1000 : null
  } catch {
    return null
  }
}

const REFRESH_MARGIN_MS = 2 * 60 * 1000 // start refresh 2 min before expiry

// ── Provider ──────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Ref so scheduleRefresh can call silentRefresh without a circular dep
  const silentRefreshRef = useRef<(() => Promise<string | null>) | undefined>(undefined)

  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearRefreshTimer = () => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current)
      refreshTimerRef.current = null
    }
  }

  /** Schedule an automatic silent refresh before the access token expires. */
  const scheduleRefresh = useCallback((token: string) => {
    clearRefreshTimer()
    const exp = parseJwtExp(token)
    if (!exp) return
    const delay = exp - Date.now() - REFRESH_MARGIN_MS
    if (delay <= 0) return // already too close — will refresh on next 401
    refreshTimerRef.current = setTimeout(async () => {
      await silentRefreshRef.current?.()
    }, delay)
  }, [])

  /** Call POST /auth/refresh which reads the httpOnly cookie and returns a new access token. */
  const silentRefresh = useCallback(async (): Promise<string | null> => {
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        credentials: 'include', // sends the httpOnly cookie
      })
      if (!res.ok) {
        setUser(null)
        setAccessToken(null)
        clearRefreshTimer()
        return null
      }
      const data = await res.json()
      setAccessToken(data.access_token)
      setUser(data.user)
      scheduleRefresh(data.access_token)
      return data.access_token
    } catch {
      setUser(null)
      setAccessToken(null)
      return null
    }
  }, [scheduleRefresh])

  // Keep the ref in sync so scheduleRefresh always calls the latest version
  useEffect(() => {
    silentRefreshRef.current = silentRefresh
  }, [silentRefresh])

  // On first mount: restore session from the refresh cookie (if any)
  useEffect(() => {
    const timer = setTimeout(() => {
      silentRefresh().finally(() => setLoading(false))
    }, 0)
    return () => {
      clearTimeout(timer)
      clearRefreshTimer()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Auth actions ─────────────────────────────────────────────────────────────

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.detail || 'Login failed')
    }
    const data = await res.json()
    setAccessToken(data.access_token)
    setUser(data.user)
    scheduleRefresh(data.access_token)
  }, [scheduleRefresh])

  const register = useCallback(async (
    email: string,
    password: string,
    fullName: string,
    phone?: string,
  ) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, full_name: fullName, phone }),
      credentials: 'include',
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.detail || 'Registration failed')
    }
    const data = await res.json()
    setAccessToken(data.access_token)
    setUser(data.user)
    scheduleRefresh(data.access_token)
  }, [scheduleRefresh])

  const logout = useCallback(async () => {
    clearRefreshTimer()
    await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    }).catch(() => {})
    setUser(null)
    setAccessToken(null)
  }, [])

  // ── fetchWithAuth ─────────────────────────────────────────────────────────────

  /**
   * Drop-in replacement for fetch() on protected endpoints.
   * - Injects Authorization header automatically
   * - On 401: silently refreshes and retries once
   * - On second 401: logs out
   */
  const fetchWithAuth = useCallback(async (
    url: string,
    options: RequestInit = {},
  ): Promise<Response> => {
    let token = accessToken

    const makeRequest = (t: string | null) =>
      (() => {
        const headers = new Headers(options.headers)
        if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
          headers.set('Content-Type', 'application/json')
        }
        if (t) {
          headers.set('Authorization', `Bearer ${t}`)
        } else {
          headers.delete('Authorization')
        }

        return fetch(url, {
          ...options,
          credentials: 'include',
          headers,
        })
      })()

    let res = await makeRequest(token)

    if (res.status === 401) {
      // Token may have just expired — try refreshing once
      token = await silentRefresh()
      if (token) {
        res = await makeRequest(token)
      } else {
        // Refresh failed — session is dead
        setUser(null)
        setAccessToken(null)
      }
    }

    return res
  }, [accessToken, silentRefresh])

  return (
    <AuthContext.Provider value={{ user, accessToken, loading, login, register, logout, fetchWithAuth }}>
      {children}
    </AuthContext.Provider>
  )
}
