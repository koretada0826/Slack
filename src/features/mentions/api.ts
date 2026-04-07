import { supabase } from '@/lib/supabase/client'
import type { MentionCandidate } from './types'

/**
 * Searches workspace members by display_name prefix.
 * Used for @mention autocomplete.
 */
export async function searchMentionCandidates(
  workspaceId: string,
  query: string,
  limit = 8
): Promise<MentionCandidate[]> {
  const { data, error } = await supabase
    .from('workspace_members')
    .select('user_id, profiles(id, display_name, avatar_url)')
    .eq('workspace_id', workspaceId)
    .limit(limit)

  if (error) throw error

  const candidates: MentionCandidate[] = []
  const lowerQuery = query.toLowerCase()

  for (const row of data ?? []) {
    const profile = row.profiles as unknown as {
      id: string
      display_name: string
      avatar_url: string | null
    } | null
    if (!profile) continue
    if (
      !lowerQuery ||
      profile.display_name.toLowerCase().includes(lowerQuery)
    ) {
      candidates.push({
        id: profile.id,
        display_name: profile.display_name,
        avatar_url: profile.avatar_url,
      })
    }
  }

  return candidates.slice(0, limit)
}
