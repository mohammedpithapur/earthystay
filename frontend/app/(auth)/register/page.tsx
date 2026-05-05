'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!form.full_name.trim()) newErrors.full_name = 'Full name is required'
    if (!form.email.trim()) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Enter a valid email'
    if (!form.phone.trim()) newErrors.phone = 'Phone number is required'
    else if (form.phone.length < 10) newErrors.phone = 'Enter a valid phone number'
    if (!form.password) newErrors.password = 'Password is required'
    else if (form.password.length < 6) newErrors.password = 'Password must be at least 6 characters'
    if (!form.confirm_password) newErrors.confirm_password = 'Please confirm your password'
    else if (form.password !== form.confirm_password) newErrors.confirm_password = 'Passwords do not match'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)
    // Simulate API call — real register will use Supabase Auth
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
          <p style={{ color: '#888', fontSize: '14px' }}>Create your account</p>
        </div>

        {/* Card */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E0D8', padding: '40px' }}>

          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '24px', color: '#1C1C1C', marginBottom: '8px' }}>
            Create Account
          </h2>
          <div style={{ width: '40px', height: '1px', backgroundColor: '#C9A84C', marginBottom: '28px' }} />

          {/* Full Name */}
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Full Name</label>
            <input
              type="text"
              placeholder="Full Name"
              value={form.full_name}
              onChange={e => setForm({ ...form, full_name: e.target.value })}
              style={inputStyle('full_name')}
            />
            {errors.full_name && <p style={{ color: '#E53E3E', fontSize: '12px', marginTop: '4px' }}>{errors.full_name}</p>}
          </div>

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

          {/* Phone */}
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Phone Number</label>
            <input
              type="tel"
              placeholder="+91 98765 43210"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              style={inputStyle('phone')}
            />
            {errors.phone && <p style={{ color: '#E53E3E', fontSize: '12px', marginTop: '4px' }}>{errors.phone}</p>}
          </div>

          {/* Password */}
          <div style={{ marginBottom: '20px' }}>
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

          {/* Confirm Password */}
          <div style={{ marginBottom: '28px' }}>
            <label style={labelStyle}>Confirm Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.confirm_password}
              onChange={e => setForm({ ...form, confirm_password: e.target.value })}
              style={inputStyle('confirm_password')}
            />
            {errors.confirm_password && <p style={{ color: '#E53E3E', fontSize: '12px', marginTop: '4px' }}>{errors.confirm_password}</p>}
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
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#E5E0D8' }} />
            <span style={{ fontSize: '12px', color: '#888' }}>OR</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#E5E0D8' }} />
          </div>

          {/* Google Register */}
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

          {/* Terms */}
          <p style={{ textAlign: 'center', fontSize: '12px', color: '#888', marginBottom: '16px', lineHeight: '1.6' }}>
            By creating an account you agree to our{' '}
            <Link href="/terms" style={{ color: '#C9A84C', textDecoration: 'none' }}>Terms</Link>
            {' '}and{' '}
            <Link href="/privacy" style={{ color: '#C9A84C', textDecoration: 'none' }}>Privacy Policy</Link>
          </p>

          {/* Login Link */}
          <p style={{ textAlign: 'center', fontSize: '14px', color: '#888' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: '#C9A84C', textDecoration: 'none', fontWeight: '600' }}>
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}