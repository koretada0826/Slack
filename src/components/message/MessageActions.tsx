import { Button, Popover, Tooltip } from 'antd'
import {
  SmileOutlined,
  MessageOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
} from '@ant-design/icons'

const QUICK_EMOJIS = ['👍', '❤️', '😂', '🎉']

interface MessageActionsProps {
  isOwnMessage: boolean
  onReaction: (emoji: string) => void
  onThreadOpen: () => void
  onEdit: () => void
  onDelete: () => void
}

export function MessageActions({
  isOwnMessage,
  onReaction,
  onThreadOpen,
  onEdit,
  onDelete,
}: MessageActionsProps) {
  return (
    <div
      style={{
        position: 'absolute',
        top: -16,
        right: 8,
        display: 'flex',
        gap: 2,
        background: 'var(--color-bg)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        padding: 2,
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
      }}
    >
      {QUICK_EMOJIS.map((emoji) => (
        <Tooltip key={emoji} title={emoji}>
          <Button
            type="text"
            size="small"
            onClick={() => onReaction(emoji)}
            style={{ width: 28, height: 28, fontSize: 14, padding: 0 }}
          >
            {emoji}
          </Button>
        </Tooltip>
      ))}

      <Tooltip title="スレッドで返信">
        <Button
          type="text"
          size="small"
          icon={<MessageOutlined />}
          onClick={onThreadOpen}
          style={{ width: 28, height: 28 }}
        />
      </Tooltip>

      {isOwnMessage && (
        <Popover
          trigger="click"
          placement="bottomRight"
          content={
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={onEdit}
                block
                style={{ justifyContent: 'flex-start' }}
              >
                編集
              </Button>
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={onDelete}
                block
                style={{ justifyContent: 'flex-start' }}
              >
                削除
              </Button>
            </div>
          }
        >
          <Tooltip title="その他">
            <Button
              type="text"
              size="small"
              icon={<MoreOutlined />}
              style={{ width: 28, height: 28 }}
            />
          </Tooltip>
        </Popover>
      )}
    </div>
  )
}
