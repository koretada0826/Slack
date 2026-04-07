import { supabase } from '@/lib/supabase/client'
import type { DbMessage, DbProfile, DbMessageReaction } from '@/types/db'
import type { MessageWithSender, ReactionSummary } from '@/types/entities'
import type { SendMessageParams, UpdateMessageParams } from './types'

const MESSAGES_PAGE_SIZE = 50

export async function fetchMessages(
  target: { channel_id?: string; conversation_id?: string },
  currentUserId: string,
  options?: { before?: string; limit?: number }
): Promise<MessageWithSender[]> {
  const limit = options?.limit ?? MESSAGES_PAGE_SIZE

  let query = supabase
    .from('messages')
    .select('*, profiles!messages_sender_id_fkey(*)')
    .is('parent_message_id', null) // top-level only
    .is('deleted_at', null)
    .order('created_at', { ascending: true })
    .limit(limit)

  if (target.channel_id) {
    query = query.eq('channel_id', target.channel_id)
  } else if (target.conversation_id) {
    query = query.eq('conversation_id', target.conversation_id)
  } else {
    throw new Error('Either channel_id or conversation_id is required')
  }

  if (options?.before) {
    query = query.lt('created_at', options.before)
  }

  const { data, error } = await query

  if (error) throw error
  if (!data || data.length === 0) return []

  const messageIds = data.map((m: DbMessage) => m.id)

  // Fetch reactions, thread counts in parallel
  const [reactionsResult, threadCountsResult] = await Promise.all([
    supabase
      .from('message_reactions')
      .select('*')
      .in('message_id', messageIds),
    supabase
      .from('messages')
      .select('parent_message_id')
      .in('parent_message_id', messageIds)
      .is('deleted_at', null),
  ])

  const reactions = reactionsResult.data ?? []
  const threadReplies = threadCountsResult.data ?? []

  // Aggregate reactions per message
  const reactionsByMsg = new Map<string, DbMessageReaction[]>()
  for (const r of reactions) {
    const existing = reactionsByMsg.get(r.message_id) ?? []
    existing.push(r)
    reactionsByMsg.set(r.message_id, existing)
  }

  // Count threads per parent
  const threadCountMap = new Map<string, number>()
  for (const r of threadReplies) {
    if (r.parent_message_id) {
      threadCountMap.set(
        r.parent_message_id,
        (threadCountMap.get(r.parent_message_id) ?? 0) + 1
      )
    }
  }

  return data.map((msg: DbMessage & { profiles: DbProfile }) => ({
    ...msg,
    sender: msg.profiles,
    reactions: aggregateReactions(
      reactionsByMsg.get(msg.id) ?? [],
      currentUserId
    ),
    thread_count: threadCountMap.get(msg.id) ?? 0,
  }))
}

export async function fetchThreadMessages(
  parentMessageId: string,
  currentUserId: string
): Promise<MessageWithSender[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*, profiles!messages_sender_id_fkey(*)')
    .eq('parent_message_id', parentMessageId)
    .is('deleted_at', null)
    .order('created_at', { ascending: true })

  if (error) throw error
  if (!data || data.length === 0) return []

  const messageIds = data.map((m: DbMessage) => m.id)

  const { data: reactions } = await supabase
    .from('message_reactions')
    .select('*')
    .in('message_id', messageIds)

  const reactionsByMsg = new Map<string, DbMessageReaction[]>()
  for (const r of reactions ?? []) {
    const existing = reactionsByMsg.get(r.message_id) ?? []
    existing.push(r)
    reactionsByMsg.set(r.message_id, existing)
  }

  return data.map((msg: DbMessage & { profiles: DbProfile }) => ({
    ...msg,
    sender: msg.profiles,
    reactions: aggregateReactions(
      reactionsByMsg.get(msg.id) ?? [],
      currentUserId
    ),
    thread_count: 0,
  }))
}

export async function sendMessage(
  params: SendMessageParams
): Promise<DbMessage> {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      workspace_id: params.workspace_id,
      channel_id: params.channel_id ?? null,
      conversation_id: params.conversation_id ?? null,
      parent_message_id: params.parent_message_id ?? null,
      sender_id: (await supabase.auth.getUser()).data.user!.id,
      body: params.body,
      body_plaintext: params.body_plaintext,
    })
    .select()
    .single()

  if (error) throw error

  // Insert mentions if any
  if (params.mention_user_ids && params.mention_user_ids.length > 0) {
    const mentionInserts = params.mention_user_ids.map((uid) => ({
      message_id: data.id,
      mentioned_user_id: uid,
    }))

    await supabase.from('message_mentions').insert(mentionInserts)
  }

  return data
}

export async function updateMessage(
  messageId: string,
  params: UpdateMessageParams
): Promise<DbMessage> {
  const { data, error } = await supabase
    .from('messages')
    .update({
      body: params.body,
      body_plaintext: params.body_plaintext,
      edited_at: new Date().toISOString(),
    })
    .eq('id', messageId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteMessage(messageId: string): Promise<void> {
  const { error } = await supabase
    .from('messages')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', messageId)

  if (error) throw error
}

function aggregateReactions(
  reactions: DbMessageReaction[],
  currentUserId: string
): ReactionSummary[] {
  const map = new Map<string, { user_ids: string[] }>()

  for (const r of reactions) {
    const existing = map.get(r.emoji)
    if (existing) {
      existing.user_ids.push(r.user_id)
    } else {
      map.set(r.emoji, { user_ids: [r.user_id] })
    }
  }

  return Array.from(map.entries()).map(([emoji, { user_ids }]) => ({
    emoji,
    count: user_ids.length,
    user_ids,
    reacted_by_me: user_ids.includes(currentUserId),
  }))
}
