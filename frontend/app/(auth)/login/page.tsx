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
    // Simulate API call — real login will use Supabase Auth
    setTimeout(() => {
      setLoading(false)
      router.push('/dashboard')
    }, 1500)
  }

  const inputStyle = (field: string) => ({
    width: '100%',
    padding: '14px 16px',
    border: `1px solid ${errors[field] ? '#E53E3E' : '#E5E0D8'}`,
    fontSize: '14px',
    color: '#1C1C1C',
    outline: 'none',
    backgroundColor: '#FAF8F5',
    boxSizing: 'border-box' as const,
    fontFamily: 'inherit'
  })

  const labelStyle = {
    fontSize: '11px',
    letterSpacing: '2px',
    textTransform: 'uppercase' as const,
    color: '#888',
    display: 'block',
    marginBottom: '8px',
    fontWeight: '600' as const
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#FAF8F5',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 24px'
    }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <h1 style={{ fontFamily: 'Georgia, serif', color: '#C9A84C', fontSize: '28px', letterSpacing: '3px', marginBottom: '8px' }}>
              EARTHY STAY
            </h1>
          </Link>
          <p style={{ color: '#888', fontSize: '14px' }}>Welcome back</p>
        </div>

        {/* Card */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E0D8', padding: '40px' }}>

          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '24px', color: '#1C1C1C', marginBottom: '8px' }}>
            Sign In
          </h2>
          <div style={{ width: '40px', height: '1px', backgroundColor: '#C9A84C', marginBottom: '28px' }} />

          {/* Email */}
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Email Address</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              style={inputStyle('email')}
            />
            {errors.email && <p style={{ color: '#E53E3E', fontSize: '12px', marginTop: '4px' }}>{errors.email}</p>}
          </div>

          {/* Password */}
          <div style={{ marginBottom: '12px' }}>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              style={inputStyle('password')}
            />
            {errors.password && <p style={{ color: '#E53E3E', fontSize: '12px', marginTop: '4px' }}>{errors.password}</p>}
          </div>

          {/* Forgot Password */}
          <div style={{ textAlign: 'right', marginBottom: '28px' }}>
            <Link href="/forgot-password" style={{ fontSize: '13px', color: '#C9A84C', textDecoration: 'none' }}>
              Forgot Password?
            </Link>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: '100%',
              backgroundColor: loading ? '#E8D5A3' : '#C9A84C',
              color: '#1C1C1C',
              border: 'none',
              padding: '16px',
              fontSize: '13px',
              letterSpacing: '2px',
              fontWeight: '700',
              textTransform: 'uppercase',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: '24px',
              transition: 'opacity 0.2s ease'
            }}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#E5E0D8' }} />
            <span style={{ fontSize: '12px', color: '#888' }}>OR</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#E5E0D8' }} />
          </div>

          {/* Google Login */}
          <button
            style={{
              width: '100%',
              backgroundColor: 'transparent',
              color: '#1C1C1C',
              border: '1px solid #E5E0D8',
              padding: '14px',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              marginBottom: '24px',
              transition: 'border-color 0.2s ease'
            }}
            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.borderColor = '#C9A84C'}
            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.borderColor = '#E5E0D8'}
          >
            <span style={{ fontSize: '18px' }}>G</span>
            Continue with Google
          </button>

          {/* Register Link */}
          <p style={{ textAlign: 'center', fontSize: '14px', color: '#888' }}>
            Don&apos;t have an account?{' '}
            <Link href="/register" style={{ color: '#C9A84C', textDecoration: 'none', fontWeight: '600' }}>
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}