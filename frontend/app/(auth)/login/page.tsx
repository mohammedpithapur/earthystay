'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const redirectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current)
      }
    }
  }, [])

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!form.email.trim()) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Enter a valid email'
    if (!form.password) newErrors.password = 'Password is required'
    else if (form.password.length < 6) newErrors.password = 'Password must be at least 6 characters'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)
    redirectTimeoutRef.current = setTimeout(() => {
      router.replace('/dashboard')
    }, 1500)
  }

  const inputStyle = (field: string) => ({
    width: '100%',
    padding: '14px 16px',
    border: `1px solid ${errors[field] ? '#E53E3E' : 'var(--color-border)'}`,
    borderRadius: '8px',
    fontSize: '14px',
    color: 'var(--color-text-primary)',
    outline: 'none',
    backgroundColor: '#ffffff',
    boxSizing: 'border-box' as const,
  })

  const labelStyle = {
    fontSize: '11px',
    letterSpacing: '2px',
    textTransform: 'uppercase' as const,
    color: 'var(--color-text-muted)',
    display: 'block',
    marginBottom: '8px',
    fontWeight: '600' as const,
  }

  return (
    <div className="auth-shell" style={{ backgroundColor: 'var(--color-bg-soft)' }}>
      <div className="auth-card">

        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <h1 style={{ color: 'var(--color-text-primary)', fontSize: '28px', letterSpacing: '3px', marginBottom: '8px', fontWeight: '800' }}>
              EARTHY STAY
            </h1>
          </Link>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>Welcome back</p>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid var(--color-border)', borderRadius: '12px', padding: 'clamp(24px, 4vw, 40px)' }}>

          <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--color-text-primary)', marginBottom: '8px' }}>Sign In</h2>
          <div style={{ width: '40px', height: '2px', backgroundColor: 'var(--color-gold)', marginBottom: '28px' }} />

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Email Address</label>
            <input type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={inputStyle('email')} />
            {errors.email && <p style={{ color: '#E53E3E', fontSize: '12px', marginTop: '4px' }}>{errors.email}</p>}
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={labelStyle}>Password</label>
            <input type="password" placeholder="••••••••" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} style={inputStyle('password')} />
            {errors.password && <p style={{ color: '#E53E3E', fontSize: '12px', marginTop: '4px' }}>{errors.password}</p>}
          </div>

          <div style={{ textAlign: 'right', marginBottom: '28px' }}>
            <Link href="/forgot-password" style={{ fontSize: '13px', color: 'var(--color-gold)', textDecoration: 'none', fontWeight: '600' }}>
              Forgot Password?
            </Link>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: '100%',
              backgroundColor: loading ? 'var(--color-gold)' : 'var(--color-gold)',
              color: 'var(--color-text-primary)',
              border: 'none',
              padding: '16px',
              fontSize: '13px',
              letterSpacing: '2px',
              fontWeight: '700',
              textTransform: 'uppercase',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: '24px',
              borderRadius: '8px',
              transition: 'opacity 0.2s ease',
            }}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }} />
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>OR</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }} />
          </div>

          <button
            style={{
              width: '100%',
              backgroundColor: 'transparent',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              padding: '14px',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              marginBottom: '24px',
              transition: 'border-color 0.2s ease',
              fontWeight: '600',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-gold)'}
            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-border)'}
          >
            <span style={{ fontSize: '16px', fontWeight: '800' }}>G</span>
            Continue with Google
          </button>

          <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--color-text-muted)' }}>
            Don&apos;t have an account?{' '}
            <Link href="/register" style={{ color: 'var(--color-gold)', textDecoration: 'none', fontWeight: '700' }}>
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
