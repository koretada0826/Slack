import { supabase } from '@/lib/supabase/client'
import type { DbConversation, DbProfile } from '@/types/db'
import type { ConversationWithMembers } from '@/types/entities'
import type { CreateConversationParams } from './types'

export async function fetchConversations(
  workspaceId: string,
  userId: string
): Promise<ConversationWithMembers[]> {
  // Get conversations user is a member of in this workspace
  const { data: memberRows, error: mErr } = await supabase
    .from('conversation_members')
    .select('conversation_id')
    .eq('user_id', userId)

  if (mErr) throw mErr
  if (!memberRows || memberRows.length === 0) return []

  const convIds = memberRows.map((m) => m.conversation_id)

  const { data: conversations, error: cErr } = await supabase
    .from('conversations')
    .select('*')
    .eq('workspace_id', workspaceId)
    .in('id', convIds)
    .order('updated_at', { ascending: false })

  if (cErr) throw cErr
  if (!conversations || conversations.length === 0) return []

  // Get all members of these conversations
  const { data: allMembers, error: amErr } = await supabase
    .from('conversation_members')
    .select('conversation_id, user_id, profiles(*)')
    .in('conversation_id', conversations.map((c: DbConversation) => c.id))

  if (amErr) throw amErr

  // Group members by conversation
  const membersByConv = new Map<string, DbProfile[]>()
  for (const row of allMembers ?? []) {
    const profile = row.profiles as unknown as DbProfile | null
    if (!profile) continue
    const existing = membersByConv.get(row.conversation_id) ?? []
    existing.push(profile)
    membersByConv.set(row.conversation_id, existing)
  }

  // Fetch read states for conversations
  const { data: readStates } = await supabase
    .from('read_states')
    .select('conversation_id, last_read_message_id')
    .eq('user_id', userId)
    .eq('workspace_id', workspaceId)
    .not('conversation_id', 'is', null)

  const readStateMap = new Map<string, string>()
  for (const rs of readStates ?? []) {
    if (rs.conversation_id && rs.last_read_message_id) {
      readStateMap.set(rs.conversation_id, rs.last_read_message_id)
    }
  }

  // Get last read message timestamps
  const lastReadMsgIds = Array.from(readStateMap.values())
  let lastReadTimestamps = new Map<string, string>()
  if (lastReadMsgIds.length > 0) {
    const { data: msgs } = await supabase
      .from('messages')
      .select('id, created_at')
      .in('id', lastReadMsgIds)
    for (const msg of msgs ?? []) {
      lastReadTimestamps.set(msg.id, msg.created_at)
    }
  }

  // Compute unread counts
  const unreadMap = new Map<string, number>()
  for (const conv of conversations) {
    const lastReadMsgId = readStateMap.get(conv.id)
    const lastReadAt = lastReadMsgId ? lastReadTimestamps.get(lastReadMsgId) : null

    let query = supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('conversation_id', conv.id)
      .is('parent_message_id', null)
      .is('deleted_at', null)

    if (lastReadAt) {
      query = query.gt('created_at', lastReadAt)
    }

    const { count } = await query
    if (count && count > 0) {
      unreadMap.set(conv.id, count)
    }
  }

  return conversations.map((conv: DbConversation) => ({
    ...conv,
    members: membersByConv.get(conv.id) ?? [],
    unread_count: unreadMap.get(conv.id) ?? 0,
  }))
}

export async function createConversation(
  userId: string,
  params: CreateConversationParams
): Promise<DbConversation> {
  // Use RPC function to create conversation with members atomically
  const { data: convId, error: rpcErr } = await supabase
    .rpc('create_conversation_with_members', {
      _workspace_id: params.workspace_id,
      _kind: params.kind,
      _member_ids: params.member_ids,
    })

  if (rpcErr) {
    // Fallback to direct insert if RPC not available
    const { data: conv, error: cErr } = await supabase
      .from('conversations')
      .insert({
        workspace_id: params.workspace_id,
        kind: params.kind,
        created_by: userId,
      })
      .select()
      .single()

    if (cErr) throw cErr

    const allMemberIds = Array.from(new Set([userId, ...params.member_ids]))
    const memberInserts = allMemberIds.map((uid) => ({
      conversation_id: conv.id,
      user_id: uid,
    }))

    const { error: mErr } = await supabase
      .from('conversation_members')
      .insert(memberInserts)

    if (mErr) throw mErr

    return conv
  }

  // Fetch the created conversation
  const { data: conv, error: fetchErr } = await supabase
    .from('conversations')
    .select('*')
    .eq('id', convId)
    .single()

  if (fetchErr) throw fetchErr
  return conv
}

/** Find an existing 1:1 DM between two users in a workspace */
export async function findExistingDm(
  workspaceId: string,
  userId1: string,
  userId2: string
): Promise<DbConversation | null> {
  // Get DMs that userId1 is in
  const { data: convs1 } = await supabase
    .from('conversation_members')
    .select('conversation_id')
    .eq('user_id', userId1)

  if (!convs1 || convs1.length === 0) return null

  // Check which of those are also joined by userId2 and are DM kind
  const { data: matches } = await supabase
    .from('conversations')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('kind', 'dm')
    .in('id', convs1.map((c) => c.conversation_id))

  if (!matches) return null

  for (const conv of matches) {
    const { data: members } = await supabase
      .from('conversation_members')
      .select('user_id')
      .eq('conversation_id', conv.id)

    if (!members) continue
    const memberIds = members.map((m) => m.user_id)
    if (
      memberIds.length === 2 &&
      memberIds.includes(userId1) &&
      memberIds.includes(userId2)
    ) {
      return conv
    }
  }

  return null
}
