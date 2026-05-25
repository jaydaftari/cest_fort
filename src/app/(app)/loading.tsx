export default function AppLoading() {
  return (
    <div
      style={{
        maxWidth: 'var(--container)',
        margin: '0 auto',
        padding: '48px var(--gutter) 96px',
      }}
    >
      {/* Hero skeleton */}
      <div style={{ marginBottom: 64 }}>
        <div className="skeleton" style={{ height: 14, width: 120, marginBottom: 24 }} />
        <div className="skeleton" style={{ height: 52, width: '70%', marginBottom: 16 }} />
        <div className="skeleton" style={{ height: 52, width: '50%', marginBottom: 32 }} />
        <div className="skeleton" style={{ height: 400, width: '100%', borderRadius: 2 }} />
      </div>

      {/* Article grid skeleton */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 40,
        }}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i}>
            <div className="skeleton" style={{ height: 200, marginBottom: 16, borderRadius: 2 }} />
            <div className="skeleton" style={{ height: 10, width: 80, marginBottom: 12 }} />
            <div className="skeleton" style={{ height: 24, width: '90%', marginBottom: 8 }} />
            <div className="skeleton" style={{ height: 24, width: '65%', marginBottom: 16 }} />
            <div className="skeleton" style={{ height: 14, width: 120 }} />
          </div>
        ))}
      </div>
    </div>
  )
}
