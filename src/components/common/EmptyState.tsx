import { Empty, Button } from 'antd'

interface EmptyStateProps {
  description?: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({ description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <Empty
      description={description ?? 'データなし'}
      style={{ padding: '48px 0' }}
    >
      {actionLabel && onAction ? (
        <Button type="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </Empty>
  )
}
