import { supabase } from '@/lib/supabase/client'
import type { DbUserPresence, PresenceStatus } from '@/types/db'

export async function fetchPresence(
  workspaceId: string
): Promise<DbUserPresence[]> {
  const { data, error } = await supabase
    .from('user_presence')
    .select('*')
    .eq('workspace_id', workspaceId)

  if (error) throw error
  return data ?? []
}

export async function updatePresence(
  userId: string,
  workspaceId: string,
  status: PresenceStatus
) {
  const { error } = await supabase.from('user_presence').upsert(
    {
      user_id: userId,
      workspace_id: workspaceId,
      status,
      last_seen_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,workspace_id' }
  )

  if (error) throw error
}
