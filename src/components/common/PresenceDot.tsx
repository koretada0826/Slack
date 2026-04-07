import type { PresenceStatus } from '@/types/db'

const statusColors: Record<PresenceStatus, string> = {
  online: 'var(--color-online)',
  away: 'var(--color-away)',
  offline: 'var(--color-text-tertiary)',
}

interface PresenceDotProps {
  status: PresenceStatus
  size?: number
}

export function PresenceDot({ status, size = 10 }: PresenceDotProps) {
  return (
    <span
      title={status}
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        borderRadius: '50%',
        background: statusColors[status],
        border: status === 'offline' ? '2px solid var(--color-text-tertiary)' : 'none',
        backgroundColor: status === 'offline' ? 'transparent' : statusColors[status],
        flexShrink: 0,
      }}
    />
  )
}
