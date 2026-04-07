import { useState, useEffect, useCallback } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useWorkspaceStore } from '@/store/workspaceStore'
import { supabase } from '@/lib/supabase/client'
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

  // Realtime subscription for channel list updates
  useEffect(() => {
    if (!currentWorkspace) return

    const channel = supabase
      .channel(`channels:workspace=${currentWorkspace.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'channels',
          filter: `workspace_id=eq.${currentWorkspace.id}`,
        },
        () => {
          refresh()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [currentWorkspace, refresh])

  return { channels, loading, error, refresh, setChannels }
}
