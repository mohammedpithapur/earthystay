'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [form, setForm] = useState({ password: '', confirm_password: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!form.password) newErrors.password = 'Password is required'
    else if (form.password.length < 6) newErrors.password = 'Password must be at least 6 characters'
    if (!form.confirm_password) newErrors.confirm_password = 'Please confirm your password'
    else if (form.password !== form.confirm_password) newErrors.confirm_password = 'Passwords do not match'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setSuccess(true)
      setTimeout(() => router.push('/login'), 2500)
    }, 1500)
  }

  const inputStyle = (field: string) => ({
    width: '100%', padding: '14px 16px',
    border: `1px solid ${errors[field] ? '#E53E3E' : '#e0d9c0'}`,
    borderRadius: '8px', fontSize: '14px', color: '#1a1a1a',
    outline: 'none', backgroundColor: '#ffffff',
    boxSizing: 'border-box' as const, fontFamily: 'inherit'
  })

  return (
    <div className="auth-shell" style={{ backgroundColor: '#ede8d0' }}>
      <div className="auth-card">

        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <h1 style={{ color: '#1a1a1a', fontSize: '28px', letterSpacing: '3px', marginBottom: '8px', fontWeight: '800' }}>
              EARTHY STAY
            </h1>
          </Link>
          <p style={{ color: '#888', fontSize: '14px' }}>Create a new password</p>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e0d9c0', borderRadius: '12px', padding: 'clamp(24px, 4vw, 40px)' }}>

          {!success ? (
            <>
              <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#1a1a1a', marginBottom: '8px' }}>
                Reset Password
              </h2>
              <div style={{ width: '40px', height: '2px', backgroundColor: '#e1c391', marginBottom: '16px' }} />
              <p style={{ fontSize: '14px', color: '#555', marginBottom: '28px', lineHeight: '1.6' }}>
                Choose a strong password that you haven&apos;t used before.
              </p>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: '#888', display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  style={inputStyle('password')}
                />
                {errors.password && <p style={{ color: '#E53E3E', fontSize: '12px', marginTop: '4px' }}>{errors.password}</p>}
              </div>

              <div style={{ marginBottom: '28px' }}>
                <label style={{ fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: '#888', display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Confirm New Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={form.confirm_password}
                  onChange={e => setForm({ ...form, confirm_password: e.target.value })}
                  style={inputStyle('confirm_password')}
                />
                {errors.confirm_password && <p style={{ color: '#E53E3E', fontSize: '12px', marginTop: '4px' }}>{errors.confirm_password}</p>}
              </div>

              {/* Password strength hint */}
              <div style={{ backgroundColor: '#ede8d0', borderRadius: '8px', padding: '12px 16px', marginBottom: '24px' }}>
                <p style={{ fontSize: '12px', color: '#555', lineHeight: '1.6' }}>
                  Password must be at least 6 characters. Use a mix of letters, numbers and symbols for a stronger password.
                </p>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  width: '100%', backgroundColor: loading ? '#d4b87a' : '#e1c391',
                  color: '#1a1a1a', border: 'none', padding: '16px',
                  fontSize: '13px', letterSpacing: '2px', fontWeight: '700',
                  textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer',
                  borderRadius: '8px'
                }}
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{
                width: '64px', height: '64px', backgroundColor: '#e1c391',
                borderRadius: '50%', display: 'flex', alignItems: 'center',
                justifyContent: 'center', margin: '0 auto 24px',
                fontSize: '28px', fontWeight: '700', color: '#1a1a1a'
              }}>
                &#10003;
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#1a1a1a', marginBottom: '12px' }}>
                Password Updated!
              </h2>
              <div style={{ width: '40px', height: '2px', backgroundColor: '#e1c391', margin: '0 auto 16px' }} />
              <p style={{ fontSize: '14px', color: '#555', lineHeight: '1.7' }}>
                Your password has been successfully updated. Redirecting you to sign in...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}