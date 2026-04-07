import { useEffect, useCallback, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useWorkspaceStore } from '@/store/workspaceStore'
import { fetchPresence, updatePresence } from './api'
import { supabase } from '@/lib/supabase/client'
import type { DbUserPresence, PresenceStatus } from '@/types/db'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'

export function usePresence() {
  const [presenceMap, setPresenceMap] = useState<Map<string, DbUserPresence>>(
    new Map()
  )
  const { user } = useAuthStore()
  const { currentWorkspace } = useWorkspaceStore()

  // Fetch initial presence
  useEffect(() => {
    if (!currentWorkspace) return

    let mounted = true
    fetchPresence(currentWorkspace.id).then((data) => {
      if (!mounted) return
      const map = new Map<string, DbUserPresence>()
      for (const p of data) map.set(p.user_id, p)
      setPresenceMap(map)
    })

    return () => {
      mounted = false
    }
  }, [currentWorkspace])

  // Set current user as online
  useEffect(() => {
    if (!user || !currentWorkspace) return

    updatePresence(user.id, currentWorkspace.id, 'online')

    // Set offline on unload
    function handleBeforeUnload() {
      // Use sendBeacon for reliability
      if (navigator.sendBeacon) {
        // Cannot use supabase here, so we rely on the away/offline timer
      }
      updatePresence(user!.id, currentWorkspace!.id, 'offline')
    }

    // Set away on visibility hidden
    function handleVisibilityChange() {
      if (!user || !currentWorkspace) return
      const status: PresenceStatus =
        document.visibilityState === 'visible' ? 'online' : 'away'
      updatePresence(user.id, currentWorkspace.id, status)
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Heartbeat every 60s
    const interval = setInterval(() => {
      if (user && currentWorkspace) {
        updatePresence(user.id, currentWorkspace.id, 'online')
      }
    }, 60000)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      clearInterval(interval)
      if (user && currentWorkspace) {
        updatePresence(user.id, currentWorkspace.id, 'offline')
      }
    }
  }, [user, currentWorkspace])

  // Realtime presence updates
  useEffect(() => {
    if (!currentWorkspace) return

    const channel = supabase
      .channel(`presence:${currentWorkspace.id}`)
      .on<DbUserPresence>(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_presence',
          filter: `workspace_id=eq.${currentWorkspace.id}`,
        },
        (payload: RealtimePostgresChangesPayload<DbUserPresence>) => {
          if (
            payload.eventType === 'INSERT' ||
            payload.eventType === 'UPDATE'
          ) {
            const p = payload.new
            setPresenceMap((prev) => {
              const next = new Map(prev)
              next.set(p.user_id, p)
              return next
            })
          }
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [currentWorkspace])

  const getStatus = useCallback(
    (userId: string): PresenceStatus => {
      return presenceMap.get(userId)?.status ?? 'offline'
    },
    [presenceMap]
  )

  return { presenceMap, getStatus }
}
