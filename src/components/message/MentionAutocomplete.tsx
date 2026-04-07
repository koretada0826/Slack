import { AppAvatar } from '@/components/common/AppAvatar'
import type { MentionCandidate } from '@/features/mentions/types'

interface MentionAutocompleteProps {
  candidates: MentionCandidate[]
  onSelect: (candidate: MentionCandidate) => void
  activeIndex: number
}

export function MentionAutocomplete({
  candidates,
  onSelect,
  activeIndex,
}: MentionAutocompleteProps) {
  if (candidates.length === 0) return null

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '100%',
        left: 20,
        right: 20,
        background: 'var(--color-bg)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 -4px 12px rgba(0,0,0,0.08)',
        maxHeight: 240,
        overflowY: 'auto',
        zIndex: 10,
      }}
    >
      {candidates.map((c, idx) => (
        <button
          key={c.id}
          onClick={() => onSelect(c)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            width: '100%',
            padding: '8px 12px',
            border: 'none',
            background: idx === activeIndex ? 'var(--color-bg-tertiary)' : 'transparent',
            cursor: 'pointer',
            textAlign: 'left',
            fontSize: 14,
          }}
        >
          <AppAvatar
            name={c.display_name}
            src={c.avatar_url ?? undefined}
            size={24}
          />
          <span>{c.display_name}</span>
        </button>
      ))}
    </div>
  )
}
