import { useAuthStore } from '@/store/authStore'
import type { ConversationWithMembers } from '@/types/entities'

interface DmListItemProps {
  conversation: ConversationWithMembers
  isActive: boolean
  onClick: () => void
}

export function DmListItem({ conversation, isActive, onClick }: DmListItemProps) {
  const { user } = useAuthStore()
  const otherMembers = conversation.members.filter((m) => m.id !== user?.id)
  const displayName =
    otherMembers.length > 0
      ? otherMembers.map((m) => m.display_name || '不明').join(', ')
      : '自分'

  const hasUnread = (conversation.unread_count ?? 0) > 0

  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
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
      {/* Presence dot */}
      <span
        style={{
          width: 9,
          height: 9,
          borderRadius: '50%',
          background: 'var(--color-online)',
          flexShrink: 0,
        }}
      />
      <span
        style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {displayName}
      </span>
      {(conversation.unread_count ?? 0) > 0 && (
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
          {conversation.unread_count}
        </span>
      )}
    </button>
  )
}
