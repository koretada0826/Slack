import { supabase } from '@/lib/supabase/client'
import type { SearchResults } from './types'

export async function searchAll(
  workspaceId: string,
  query: string,
  limit = 10
): Promise<SearchResults> {
  const q = query.trim()
  if (!q) return { users: [], channels: [], messages: [] }

  const [usersRes, channelsRes, messagesRes] = await Promise.all([
    // Search users by display_name (workspace members only)
    supabase
      .from('workspace_members')
      .select('profiles(id, display_name, avatar_url, email, status_message, created_at, updated_at)')
      .eq('workspace_id', workspaceId)
      .limit(limit)
      .then(({ data, error }) => {
        if (error) return []
        const lowerQ = q.toLowerCase()
        return (data ?? [])
          .map((d) => d.profiles as unknown as SearchResults['users'][number])
          .filter(
            (p) =>
              p &&
              (p.display_name.toLowerCase().includes(lowerQ) ||
                p.email.toLowerCase().includes(lowerQ))
          )
          .slice(0, limit)
      }),

    // Search channels by name
    supabase
      .from('channels')
      .select('*')
      .eq('workspace_id', workspaceId)
      .ilike('name', `%${q}%`)
      .limit(limit)
      .then(({ data, error }) => {
        if (error) return []
        return data ?? []
      }),

    // Search messages by body_plaintext
    supabase
      .from('messages')
      .select('*, profiles!messages_sender_id_fkey(display_name)')
      .eq('workspace_id', workspaceId)
      .ilike('body_plaintext', `%${q}%`)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(limit)
      .then(({ data, error }) => {
        if (error) return []
        return (data ?? []).map((m) => ({
          ...m,
          sender_display_name:
            (m.profiles as unknown as { display_name: string })?.display_name ?? 'Unknown',
        }))
      }),
  ])

  return {
    users: usersRes,
    channels: channelsRes,
    messages: messagesRes,
  }
}
