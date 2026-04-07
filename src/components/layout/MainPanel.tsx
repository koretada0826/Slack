import { useState, useEffect } from 'react'
import { useUiStore } from '@/store/uiStore'
import { useThreadStore } from '@/store/threadStore'
import { useMessages } from '@/features/messages/hooks'
import { useIsMobile } from '@/hooks/useIsMobile'
import { useAutoMarkAsRead } from '@/hooks/useMarkAsRead'
import { fetchChannel } from '@/features/channels/api'
import { ChannelHeader } from '@/components/channel/ChannelHeader'
import { ConversationHeader } from '@/components/dm/ConversationHeader'
import { MessageList } from '@/components/message/MessageList'
import { MessageComposer } from '@/components/message/MessageComposer'
import type { DbChannel } from '@/types/db'
import type { ConversationWithMembers } from '@/types/entities'
import { useNavigate } from 'react-router-dom'
import { useWorkspaceStore } from '@/store/workspaceStore'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase/client'

export function MainPanel() {
  const { activeChatTarget } = useUiStore()
  const { setActiveThread } = useThreadStore()
  const { messages, loading, send } = useMessages(activeChatTarget)
  useAutoMarkAsRead(activeChatTarget, messages)
  const [channelInfo, setChannelInfo] = useState<DbChannel | null>(null)
  const [convInfo, setConvInfo] = useState<ConversationWithMembers | null>(null)
  const isMobile = useIsMobile()
  const navigate = useNavigate()
  const { currentWorkspace } = useWorkspaceStore()
  const { user } = useAuthStore()

  useEffect(() => {
    if (activeChatTarget?.type === 'channel') {
      setConvInfo(null)
      let mounted = true
      fetchChannel(activeChatTarget.id)
        .then((ch) => { if (mounted) setChannelInfo(ch) })
        .catch(() => {})
      return () => { mounted = false }
    } else if (activeChatTarget?.type === 'conversation') {
      setChannelInfo(null)
      let mounted = true
      async function loadConv() {
        const targetId = activeChatTarget!.id
        const { data: conv } = await supabase
          .from('conversations')
          .select('*')
          .eq('id', targetId)
          .single()
        if (!mounted || !conv) return
        const { data: members } = await supabase
          .from('conversation_members')
          .select('user_id, profiles(*)')
          .eq('conversation_id', targetId)
        if (!mounted) return
        type ProfileType = ConversationWithMembers['members'][number]
        type MemberRow = { user_id: string; profiles: ProfileType | null }
        const profiles = ((members ?? []) as unknown as MemberRow[])
          .map((m) => m.profiles)
          .filter((p): p is ProfileType => p !== null)
        const convWithMembers: ConversationWithMembers = {
          id: conv.id,
          workspace_id: conv.workspace_id,
          kind: conv.kind,
          created_by: conv.created_by,
          created_at: conv.created_at,
          updated_at: conv.updated_at,
          members: profiles,
        }
        setConvInfo(convWithMembers)
      }
      loadConv()
      return () => { mounted = false }
    } else {
      setChannelInfo(null)
      setConvInfo(null)
    }
  }, [activeChatTarget])

  function handleThreadOpen(messageId: string) {
    if (isMobile && currentWorkspace) {
      navigate(`/ws/${currentWorkspace.slug}/thread/${messageId}`)
    } else {
      setActiveThread(messageId)
    }
  }

  if (!activeChatTarget) {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: 0,
          background: 'var(--color-bg)',
          gap: 8,
        }}
      >
        <div style={{ fontSize: 40 }}>💬</div>
        <div style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-base)' }}>
          チャンネルまたはDMを選択してチャットを開始
        </div>
      </div>
    )
  }

  const composerPlaceholder = channelInfo
    ? `#${channelInfo.name} へのメッセージ`
    : convInfo
    ? `${convInfo.members.filter((m) => m.id !== user?.id).map((m) => m.display_name).join(', ')} へのメッセージ`
    : 'メッセージを入力...'

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        background: 'var(--color-bg)',
      }}
    >
      {channelInfo ? (
        <ChannelHeader channel={channelInfo} />
      ) : convInfo ? (
        <ConversationHeader conversation={convInfo} />
      ) : (
        <div style={{ height: 'var(--header-height)', borderBottom: '1px solid var(--color-border)' }} />
      )}

      <MessageList messages={messages} loading={loading} onThreadOpen={handleThreadOpen} channelInfo={channelInfo} />

      <MessageComposer placeholder={composerPlaceholder} onSend={send} />
    </div>
  )
}
