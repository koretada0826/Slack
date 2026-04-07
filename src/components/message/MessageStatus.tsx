import { Typography } from 'antd'

const { Text } = Typography

interface MessageStatusProps {
  editedAt: string | null
  deletedAt: string | null
}

export function MessageStatus({ editedAt, deletedAt }: MessageStatusProps) {
  if (deletedAt) {
    return (
      <Text
        type="secondary"
        style={{ fontSize: 12, fontStyle: 'italic' }}
      >
        このメッセージは削除されました
      </Text>
    )
  }

  if (editedAt) {
    return (
      <Text type="secondary" style={{ fontSize: 11 }}>
        (編集済み)
      </Text>
    )
  }

  return null
}
