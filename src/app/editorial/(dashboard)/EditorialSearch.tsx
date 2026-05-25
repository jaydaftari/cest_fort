'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useRef, useState, useTransition } from 'react'

export default function EditorialSearch({ defaultValue }: { defaultValue: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(defaultValue)
  const [, startTransition] = useTransition()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const push = (q: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (q.trim()) {
      params.set('q', q.trim())
    } else {
      params.delete('q')
    }
    // Always reset to page 1 on new search
    params.delete('page')
    startTransition(() => {
      router.push(`/editorial?${params.toString()}`)
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    setValue(v)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => push(v), 380)
  }

  const handleClear = () => {
    setValue('')
    if (debounceRef.current) clearTimeout(debounceRef.current)
    push('')
  }

  return (
    <div style={{ position: 'relative', flex: 1, maxWidth: 420 }}>
      {/* Search icon */}
      <svg
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        style={{
          position: 'absolute',
          left: 12,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 15,
          height: 15,
          color: '#aaa',
          pointerEvents: 'none',
        }}
      >
        <circle cx="8.5" cy="8.5" r="5.5" />
        <path d="M15 15l-3-3" strokeLinecap="round" />
      </svg>

      <input
        type="search"
        placeholder="Search by title, author, email…"
        value={value}
        onChange={handleChange}
        style={{
          width: '100%',
          padding: '10px 36px 10px 36px',
          background: '#fff',
          border: '1px solid #cfc4c5',
          borderRadius: 2,
          fontSize: 13,
          color: '#1a1c1c',
          fontFamily: "'Hanken Grotesk', sans-serif",
          outline: 'none',
          boxSizing: 'border-box',
        }}
      />

      {/* Clear button */}
      {value && (
        <button
          onClick={handleClear}
          style={{
            position: 'absolute',
            right: 10,
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#aaa',
            fontSize: 16,
            lineHeight: 1,
            padding: 2,
            display: 'flex',
            alignItems: 'center',
          }}
          aria-label="Clear search"
        >
          ×
        </button>
      )}
    </div>
  )
}
