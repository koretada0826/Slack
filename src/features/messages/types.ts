export interface SendMessageParams {
  workspace_id: string
  channel_id?: string
  conversation_id?: string
  parent_message_id?: string
  body: string
  body_plaintext: string
  mention_user_ids?: string[]
}

export interface UpdateMessageParams {
  body: string
  body_plaintext: string
}

/** A group of consecutive messages from the same sender within a time window */
export interface MessageGroup {
  sender_id: string
  sender_display_name: string
  sender_avatar_url: string | null
  first_message_created_at: string
  messages: import('@/types/entities').MessageWithSender[]
}
