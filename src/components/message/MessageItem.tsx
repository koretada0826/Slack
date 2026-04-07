import { useState } from 'react'
import { message as antMessage } from 'antd'
import { MessageOutlined } from '@ant-design/icons'
import { useAuthStore } from '@/store/authStore'
import { useToggleReaction } from '@/features/reactions/hooks'
import { updateMessage, deleteMessage } from '@/features/messages/api'
import { formatMessageTime } from '@/features/messages/utils'
import { MessageActions } from './MessageActions'
import { MessageEditor } from './MessageEditor'
import { ReactionBar } from './ReactionBar'
import type { MessageWithSender } from '@/types/entities'

interface MessageItemProps {
  message: MessageWithSender
  showHeader: boolean
  onThreadOpen: (messageId: string) => void
}

const AVATAR_COLORS = [
  '#e8485c', '#e06b2d', '#d4a72c', '#3eb991',
  '#2d9ee0', '#7c5bbf', '#e25996', '#4ec0c1',
]

function getAvatarColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

export function MessageItem({ message, showHeader, onThreadOpen }: MessageItemProps) {
  const { user } = useAuthStore()
  const toggleReaction = useToggleReaction()
  const [hovered, setHovered] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const isOwn = message.sender_id === user?.id

  if (message.deleted_at) {
    return (
      <div style={{ padding: '4px 20px 4px 76px', color: 'var(--color-text-muted)', fontStyle: 'italic', fontSize: 'var(--font-size-base)' }}>
        このメッセージは削除されました
      </div>
    )
  }

  async function handleEdit(newBody: string) {
    setEditLoading(true)
    try { await updateMessage(message.id, { body: newBody, body_plaintext: newBody }); setEditing(false) }
    catch { antMessage.error('編集に失敗しました') }
    finally { setEditLoading(false) }
  }

  async function handleDelete() {
    try { await deleteMessage(message.id) }
    catch { antMessage.error('削除に失敗しました') }
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        padding: showHeader ? '8px 20px 4px' : '1px 20px 1px',
        background: hovered ? '#f8f8f8' : 'transparent',
        transition: 'background 0.05s',
      }}
    >
      {hovered && !editing && (
        <MessageActions
          isOwnMessage={isOwn}
          onReaction={(emoji) => toggleReaction(message.id, emoji)}
          onThreadOpen={() => onThreadOpen(message.id)}
          onEdit={() => setEditing(true)}
          onDelete={handleDelete}
        />
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        {/* Avatar column */}
        <div style={{ width: 36, flexShrink: 0 }}>
          {showHeader && (
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 'var(--radius-lg)',
                background: getAvatarColor(message.sender.display_name),
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 15,
                cursor: 'pointer',
              }}
            >
              {message.sender.display_name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {showHeader && (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 2 }}>
              <span style={{ fontWeight: 900, fontSize: 'var(--font-size-base)', color: 'var(--color-text)', cursor: 'pointer' }}>
                {message.sender.display_name}
              </span>
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                {formatMessageTime(message.created_at)}
              </span>
            </div>
          )}

          {editing ? (
            <MessageEditor initialBody={message.body} onSave={handleEdit} onCancel={() => setEditing(false)} loading={editLoading} />
          ) : (
            <div style={{ fontSize: 'var(--font-size-base)', lineHeight: 1.46668, whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: 'var(--color-text)' }}>
              {message.body}
              {message.edited_at && <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginLeft: 4 }}>(編集済み)</span>}
            </div>
          )}

          {message.reactions.length > 0 && (
            <ReactionBar reactions={message.reactions} onToggle={(emoji) => toggleReaction(message.id, emoji)} />
          )}

          {(message.thread_count ?? 0) > 0 && !message.parent_message_id && (
            <button
              onClick={() => onThreadOpen(message.id)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 4,
                padding: '4px 8px', background: 'none', border: '1px solid transparent',
                borderRadius: 'var(--radius-lg)', cursor: 'pointer', color: 'var(--color-text-link)',
                fontSize: 'var(--font-size-sm)', fontWeight: 700,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#f0f7ff'; e.currentTarget.style.borderColor = 'var(--color-border)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.borderColor = 'transparent' }}
            >
              <MessageOutlined style={{ fontSize: 12 }} />
              {message.thread_count}件の返信
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
