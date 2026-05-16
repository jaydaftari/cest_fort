'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    await fetch('/api/users/logout', { method: 'POST', credentials: 'include' })
    router.push('/editorial/login')
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      style={{
        fontSize: 11, fontWeight: 600, letterSpacing: '0.12em',
        textTransform: 'uppercase',
        background: 'transparent',
        border: '1px solid #cfc4c5',
        borderRadius: 2,
        padding: '6px 14px',
        color: '#5d5f5f',
        cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.6 : 1,
        fontFamily: "'Hanken Grotesk', sans-serif",
        transition: 'background 0.15s, color 0.15s',
      }}
      onMouseOver={(e) => { if (!loading) { e.currentTarget.style.background = '#1a1c1c'; e.currentTarget.style.color = '#fff' } }}
      onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#5d5f5f' }}
    >
      {loading ? 'Signing out…' : 'Sign out'}
    </button>
  )
}
