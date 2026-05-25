export default function CategoryLoading() {
  return (
    <div
      style={{
        maxWidth: 'var(--container)',
        margin: '0 auto',
        padding: '48px var(--gutter) 96px',
      }}
    >
      {/* Category header */}
      <div style={{ marginBottom: 48 }}>
        <div className="skeleton" style={{ height: 12, width: 80, marginBottom: 16 }} />
        <div className="skeleton" style={{ height: 44, width: 260, marginBottom: 12 }} />
        <div className="skeleton" style={{ height: 18, width: 400 }} />
      </div>

      {/* Article list */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 160px',
            gap: 32,
            padding: '28px 0',
            borderTop: '1px solid var(--line)',
          }}
        >
          <div>
            <div className="skeleton" style={{ height: 10, width: 80, marginBottom: 14 }} />
            <div className="skeleton" style={{ height: 26, width: '85%', marginBottom: 8 }} />
            <div className="skeleton" style={{ height: 26, width: '65%', marginBottom: 16 }} />
            <div className="skeleton" style={{ height: 14, width: '75%', marginBottom: 12 }} />
            <div className="skeleton" style={{ height: 12, width: 120 }} />
          </div>
          <div className="skeleton" style={{ height: 120, borderRadius: 2 }} />
        </div>
      ))}
    </div>
  )
}
