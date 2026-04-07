import { NotificationItem } from './NotificationItem'
import { EmptyState } from '@/components/common/EmptyState'
import type { DbNotification } from '@/types/db'

interface NotificationListProps {
  notifications: DbNotification[]
  onRead: (id: string) => void
}

export function NotificationList({ notifications, onRead }: NotificationListProps) {
  if (notifications.length === 0) {
    return <EmptyState description="通知はまだありません" />
  }

  return (
    <div>
      {notifications.map((n) => (
        <NotificationItem key={n.id} notification={n} onRead={onRead} />
      ))}
    </div>
  )
}
