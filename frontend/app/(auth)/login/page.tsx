'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

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
    setTimeout(() => { setLoading(false); router.push('/dashboard') }, 1500)
  }

  const inputStyle = (field: string) => ({
    width: '100%',
    padding: '14px 16px',
    border: `1px solid ${errors[field] ? '#E53E3E' : '#e0d9c0'}`,
    borderRadius: '8px',
    fontSize: '14px',
    color: '#1a1a1a',
    outline: 'none',
    backgroundColor: '#ffffff',
    boxSizing: 'border-box' as const,
  })

  const labelStyle = {
    fontSize: '11px',
    letterSpacing: '2px',
    textTransform: 'uppercase' as const,
    color: '#888',
    display: 'block',
    marginBottom: '8px',
    fontWeight: '600' as const,
  }

  return (
    <div className="auth-shell" style={{ backgroundColor: '#ede8d0' }}>
      <div className="auth-card">

        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <h1 style={{ color: '#1a1a1a', fontSize: '28px', letterSpacing: '3px', marginBottom: '8px', fontWeight: '800' }}>
              EARTHY STAY
            </h1>
          </Link>
          <p style={{ color: '#888', fontSize: '14px' }}>Welcome back</p>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e0d9c0', borderRadius: '12px', padding: 'clamp(24px, 4vw, 40px)' }}>

          <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#1a1a1a', marginBottom: '8px' }}>Sign In</h2>
          <div style={{ width: '40px', height: '2px', backgroundColor: '#e1c391', marginBottom: '28px' }} />

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
            <Link href="/forgot-password" style={{ fontSize: '13px', color: '#e1c391', textDecoration: 'none', fontWeight: '600' }}>
              Forgot Password?
            </Link>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: '100%',
              backgroundColor: loading ? '#d4b87a' : '#e1c391',
              color: '#1a1a1a',
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
            <div style={{ flex: 1, height: '1px', backgroundColor: '#e0d9c0' }} />
            <span style={{ fontSize: '12px', color: '#888' }}>OR</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#e0d9c0' }} />
          </div>

          <button
            style={{
              width: '100%',
              backgroundColor: 'transparent',
              color: '#1a1a1a',
              border: '1px solid #e0d9c0',
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
            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.borderColor = '#e1c391'}
            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.borderColor = '#e0d9c0'}
          >
            <span style={{ fontSize: '16px', fontWeight: '800' }}>G</span>
            Continue with Google
          </button>

          <p style={{ textAlign: 'center', fontSize: '14px', color: '#888' }}>
            Don&apos;t have an account?{' '}
            <Link href="/register" style={{ color: '#e1c391', textDecoration: 'none', fontWeight: '700' }}>
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}