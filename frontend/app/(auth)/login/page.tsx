'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth/AuthContext'
import { API_BASE } from '@/lib/auth/AuthContext'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/dashboard'
  const { login, user, loading } = useAuth()

  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [apiError, setApiError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Already logged in → redirect
  useEffect(() => {
    if (!loading && user) {
      router.replace(next)
    }
  }, [user, loading, router, next])

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.email.trim()) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.password) e.password = 'Password is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setApiError('')
    setSubmitting(true)
    try {
      await login(form.email, form.password)
      router.replace(next)
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setSubmitting(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/google/url?next=${encodeURIComponent(next)}`)
      if (!res.ok) {
        setApiError('Google login is not configured yet.')
        return
      }
      const { url } = await res.json()
      window.location.href = url
    } catch {
      setApiError('Failed to start Google login.')
    }
  }

  const inputStyle = (field: string) => ({
    width: '100%',
    padding: '14px 16px',
    border: `1px solid ${errors[field] ? '#E53E3E' : 'var(--color-border)'}`,
    borderRadius: '8px',
    import { Suspense } from 'react'
    import LoginClient from './LoginClient'

    export default function LoginPage() {
      return (
        <Suspense fallback={null}>
          <LoginClient />
        </Suspense>
      )
    }
    textTransform: 'uppercase' as const,
