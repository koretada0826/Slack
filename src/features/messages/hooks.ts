import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useWorkspaceStore } from '@/store/workspaceStore'
import { fetchMessages, fetchThreadMessages, sendMessage } from './api'
import { supabase } from '@/lib/supabase/client'
import type { MessageWithSender } from '@/types/entities'
import type { ChatTarget } from '@/types/common'
import type { DbMessage, DbProfile } from '@/types/db'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'

export function useMessages(target: ChatTarget) {
  const [messages, setMessages] = useState<MessageWithSender[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuthStore()
  const { currentWorkspace } = useWorkspaceStore()
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  const refresh = useCallback(async () => {
    if (!user || !target) return
    setLoading(true)
    try {
      const data = await fetchMessages(
        target.type === 'channel'
          ? { channel_id: target.id }
          : { conversation_id: target.id },
        user.id
      )
      setMessages(data)
    } catch {
      // Silently fail; ErrorState in UI should handle
    } finally {
      setLoading(false)
    }
  }, [user, target])

  // Initial fetch
  useEffect(() => {
    refresh()
  }, [refresh])

  // Realtime subscription
  useEffect(() => {
    if (!target || !currentWorkspace || !user) return

    const filterCol =
      target.type === 'channel' ? 'channel_id' : 'conversation_id'
    const filterVal = target.id

    const channel = supabase
      .channel(`messages:${filterCol}:${filterVal}`)
      .on<DbMessage>(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `${filterCol}=eq.${filterVal}`,
        },
        async (payload: RealtimePostgresChangesPayload<DbMessage>) => {
          if (payload.eventType !== 'INSERT') return
          const newMsg = payload.new

          // Skip thread replies in main list
          if (newMsg.parent_message_id) return

          // Check for duplicates
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev

            // Fetch sender profile inline
            // We'll add a temporary sender and update it
            return prev
          })

          // Fetch complete message with sender
          try {
            const { data: fullMsg } = await supabase
              .from('messages')
              .select('*, profiles!messages_sender_id_fkey(*)')
              .eq('id', newMsg.id)
              .single()

            if (fullMsg) {
              const typed = fullMsg as DbMessage & { profiles: DbProfile }
              const withSender: MessageWithSender = {
                ...typed,
                sender: typed.profiles,
                reactions: [],
                thread_count: 0,
              }
              setMessages((prev) => {
                if (prev.some((m) => m.id === newMsg.id)) return prev
                return [...prev, withSender]
              })
            }
          } catch {
            // Failed to fetch full message; will appear on next refresh
          }
        }
      )
      .on<DbMessage>(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `${filterCol}=eq.${filterVal}`,
        },
        (payload: RealtimePostgresChangesPayload<DbMessage>) => {
          if (payload.eventType !== 'UPDATE') return
          const updated = payload.new

          setMessages((prev) =>
            prev.map((m) => {
              if (m.id !== updated.id) return m
              return {
                ...m,
                body: updated.body,
                body_plaintext: updated.body_plaintext,
                edited_at: updated.edited_at,
                deleted_at: updated.deleted_at,
              }
            })
          )
        }
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      channel.unsubscribe()
      channelRef.current = null
    }
  }, [target, currentWorkspace, user])

  const send = useCallback(
    async (body: string, mentionUserIds?: string[]) => {
      if (!user || !currentWorkspace || !target) return
      await sendMessage({
        workspace_id: currentWorkspace.id,
        channel_id: target.type === 'channel' ? target.id : undefined,
        conversation_id: target.type === 'conversation' ? target.id : undefined,
        body,
        body_plaintext: body,
        mention_user_ids: mentionUserIds,
      })
    },
    [user, currentWorkspace, target]
  )

  return { messages, loading, refresh, send }
}

export function useThreadMessages(parentMessageId: string | null) {
  const [messages, setMessages] = useState<MessageWithSender[]>([])
  const [loading, setLoading] = useState(false)
  const { user } = useAuthStore()

  const refresh = useCallback(async () => {
    if (!user || !parentMessageId) return
    setLoading(true)
    try {
      const data = await fetchThreadMessages(parentMessageId, user.id)
      setMessages(data)
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [user, parentMessageId])

  useEffect(() => {
    refresh()
  }, [refresh])

  // Realtime for thread
  useEffect(() => {
    if (!parentMessageId || !user) return

    const channel = supabase
      .channel(`thread:${parentMessageId}`)
      .on<DbMessage>(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `parent_message_id=eq.${parentMessageId}`,
        },
        async (payload: RealtimePostgresChangesPayload<DbMessage>) => {
          if (payload.eventType !== 'INSERT') return
          const newMsg = payload.new

          try {
            const { data: fullMsg } = await supabase
              .from('messages')
              .select('*, profiles!messages_sender_id_fkey(*)')
              .eq('id', newMsg.id)
              .single()

            if (fullMsg) {
              const typed = fullMsg as DbMessage & { profiles: DbProfile }
              const withSender: MessageWithSender = {
                ...typed,
                sender: typed.profiles,
                reactions: [],
                thread_count: 0,
              }
              setMessages((prev) => {
                if (prev.some((m) => m.id === newMsg.id)) return prev
                return [...prev, withSender]
              })
            }
          } catch {
            // will appear on refresh
          }
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [parentMessageId, user])

  return { messages, loading, refresh }
}
