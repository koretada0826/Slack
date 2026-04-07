import { useState } from 'react'
import { Modal, Button, message } from 'antd'
import { MessageOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useWorkspaceStore } from '@/store/workspaceStore'
import { useUiStore } from '@/store/uiStore'
import { findExistingDm, createConversation } from '@/features/conversations/api'
import type { DbProfile } from '@/types/db'

interface UserProfileCardProps {
  user: DbProfile | null
  open: boolean
  onClose: () => void
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

export function UserProfileCard({ user, open, onClose }: UserProfileCardProps) {
  const navigate = useNavigate()
  const { user: currentUser } = useAuthStore()
  const { currentWorkspace } = useWorkspaceStore()
  const { setActiveChatTarget, setMobileDrawerOpen } = useUiStore()
  const [loading, setLoading] = useState(false)

  if (!user) return null

  const isMe = user.id === currentUser?.id

  async function handleStartDm() {
    if (!currentUser || !currentWorkspace || !user) return
    setLoading(true)
    try {
      const existing = await findExistingDm(currentWorkspace.id, currentUser.id, user.id)
      if (existing) {
        setActiveChatTarget({ type: 'conversation', id: existing.id })
      } else {
        const conv = await createConversation(currentUser.id, {
          workspace_id: currentWorkspace.id,
          kind: 'dm',
          member_ids: [user.id],
        })
        setActiveChatTarget({ type: 'conversation', id: conv.id })
      }
      setMobileDrawerOpen(false)
      onClose()
      navigate(`/ws/${currentWorkspace.slug}`)
    } catch {
      message.error('DMの開始に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={360}
      centered
      destroyOnClose
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 0 8px' }}>
        <div
          style={{
            width: 80, height: 80, borderRadius: 16,
            background: getAvatarColor(user.display_name),
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: 36, marginBottom: 12,
          }}
        >
          {user.display_name.charAt(0).toUpperCase()}
        </div>
        <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 4 }}>
          {user.display_name}
        </div>
        {user.status_message && (
          <div style={{ fontSize: 14, color: 'var(--color-text-muted)', marginBottom: 4 }}>
            {user.status_message}
          </div>
        )}
        <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 20 }}>
          {user.email}
        </div>

        {!isMe && (
          <Button
            type="primary"
            icon={<MessageOutlined />}
            size="large"
            loading={loading}
            onClick={handleStartDm}
            style={{ width: '100%', fontWeight: 700 }}
          >
            メッセージを送る
          </Button>
        )}
        {isMe && (
          <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
            これはあなたのプロフィールです
          </div>
        )}
      </div>
    </Modal>
  )
}
