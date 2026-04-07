import { supabase } from '@/lib/supabase/client'
import type { DbChannel, DbChannelMember } from '@/types/db'
import type { ChannelWithMeta } from '@/types/entities'
import type { CreateChannelParams, UpdateChannelParams } from './types'

export async function fetchChannels(
  workspaceId: string,
  userId: string
): Promise<ChannelWithMeta[]> {
  // Fetch channels, memberships, and unread counts in parallel
  const [channelsResult, membershipsResult, unreadResult] = await Promise.all([
    supabase
      .from('channels')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('name'),
    supabase
      .from('channel_members')
      .select('channel_id')
      .eq('user_id', userId),
    supabase.rpc('get_unread_counts', {
      _user_id: userId,
      _workspace_id: workspaceId,
    }),
  ])

  if (channelsResult.error) throw channelsResult.error

  const memberSet = new Set(membershipsResult.data?.map((m) => m.channel_id) ?? [])

  const unreadMap = new Map<string, number>()
  for (const row of unreadResult.data ?? []) {
    if (row.target_type === 'channel') {
      unreadMap.set(row.target_id, Number(row.unread_count))
    }
  }

  return (channelsResult.data ?? []).map((ch: DbChannel) => ({
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
