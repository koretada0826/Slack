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

  // Fetch memberships to determine which channels user is a member of
  const { data: memberships } = await supabase
    .from('channel_members')
    .select('channel_id')
    .eq('user_id', userId)

  const memberSet = new Set(memberships?.map((m) => m.channel_id) ?? [])

  return (channels ?? []).map((ch: DbChannel) => ({
    ...ch,
    is_member: memberSet.has(ch.id),
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
