'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  markInReview,
  approveArticle,
  rejectArticle,
  saveEditorialNote,
  unpublishArticle,
  deleteArticle,
} from '@/actions/editorialActions'
import { assignPlacement } from '@/actions/assignPlacement'
import { SLOTS_BY_PAGE } from '@/lib/slots'
import type { SlotId } from '@/lib/slots'

type WorkflowStatus = 'submitted' | 'in_review' | 'approved' | 'rejected'

const STATUS_META: Record<
  WorkflowStatus,
  { label: string; bg: string; color: string; dot: string }
> = {
  submitted: { label: 'Submitted', bg: '#EFF6FF', color: '#1E40AF', dot: '#3B82F6' },
  in_review: { label: 'In Review', bg: '#FFFBEB', color: '#92400E', dot: '#D97706' },
  approved: { label: 'Approved', bg: '#F0FDF4', color: '#14532D', dot: '#16A34A' },
  rejected: { label: 'Rejected', bg: '#FEF2F2', color: '#7F1D1D', dot: '#DC2626' },
}

type Props = {
  articleId: string
  currentStatus: WorkflowStatus
  currentPlacement?: string | null
  editorialNote?: string | null
}

export default function ReviewActions({
  articleId,
  currentStatus,
  currentPlacement,
  editorialNote: initialNote,
}: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [status, setStatus] = useState<WorkflowStatus>(currentStatus)
  const [note, setNote] = useState(initialNote ?? '')
  const [noteSaved, setNoteSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rejectConfirm, setRejectConfirm] = useState(false)
  const [unpublishConfirm, setUnpublishConfirm] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  // Placement state
  const [placement, setPlacement] = useState<SlotId | ''>(
    (currentPlacement as SlotId | null | undefined) ?? ''
  )
  const [placementSaved, setPlacementSaved] = useState(false)
  const [placementPending, startPlacementTransition] = useTransition()

  const handleAssignPlacement = () => {
    startPlacementTransition(async () => {
      const res = await assignPlacement(articleId, placement)
      if (res.success) {
        setPlacementSaved(true)
        setTimeout(() => setPlacementSaved(false), 2000)
        router.refresh()
      } else {
        setError(res.error ?? 'Failed to assign placement.')
      }
    })
  }

  const m = STATUS_META[status]

  const runAction = (
    fn: () => Promise<{ success: boolean; error?: string }>,
    nextStatus?: WorkflowStatus
  ) => {
    setError(null)
    startTransition(async () => {
      const res = await fn()
      if (res.success) {
        if (nextStatus) setStatus(nextStatus)
        router.refresh()
      } else {
        setError(res.error ?? 'Action failed.')
      }
    })
  }

  const handleSaveNote = () => {
    setError(null)
    startTransition(async () => {
      const res = await saveEditorialNote(articleId, note)
      if (res.success) {
        setNoteSaved(true)
        setTimeout(() => setNoteSaved(false), 2000)
        router.refresh()
      } else {
        setError(res.error ?? 'Failed to save note.')
      }
    })
  }

  const handleReject = () => {
    if (!rejectConfirm) {
      setRejectConfirm(true)
      return
    }
    runAction(() => rejectArticle(articleId, note), 'rejected')
    setRejectConfirm(false)
  }

  const handleUnpublish = () => {
    if (!unpublishConfirm) {
      setUnpublishConfirm(true)
      return
    }
    setUnpublishConfirm(false)
    runAction(() => unpublishArticle(articleId), 'in_review')
  }

  const handleDelete = () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true)
      return
    }
    setError(null)
    startTransition(async () => {
      const res = await deleteArticle(articleId)
      if (res.success) {
        router.push('/editorial')
      } else {
        setError(res.error ?? 'Delete failed.')
        setDeleteConfirm(false)
      }
    })
  }

  const btnBase: React.CSSProperties = {
    width: '100%',
    padding: '12px 0',
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    border: 'none',
    borderRadius: 2,
    cursor: 'pointer',
    transition: 'opacity 0.15s',
    opacity: isPending ? 0.6 : 1,
    fontFamily: "'Hanken Grotesk', sans-serif",
  }

  return (
    <div>
      {/* Current status badge */}
      <div style={{ marginBottom: 20 }}>
        <div
          style={{
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: '#aaa',
            marginBottom: 10,
          }}
        >
          Current Status
        </div>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
            padding: '6px 14px 6px 10px',
            background: m.bg,
            color: m.color,
            borderRadius: 2,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: m.dot }} />
          {m.label}
        </span>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
        {status === 'submitted' && (
          <button
            style={{ ...btnBase, background: '#1a1c1c', color: '#fff' }}
            disabled={isPending}
            onClick={() => runAction(() => markInReview(articleId), 'in_review')}
          >
            Mark In Review
          </button>
        )}

        {(status === 'submitted' || status === 'in_review') && (
          <button
            style={{ ...btnBase, background: '#14532D', color: '#fff' }}
            disabled={isPending}
            onClick={() => runAction(() => approveArticle(articleId), 'approved')}
          >
            ✓ Approve &amp; Publish
          </button>
        )}

        {(status === 'submitted' || status === 'in_review') && (
          <button
            style={{
              ...btnBase,
              background: rejectConfirm ? '#DC2626' : 'transparent',
              color: rejectConfirm ? '#fff' : '#DC2626',
              border: '1px solid #DC2626',
            }}
            disabled={isPending}
            onClick={handleReject}
          >
            {rejectConfirm ? '✗ Confirm Reject' : '✗ Reject'}
          </button>
        )}

        {rejectConfirm && (
          <button
            style={{
              ...btnBase,
              background: 'transparent',
              color: '#5d5f5f',
              border: '1px solid #cfc4c5',
            }}
            onClick={() => setRejectConfirm(false)}
          >
            Cancel
          </button>
        )}

        {status === 'approved' && (
          <>
            <div
              style={{
                background: '#F0FDF4',
                border: '1px solid #86EFAC',
                borderRadius: 3,
                padding: '10px 14px',
                fontSize: 12,
                color: '#14532D',
                fontWeight: 500,
              }}
            >
              ✓ Published &amp; live
            </div>
            <button
              style={{
                ...btnBase,
                background: unpublishConfirm ? '#92400E' : 'transparent',
                color: unpublishConfirm ? '#fff' : '#92400E',
                border: '1px solid #D97706',
              }}
              disabled={isPending}
              onClick={handleUnpublish}
            >
              {unpublishConfirm ? '⚠ Confirm Unpublish' : '↩ Unpublish'}
            </button>
            {unpublishConfirm && (
              <button
                style={{
                  ...btnBase,
                  background: 'transparent',
                  color: '#5d5f5f',
                  border: '1px solid #cfc4c5',
                }}
                onClick={() => setUnpublishConfirm(false)}
              >
                Cancel
              </button>
            )}
          </>
        )}

        {status === 'rejected' && (
          <button
            style={{ ...btnBase, background: '#1a1c1c', color: '#fff' }}
            disabled={isPending}
            onClick={() => runAction(() => markInReview(articleId), 'in_review')}
          >
            Reopen for Review
          </button>
        )}
      </div>

      {/* Placement */}
      <div style={{ marginBottom: 24 }}>
        <div
          style={{
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: '#aaa',
            marginBottom: 10,
          }}
        >
          Page Placement
        </div>
        <select
          value={placement}
          onChange={(e) => {
            setPlacement(e.target.value as SlotId | '')
            setPlacementSaved(false)
          }}
          style={{
            width: '100%',
            padding: '10px 12px',
            background: '#f9f9f9',
            border: '1px solid #cfc4c5',
            borderRadius: 2,
            fontSize: 13,
            color: '#1a1c1c',
            fontFamily: "'Hanken Grotesk', sans-serif",
            cursor: 'pointer',
            marginBottom: 8,
          }}
        >
          <option value="">— Not placed —</option>
          {Object.entries(SLOTS_BY_PAGE).map(([page, slots]) => (
            <optgroup key={page} label={page}>
              {slots.map((slot) => (
                <option key={slot.id} value={slot.id}>
                  {slot.label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <button
          onClick={handleAssignPlacement}
          disabled={placementPending}
          style={{
            ...btnBase,
            padding: '10px 0',
            background: placementSaved ? '#14532D' : '#1a1c1c',
            color: '#fff',
            opacity: placementPending ? 0.6 : 1,
          }}
        >
          {placementSaved ? '✓ Placement Saved' : placementPending ? 'Saving…' : 'Assign Slot'}
        </button>
        {placement && (
          <p style={{ fontSize: 11, color: '#5d5f5f', marginTop: 8, fontStyle: 'italic' }}>
            Assigning will remove this slot from any article currently occupying it.
          </p>
        )}
      </div>

      {/* Editorial note */}
      <div>
        <div
          style={{
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: '#aaa',
            marginBottom: 10,
          }}
        >
          Editorial Note
        </div>
        <textarea
          value={note}
          onChange={(e) => {
            setNote(e.target.value)
            setNoteSaved(false)
          }}
          placeholder="Internal note for the team (not shown publicly)…"
          rows={4}
          style={{
            width: '100%',
            resize: 'vertical',
            background: '#f9f9f9',
            border: '1px solid #cfc4c5',
            borderRadius: 2,
            padding: '10px 12px',
            fontFamily: "'Hanken Grotesk', sans-serif",
            fontSize: 13,
            color: '#1a1c1c',
            lineHeight: 1.5,
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
        <button
          onClick={handleSaveNote}
          disabled={isPending}
          style={{
            ...btnBase,
            marginTop: 8,
            padding: '10px 0',
            background: noteSaved ? '#14532D' : 'transparent',
            color: noteSaved ? '#fff' : '#1a1c1c',
            border: `1px solid ${noteSaved ? '#14532D' : '#cfc4c5'}`,
          }}
        >
          {noteSaved ? '✓ Saved' : 'Save Note'}
        </button>
      </div>

      {error && (
        <p
          style={{
            marginTop: 16,
            padding: '10px 14px',
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: 3,
            fontSize: 12,
            color: '#7F1D1D',
          }}
        >
          {error}
        </p>
      )}

      {/* Danger zone */}
      <div
        style={{
          marginTop: 32,
          paddingTop: 20,
          borderTop: '1px solid #FECACA',
        }}
      >
        <div
          style={{
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: '#DC2626',
            marginBottom: 10,
          }}
        >
          Danger Zone
        </div>
        <button
          style={{
            ...btnBase,
            background: deleteConfirm ? '#DC2626' : 'transparent',
            color: deleteConfirm ? '#fff' : '#DC2626',
            border: '1px solid #DC2626',
          }}
          disabled={isPending}
          onClick={handleDelete}
        >
          {deleteConfirm ? '✗ Confirm — Delete Forever' : '✗ Delete Article'}
        </button>
        {deleteConfirm && (
          <>
            <p style={{ fontSize: 11, color: '#7F1D1D', margin: '6px 0 6px', lineHeight: 1.4 }}>
              Permanently deletes the article and its uploaded media. Cannot be undone.
            </p>
            <button
              style={{
                ...btnBase,
                marginTop: 4,
                background: 'transparent',
                color: '#5d5f5f',
                border: '1px solid #cfc4c5',
              }}
              onClick={() => setDeleteConfirm(false)}
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  )
}
