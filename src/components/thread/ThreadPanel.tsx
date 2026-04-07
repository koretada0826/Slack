import { useEffect, useState } from 'react'
import { useThreadStore } from '@/store/threadStore'
import { useWorkspaceStore } from '@/store/workspaceStore'
import { useThreadMessages } from '@/features/messages/hooks'
import { sendMessage } from '@/features/messages/api'
import { supabase } from '@/lib/supabase/client'
import { ThreadHeader } from './ThreadHeader'
import { ThreadMessageList } from './ThreadMessageList'
import { ThreadComposer } from './ThreadComposer'
import type { DbMessage } from '@/types/db'

interface ThreadPanelProps {
  isMobile?: boolean
  messageId?: string
  onClose: () => void
}

export function ThreadPanel({ isMobile, messageId, onClose }: ThreadPanelProps) {
  const { activeThreadMessageId } = useThreadStore()
  const { currentWorkspace } = useWorkspaceStore()
  const targetId = messageId ?? activeThreadMessageId
  const { messages, loading } = useThreadMessages(targetId)
  const [parentMsg, setParentMsg] = useState<DbMessage | null>(null)

  // Fetch parent message to get channel/conversation info
  useEffect(() => {
    if (!targetId) return
    let mounted = true
    supabase
      .from('messages')
      .select('*')
      .eq('id', targetId)
      .single()
      .then(({ data }) => {
        if (mounted && data) setParentMsg(data)
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
      <ThreadMessageList messages={messages} loading={loading} />
      <ThreadComposer onSend={handleSend} />
    </div>
  )
}
