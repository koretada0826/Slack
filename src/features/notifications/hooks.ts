import { useState, useEffect, useCallback } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useWorkspaceStore } from '@/store/workspaceStore'
import { useNotificationStore } from '@/store/notificationStore'
import { supabase } from '@/lib/supabase/client'
import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
} from './api'
import type { DbNotification } from '@/types/db'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'

export function useNotifications() {
  const [notifications, setNotifications] = useState<DbNotification[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuthStore()
  const { currentWorkspace } = useWorkspaceStore()
  const { setUnreadCount } = useNotificationStore()

  const refresh = useCallback(async () => {
    if (!user || !currentWorkspace) return
    setLoading(true)
    try {
      const [data, count] = await Promise.all([
        fetchNotifications(user.id, {
          workspace_id: currentWorkspace.id,
        }),
        fetchUnreadCount(user.id, currentWorkspace.id),
      ])
      setNotifications(data)
      setUnreadCount(count)
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [user, currentWorkspace, setUnreadCount])

  useEffect(() => {
    refresh()
  }, [refresh])

  // Realtime subscription for new notifications
  useEffect(() => {
    if (!user || !currentWorkspace) return

    const channel = supabase
      .channel(`notifications:${user.id}:${currentWorkspace.id}`)
      .on<DbNotification>(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload: RealtimePostgresChangesPayload<DbNotification>) => {
          if (payload.eventType !== 'INSERT') return
          const newNotif = payload.new
          if (newNotif.workspace_id !== currentWorkspace.id) return

          setNotifications((prev) => {
            if (prev.some((n) => n.id === newNotif.id)) return prev
            return [newNotif, ...prev]
          })
          setUnreadCount((prev: number) => prev + 1)
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [user, currentWorkspace, setUnreadCount])

  const markRead = useCallback(
    async (id: string) => {
      await markNotificationRead(id)
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      )
      setUnreadCount((prev: number) => Math.max(0, prev - 1))
    },
    [setUnreadCount]
  )

  const markAllRead = useCallback(async () => {
    if (!user || !currentWorkspace) return
    await markAllNotificationsRead(user.id, currentWorkspace.id)
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    setUnreadCount(0)
  }, [user, currentWorkspace, setUnreadCount])

  return { notifications, loading, refresh, markRead, markAllRead }
}
