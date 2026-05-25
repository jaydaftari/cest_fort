export default function ArticleLoading() {
  return (
    <div
      style={{
        maxWidth: 720,
        margin: '0 auto',
        padding: '48px var(--gutter) 96px',
      }}
    >
      {/* Eyebrow + category */}
      <div className="skeleton" style={{ height: 12, width: 100, marginBottom: 24 }} />

      {/* Title */}
      <div className="skeleton" style={{ height: 48, width: '90%', marginBottom: 12 }} />
      <div className="skeleton" style={{ height: 48, width: '70%', marginBottom: 20 }} />

      {/* Dek */}
      <div className="skeleton" style={{ height: 22, width: '80%', marginBottom: 8 }} />
      <div className="skeleton" style={{ height: 22, width: '60%', marginBottom: 32 }} />

      {/* Byline */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 40 }}>
        <div className="skeleton" style={{ height: 12, width: 140 }} />
        <div className="skeleton" style={{ height: 12, width: 80 }} />
      </div>

      {/* Hero image */}
      <div
        className="skeleton"
        style={{ height: 440, width: '100%', marginBottom: 48, borderRadius: 2 }}
      />

      {/* Body paragraphs */}
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} style={{ marginBottom: 28 }}>
          <div className="skeleton" style={{ height: 18, width: '100%', marginBottom: 8 }} />
          <div className="skeleton" style={{ height: 18, width: '96%', marginBottom: 8 }} />
          <div className="skeleton" style={{ height: 18, width: i % 2 === 0 ? '85%' : '92%' }} />
        </div>
      ))}
    </div>
  )
}
