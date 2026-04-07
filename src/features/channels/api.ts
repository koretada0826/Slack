import { supabase } from '@/lib/supabase/client'
import type { DbChannel, DbChannelMember } from '@/types/db'
import type { ChannelWithMeta } from '@/types/entities'
import type { CreateChannelParams, UpdateChannelParams } from './types'

export async function fetchChannels(
  workspaceId: string,
  userId: string
): Promise<ChannelWithMeta[]> {
  const { data: channels, error } = await supabase
    .from('channels')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('name')

  if (error) throw error

  // Fetch memberships and read states in parallel
  const [membershipsResult, readStatesResult] = await Promise.all([
    supabase
      .from('channel_members')
      .select('channel_id')
      .eq('user_id', userId),
    supabase
      .from('read_states')
      .select('channel_id, last_read_message_id')
      .eq('user_id', userId)
      .eq('workspace_id', workspaceId)
      .not('channel_id', 'is', null),
  ])

  const memberSet = new Set(membershipsResult.data?.map((m) => m.channel_id) ?? [])

  // Build read state map: channel_id -> last_read_message_id
  const readStateMap = new Map<string, string>()
  for (const rs of readStatesResult.data ?? []) {
    if (rs.channel_id && rs.last_read_message_id) {
      readStateMap.set(rs.channel_id, rs.last_read_message_id)
    }
  }

  // For member channels, compute unread counts
  const memberChannelIds = (channels ?? [])
    .filter((ch: DbChannel) => memberSet.has(ch.id))
    .map((ch: DbChannel) => ch.id)

  let unreadMap = new Map<string, number>()
  if (memberChannelIds.length > 0) {
    // Get last read message timestamps
    const lastReadMsgIds = Array.from(readStateMap.values())
    let lastReadTimestamps = new Map<string, string>()

    if (lastReadMsgIds.length > 0) {
      const { data: lastReadMsgs } = await supabase
        .from('messages')
        .select('id, created_at')
        .in('id', lastReadMsgIds)

      for (const msg of lastReadMsgs ?? []) {
        lastReadTimestamps.set(msg.id, msg.created_at)
      }
    }

    // Count unread for each channel
    for (const chId of memberChannelIds) {
      const lastReadMsgId = readStateMap.get(chId)
      const lastReadAt = lastReadMsgId ? lastReadTimestamps.get(lastReadMsgId) : null

      let query = supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('channel_id', chId)
        .is('parent_message_id', null)
        .is('deleted_at', null)

      if (lastReadAt) {
        query = query.gt('created_at', lastReadAt)
      }

      const { count } = await query
      if (count && count > 0) {
        unreadMap.set(chId, count)
      }
    }
  }

  return (channels ?? []).map((ch: DbChannel) => ({
    ...ch,
    is_member: memberSet.has(ch.id),
    unread_count: unreadMap.get(ch.id) ?? 0,
  }))
}

export async function fetchChannel(channelId: string): Promise<DbChannel> {
  const { data, error } = await supabase
    .from('channels')
    .select('*')
    .eq('id', channelId)
    .single()

  if (error) throw error
  return data
}

export async function createChannel(
  userId: string,
  params: CreateChannelParams
): Promise<DbChannel> {
  const { data, error } = await supabase
    .from('channels')
    .insert({
      workspace_id: params.workspace_id,
      name: params.name,
      slug: params.slug,
      description: params.description ?? null,
      visibility: params.visibility,
      created_by: userId,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateChannel(
  channelId: string,
  params: UpdateChannelParams
): Promise<DbChannel> {
  const { data, error } = await supabase
    .from('channels')
    .update(params)
    .eq('id', channelId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function joinChannel(
  channelId: string,
  userId: string
): Promise<DbChannelMember> {
  const { data, error } = await supabase
    .from('channel_members')
    .insert({ channel_id: channelId, user_id: userId })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function leaveChannel(channelId: string, userId: string) {
  const { error } = await supabase
    .from('channel_members')
    .delete()
    .eq('channel_id', channelId)
    .eq('user_id', userId)

  if (error) throw error
}

export async function fetchChannelMembers(channelId: string) {
  const { data, error } = await supabase
    .from('channel_members')
    .select('*, profiles(*)')
    .eq('channel_id', channelId)

  if (error) throw error
  return data ?? []
}
