import { useState, useEffect, useCallback } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useWorkspaceStore } from '@/store/workspaceStore'
import { fetchConversations } from './api'
import type { ConversationWithMembers } from '@/types/entities'

export function useConversations() {
  const [conversations, setConversations] = useState<ConversationWithMembers[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuthStore()
  const { currentWorkspace } = useWorkspaceStore()

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

  return { conversations, loading, error, refresh, setConversations }
}
