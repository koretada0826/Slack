import { supabase } from '@/lib/supabase/client'
import type { DbNotification } from '@/types/db'
import type { NotificationFilters } from './types'

export async function fetchNotifications(
  userId: string,
  filters: NotificationFilters
): Promise<DbNotification[]> {
  let query = supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .eq('workspace_id', filters.workspace_id)
    .order('created_at', { ascending: false })
    .limit(filters.limit ?? 50)

  if (filters.unread_only) {
    query = query.eq('is_read', false)
  }

  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function fetchUnreadCount(
  userId: string,
  workspaceId: string
): Promise<number> {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('workspace_id', workspaceId)
    .eq('is_read', false)

  if (error) throw error
  return count ?? 0
}

export async function markNotificationRead(notificationId: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)

  if (error) throw error
}

export async function markAllNotificationsRead(
  userId: string,
  workspaceId: string
) {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('workspace_id', workspaceId)
    .eq('is_read', false)

  if (error) throw error
}
