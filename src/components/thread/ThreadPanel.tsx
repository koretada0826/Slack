import { useEffect, useState } from 'react'
import { useThreadStore } from '@/store/threadStore'
import { useWorkspaceStore } from '@/store/workspaceStore'
import { useAuthStore } from '@/store/authStore'
import { useThreadMessages } from '@/features/messages/hooks'
import { sendMessage } from '@/features/messages/api'
import { useToggleReaction } from '@/features/reactions/hooks'
import { supabase } from '@/lib/supabase/client'
import { formatMessageTime } from '@/features/messages/utils'
import { ThreadHeader } from './ThreadHeader'
import { ThreadMessageList } from './ThreadMessageList'
import { ThreadComposer } from './ThreadComposer'
import { ReactionBar } from '@/components/message/ReactionBar'
import type { DbMessage, DbProfile } from '@/types/db'
import type { MessageWithSender, ReactionSummary } from '@/types/entities'

interface ThreadPanelProps {
  isMobile?: boolean
  messageId?: string
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

export function ThreadPanel({ isMobile, messageId, onClose }: ThreadPanelProps) {
  const { activeThreadMessageId } = useThreadStore()
  const { currentWorkspace } = useWorkspaceStore()
  const { user } = useAuthStore()
  const targetId = messageId ?? activeThreadMessageId
  const { messages, loading } = useThreadMessages(targetId)
  const [parentMsg, setParentMsg] = useState<(DbMessage & { sender?: DbProfile }) | null>(null)
  const toggleReaction = useToggleReaction()

  // Fetch parent message with sender info
  useEffect(() => {
    if (!targetId) return
    let mounted = true
    supabase
      .from('messages')
      .select('*, profiles!messages_sender_id_fkey(*)')
      .eq('id', targetId)
      .single()
      .then(({ data }) => {
        if (mounted && data) {
          const typed = data as DbMessage & { profiles: DbProfile }
          setParentMsg({ ...typed, sender: typed.profiles })
        }
      })
    return () => { mounted = false }
  }, [targetId])

  if (!targetId) return null

  async function handleSend(body: string) {
    if (!currentWorkspace || !parentMsg) return
    await sendMessage({
      workspace_id: currentWorkspace.id,
      channel_id: parentMsg.channel_id ?? undefined,
      conversation_id: parentMsg.conversation_id ?? undefined,
      parent_message_id: targetId!,
      body,
      body_plaintext: body,
    })
  }

  return (
    <div
      style={{
        width: isMobile ? '100%' : 'var(--thread-panel-width)',
        height: '100%',
        borderLeft: isMobile ? 'none' : '1px solid var(--color-border)',
        background: 'var(--color-bg)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}
    >
      <ThreadHeader onClose={onClose} isMobile={isMobile} />

      {/* Parent message display */}
      {parentMsg?.sender && (
        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--color-border)', background: '#fafafa' }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <div
              style={{
                width: 36, height: 36, borderRadius: 8,
                background: getAvatarColor(parentMsg.sender.display_name),
                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 15, flexShrink: 0,
              }}
            >
              {parentMsg.sender.display_name.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 2 }}>
                <span style={{ fontWeight: 900, fontSize: 15 }}>{parentMsg.sender.display_name}</span>
                <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{formatMessageTime(parentMsg.created_at)}</span>
              </div>
              <div style={{ fontSize: 15, lineHeight: 1.46, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {parentMsg.body}
              </div>
            </div>
          </div>
          <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--color-border)', fontSize: 13, color: 'var(--color-text-muted)' }}>
            {messages.length}件の返信
          </div>
        </div>
      )}

      <ThreadMessageList messages={messages} loading={loading} />
      <ThreadComposer onSend={handleSend} />
    </div>
  )
}
