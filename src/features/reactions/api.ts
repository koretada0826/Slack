import { supabase } from '@/lib/supabase/client'

export async function addReaction(messageId: string, emoji: string, userId: string) {
  const { error } = await supabase
    .from('message_reactions')
    .insert({ message_id: messageId, user_id: userId, emoji })

  if (error) {
    // Unique constraint violation = already reacted
    if (error.code === '23505') return
    throw error
  }
}

export async function removeReaction(messageId: string, emoji: string, userId: string) {
  const { error } = await supabase
    .from('message_reactions')
    .delete()
    .eq('message_id', messageId)
    .eq('user_id', userId)
    .eq('emoji', emoji)

  if (error) throw error
}

export async function toggleReaction(messageId: string, emoji: string, userId: string) {
  // Check if reaction exists
  const { data } = await supabase
    .from('message_reactions')
    .select('id')
    .eq('message_id', messageId)
    .eq('user_id', userId)
    .eq('emoji', emoji)
    .maybeSingle()

  if (data) {
    await removeReaction(messageId, emoji, userId)
  } else {
    await addReaction(messageId, emoji, userId)
  }
}
