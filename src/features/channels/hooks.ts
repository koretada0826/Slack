import { useState, useEffect, useCallback } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useWorkspaceStore } from '@/store/workspaceStore'
import { fetchChannels } from './api'
import type { ChannelWithMeta } from '@/types/entities'

export function useChannels() {
  const [channels, setChannels] = useState<ChannelWithMeta[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuthStore()
  const { currentWorkspace } = useWorkspaceStore()

  const refresh = useCallback(async () => {
    if (!user || !currentWorkspace) return
    setLoading(true)
    setError(null)
    try {
      const data = await fetchChannels(currentWorkspace.id, user.id)
      setChannels(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch channels')
    } finally {
      setLoading(false)
    }
  }, [user, currentWorkspace])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { channels, loading, error, refresh, setChannels }
}
