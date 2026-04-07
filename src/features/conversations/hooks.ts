import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useWorkspaceStore } from '@/store/workspaceStore'
import { supabase } from '@/lib/supabase/client'
import { fetchConversations } from './api'
import type { ConversationWithMembers } from '@/types/entities'

export function useConversations() {
  const [conversations, setConversations] = useState<ConversationWithMembers[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuthStore()
  const { currentWorkspace } = useWorkspaceStore()
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  const refresh = useCallback(async () => {
    if (!user || !currentWorkspace) return
    setLoading(true)
    setError(null)
    try {
      const data = await fetchConversations(currentWorkspace.id, user.id)
      setConversations(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch conversations')
    } finally {
      setLoading(false)
    }
  }, [user, currentWorkspace])

  useEffect(() => {
    refresh()
  }, [refresh])

  // Realtime subscription for new conversations in the workspace
  useEffect(() => {
    if (!currentWorkspace) return

    const channel = supabase
      .channel(`conversations:workspace:${currentWorkspace.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'conversations',
          filter: `workspace_id=eq.${currentWorkspace.id}`,
        },
        () => {
          // Refresh the full list to get member data and unread counts
          refresh()
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conversations',
          filter: `workspace_id=eq.${currentWorkspace.id}`,
        },
        () => {
          refresh()
        }
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [currentWorkspace, refresh])

  return { conversations, loading, error, refresh, setConversations }
}
