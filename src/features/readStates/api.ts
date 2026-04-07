import { supabase } from '@/lib/supabase/client'
import type { DbReadState } from '@/types/db'

export async function fetchReadStates(
  userId: string,
  workspaceId: string
): Promise<DbReadState[]> {
  const { data, error } = await supabase
    .from('read_states')
    .select('*')
    .eq('user_id', userId)
    .eq('workspace_id', workspaceId)

  if (error) throw error
  return data ?? []
}

/**
 * Upsert read state for a channel or conversation.
 * Uses the partial unique indexes on (user_id, channel_id) and (user_id, conversation_id).
 */
export async function upsertReadState(params: {
  user_id: string
  workspace_id: string
  channel_id?: string
  conversation_id?: string
  last_read_message_id: string
}) {
  // Try to find existing
  let query = supabase
    .from('read_states')
    .select('id')
    .eq('user_id', params.user_id)

  if (params.channel_id) {
    query = query.eq('channel_id', params.channel_id)
  } else if (params.conversation_id) {
    query = query.eq('conversation_id', params.conversation_id)
  }

  const { data: existing } = await query.maybeSingle()

  if (existing) {
    const { error } = await supabase
      .from('read_states')
      .update({
        last_read_message_id: params.last_read_message_id,
        last_read_at: new Date().toISOString(),
      })
      .eq('id', existing.id)

    if (error) throw error
  } else {
    const { error } = await supabase.from('read_states').insert({
      user_id: params.user_id,
      workspace_id: params.workspace_id,
      channel_id: params.channel_id ?? null,
      conversation_id: params.conversation_id ?? null,
      last_read_message_id: params.last_read_message_id,
      last_read_at: new Date().toISOString(),
    })

    if (error) throw error
  }
}

/**
 * Count unread messages for a channel.
 */
export async function getChannelUnreadCount(
  userId: string,
  channelId: string
): Promise<number> {
  // Get the read state
  const { data: readState } = await supabase
    .from('read_states')
    .select('last_read_message_id')
    .eq('user_id', userId)
    .eq('channel_id', channelId)
    .maybeSingle()

  let query = supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('channel_id', channelId)
    .is('parent_message_id', null)
    .is('deleted_at', null)

  if (readState?.last_read_message_id) {
    // Get the timestamp of the last read message
    const { data: lastReadMsg } = await supabase
      .from('messages')
      .select('created_at')
      .eq('id', readState.last_read_message_id)
      .single()

    if (lastReadMsg) {
      query = query.gt('created_at', lastReadMsg.created_at)
    }
  }

  const { count, error } = await query
  if (error) throw error
  return count ?? 0
}

/**
 * Count unread messages for a conversation.
 */
export async function getConversationUnreadCount(
  userId: string,
  conversationId: string
): Promise<number> {
  const { data: readState } = await supabase
    .from('read_states')
    .select('last_read_message_id')
    .eq('user_id', userId)
    .eq('conversation_id', conversationId)
    .maybeSingle()

  let query = supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('conversation_id', conversationId)
    .is('parent_message_id', null)
    .is('deleted_at', null)

  if (readState?.last_read_message_id) {
    const { data: lastReadMsg } = await supabase
      .from('messages')
      .select('created_at')
      .eq('id', readState.last_read_message_id)
      .single()

    if (lastReadMsg) {
      query = query.gt('created_at', lastReadMsg.created_at)
    }
  }

  const { count, error } = await query
  if (error) throw error
  return count ?? 0
}
