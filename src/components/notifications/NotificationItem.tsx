import { Typography } from 'antd'
import {
  MessageOutlined,
  BellOutlined,
  SmileOutlined,
} from '@ant-design/icons'
import type { DbNotification } from '@/types/db'

const { Text } = Typography

// Use a simpler approach since AtSignIcon doesn't exist in antd
const iconMap: Record<string, React.ReactNode> = {
  mention: <BellOutlined />,
  thread_reply: <MessageOutlined />,
  reaction: <SmileOutlined />,
  dm_message: <MessageOutlined />,
  invite: <BellOutlined />,
  channel_invite: <BellOutlined />,
}

interface NotificationItemProps {
  notification: DbNotification
  onRead: (id: string) => void
}

export function NotificationItem({ notification, onRead }: NotificationItemProps) {
  const timeAgo = formatTimeAgo(notification.created_at)

  return (
    <button
      onClick={() => !notification.is_read && onRead(notification.id)}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        width: '100%',
        padding: '12px 16px',
        border: 'none',
        borderBottom: '1px solid var(--color-border-light)',
        background: notification.is_read
          ? 'transparent'
          : 'var(--color-primary-bg)',
        cursor: notification.is_read ? 'default' : 'pointer',
        textAlign: 'left',
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 'var(--radius-full)',
          background: 'var(--color-bg-tertiary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          color: 'var(--color-text-secondary)',
        }}
      >
        {iconMap[notification.type] ?? <BellOutlined />}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
          <Text strong={!notification.is_read} style={{ fontSize: 14 }}>
            {notification.title}
          </Text>
          <Text
            type="secondary"
            style={{ fontSize: 12, flexShrink: 0 }}
          >
            {timeAgo}
          </Text>
        </div>
        {notification.body && (
          <Text
            type="secondary"
            ellipsis
            style={{
              fontSize: 13,
              display: 'block',
              marginTop: 2,
            }}
          >
            {notification.body}
          </Text>
        )}
      </div>

      {!notification.is_read && (
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: 'var(--radius-full)',
            background: 'var(--color-primary)',
            flexShrink: 0,
            marginTop: 6,
          }}
        />
      )}
    </button>
  )
}

function formatTimeAgo(isoString: string): string {
  const now = Date.now()
  const then = new Date(isoString).getTime()
  const diffMs = now - then
  const diffMin = Math.floor(diffMs / 60000)

  if (diffMin < 1) return 'たった今'
  if (diffMin < 60) return `${diffMin}m`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `${diffH}h`
  const diffD = Math.floor(diffH / 24)
  if (diffD < 7) return `${diffD}d`
  return new Date(isoString).toLocaleDateString()
}
