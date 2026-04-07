import { LockOutlined } from '@ant-design/icons'
import type { ChannelWithMeta } from '@/types/entities'

interface ChannelListItemProps {
  channel: ChannelWithMeta
  isActive: boolean
  onClick: () => void
}

export function ChannelListItem({ channel, isActive, onClick }: ChannelListItemProps) {
  const hasUnread = (channel.unread_count ?? 0) > 0

  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        width: '100%',
        padding: '4px 20px 4px 28px',
        background: isActive ? 'var(--color-sidebar-active)' : 'transparent',
        border: 'none',
        cursor: 'pointer',
        color: isActive
          ? 'var(--color-sidebar-text-bright)'
          : hasUnread
          ? 'var(--color-sidebar-text-bright)'
          : 'var(--color-sidebar-text)',
        fontSize: 'var(--font-size-base)',
        fontWeight: hasUnread ? 700 : 400,
        textAlign: 'left',
        borderRadius: 'var(--radius-md)',
        margin: '0 8px',
        lineHeight: '28px',
        height: 28,
      }}
      onMouseEnter={(e) => {
        if (!isActive) e.currentTarget.style.background = 'var(--color-sidebar-hover)'
      }}
      onMouseLeave={(e) => {
        if (!isActive) e.currentTarget.style.background = 'transparent'
      }}
    >
      {channel.visibility === 'private' ? (
        <LockOutlined style={{ fontSize: 12, opacity: 0.7, flexShrink: 0 }} />
      ) : (
        <span style={{ fontSize: 15, opacity: 0.7, flexShrink: 0, lineHeight: 1 }}>#</span>
      )}
      <span
        style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {channel.name}
      </span>
      {(channel.unread_count ?? 0) > 0 && (
        <span
          style={{
            marginLeft: 'auto',
            background: 'var(--color-mention-badge)',
            color: '#fff',
            fontSize: 12,
            fontWeight: 700,
            borderRadius: 10,
            padding: '0 6px',
            minWidth: 18,
            height: 18,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {channel.unread_count}
        </span>
      )}
    </button>
  )
}
