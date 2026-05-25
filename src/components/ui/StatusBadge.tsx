export type WorkflowStatus = 'submitted' | 'in_review' | 'approved' | 'rejected'

export const STATUS_META: Record<
  WorkflowStatus,
  { label: string; bg: string; color: string; dot: string }
> = {
  submitted: { label: 'Submitted', bg: '#EFF6FF', color: '#1E40AF', dot: '#3B82F6' },
  in_review: { label: 'In Review', bg: '#FFFBEB', color: '#92400E', dot: '#D97706' },
  approved: { label: 'Approved', bg: '#F0FDF4', color: '#14532D', dot: '#16A34A' },
  rejected: { label: 'Rejected', bg: '#FEF2F2', color: '#7F1D1D', dot: '#DC2626' },
}

export function StatusBadge({ status }: { status: WorkflowStatus }) {
  const m = STATUS_META[status] ?? STATUS_META.submitted
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '3px 10px 3px 8px',
        background: m.bg,
        color: m.color,
        borderRadius: 2,
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
      }}
    >
      <span
        style={{ width: 5, height: 5, borderRadius: '50%', background: m.dot, flexShrink: 0 }}
      />
      {m.label}
    </span>
  )
}
