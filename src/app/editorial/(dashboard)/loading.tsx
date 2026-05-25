export default function EditorialLoading() {
  return (
    <div
      style={{
        maxWidth: 1100,
        margin: '0 auto',
        padding: '40px 32px 80px',
        fontFamily: "'Hanken Grotesk', sans-serif",
      }}
    >
      {/* Page title */}
      <div
        className="skeleton"
        style={{ height: 28, width: 200, marginBottom: 32, borderRadius: 3 }}
      />

      {/* Stats row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: 16,
          marginBottom: 40,
        }}
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 90, borderRadius: 4 }} />
        ))}
      </div>

      {/* Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
        {/* Article list */}
        <div>
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="skeleton"
              style={{ height: 72, marginBottom: 12, borderRadius: 3 }}
            />
          ))}
        </div>

        {/* Sidebar */}
        <div>
          <div className="skeleton" style={{ height: 180, marginBottom: 16, borderRadius: 4 }} />
          <div className="skeleton" style={{ height: 120, borderRadius: 4 }} />
        </div>
      </div>
    </div>
  )
}
