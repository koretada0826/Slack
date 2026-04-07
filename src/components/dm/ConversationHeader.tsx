import { Typography } from 'antd'
import { useAuthStore } from '@/store/authStore'
import type { ConversationWithMembers } from '@/types/entities'

const { Text } = Typography

interface ConversationHeaderProps {
  conversation: ConversationWithMembers
}

export function ConversationHeader({ conversation }: ConversationHeaderProps) {
  const { user } = useAuthStore()
  const otherMembers = conversation.members.filter((m) => m.id !== user?.id)
  const displayName =
    otherMembers.length > 0
      ? otherMembers.map((m) => m.display_name || '不明').join(', ')
      : '自分'

  return (
    <div
      style={{
        height: 'var(--header-height)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        borderBottom: '1px solid var(--color-border)',
        flexShrink: 0,
      }}
    >
      <Text strong style={{ fontSize: 16 }}>
        {displayName}
      </Text>
      {conversation.kind === 'group_dm' && (
        <Text
          type="secondary"
          style={{ fontSize: 13, marginLeft: 8 }}
        >
          ({conversation.members.length} メンバー)
        </Text>
      )}
    </div>
  )
}
