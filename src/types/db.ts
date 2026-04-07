/** Supabase Database type definitions */

export type WorkspaceRole = 'owner' | 'admin' | 'member' | 'guest'
export type ChannelVisibility = 'public' | 'private'
export type ConversationKind = 'dm' | 'group_dm'
export type PresenceStatus = 'online' | 'offline' | 'away'
export type NotificationType =
  | 'dm_message'
  | 'mention'
  | 'thread_reply'
  | 'reaction'
  | 'invite'
  | 'channel_invite'
export type NotificationEntityType =
  | 'message'
  | 'channel'
  | 'conversation'
  | 'workspace'
  | 'invite'

export interface DbProfile {
  id: string
  display_name: string
  avatar_url: string | null
  email: string
  status_message: string | null
  created_at: string
  updated_at: string
}

export interface DbWorkspace {
  id: string
  name: string
  slug: string
  description: string
  icon_url: string | null
  created_by: string
  created_at: string
  updated_at: string
}

export interface DbWorkspaceMember {
  id: string
  workspace_id: string
  user_id: string
  role: WorkspaceRole
  joined_at: string
  invited_by: string | null
}

export interface DbChannel {
  id: string
  workspace_id: string
  name: string
  slug: string
  description: string | null
  topic: string | null
  visibility: ChannelVisibility
  created_by: string
  created_at: string
  updated_at: string
}

export interface DbChannelMember {
  id: string
  channel_id: string
  user_id: string
  joined_at: string
}

export interface DbConversation {
  id: string
  workspace_id: string
  kind: ConversationKind
  created_by: string
  created_at: string
  updated_at: string
}

export interface DbConversationMember {
  id: string
  conversation_id: string
  user_id: string
  joined_at: string
}

export interface DbMessage {
  id: string
  workspace_id: string
  channel_id: string | null
  conversation_id: string | null
  parent_message_id: string | null
  sender_id: string
  body: string
  body_plaintext: string
  edited_at: string | null
  deleted_at: string | null
  created_at: string
  updated_at: string
}

export interface DbMessageReaction {
  id: string
  message_id: string
  user_id: string
  emoji: string
  created_at: string
}

export interface DbMessageMention {
  id: string
  message_id: string
  mentioned_user_id: string
  created_at: string
}

export interface DbNotification {
  id: string
  user_id: string
  workspace_id: string
  type: NotificationType
  title: string
  body: string
  entity_type: NotificationEntityType
  entity_id: string
  is_read: boolean
  created_at: string
}

export interface DbInvite {
  id: string
  workspace_id: string
  email: string | null
  token: string
  role: WorkspaceRole
  invited_by: string
  expires_at: string
  accepted_at: string | null
  created_at: string
}

export interface DbReadState {
  id: string
  user_id: string
  workspace_id: string
  channel_id: string | null
  conversation_id: string | null
  last_read_message_id: string | null
  last_read_at: string
}

export interface DbUserPresence {
  user_id: string
  workspace_id: string
  status: PresenceStatus
  last_seen_at: string
  updated_at: string
}

/** Supabase generated Database type (simplified for client usage) */
export interface Database {
  public: {
    Tables: {
      profiles: { Row: DbProfile; Insert: Partial<DbProfile> & { id: string }; Update: Partial<DbProfile> }
      workspaces: { Row: DbWorkspace; Insert: Omit<DbWorkspace, 'id' | 'created_at' | 'updated_at'>; Update: Partial<DbWorkspace> }
      workspace_members: { Row: DbWorkspaceMember; Insert: Omit<DbWorkspaceMember, 'id' | 'joined_at'>; Update: Partial<DbWorkspaceMember> }
      channels: { Row: DbChannel; Insert: Omit<DbChannel, 'id' | 'created_at' | 'updated_at'>; Update: Partial<DbChannel> }
      channel_members: { Row: DbChannelMember; Insert: Omit<DbChannelMember, 'id' | 'joined_at'>; Update: Partial<DbChannelMember> }
      conversations: { Row: DbConversation; Insert: Omit<DbConversation, 'id' | 'created_at' | 'updated_at'>; Update: Partial<DbConversation> }
      conversation_members: { Row: DbConversationMember; Insert: Omit<DbConversationMember, 'id' | 'joined_at'>; Update: Partial<DbConversationMember> }
      messages: { Row: DbMessage; Insert: Omit<DbMessage, 'id' | 'created_at' | 'updated_at'>; Update: Partial<DbMessage> }
      message_reactions: { Row: DbMessageReaction; Insert: Omit<DbMessageReaction, 'id' | 'created_at'>; Update: Partial<DbMessageReaction> }
      message_mentions: { Row: DbMessageMention; Insert: Omit<DbMessageMention, 'id' | 'created_at'>; Update: Partial<DbMessageMention> }
      notifications: { Row: DbNotification; Insert: Omit<DbNotification, 'id' | 'created_at'>; Update: Partial<DbNotification> }
      invites: { Row: DbInvite; Insert: Omit<DbInvite, 'id' | 'token' | 'created_at'>; Update: Partial<DbInvite> }
      read_states: { Row: DbReadState; Insert: Omit<DbReadState, 'id'>; Update: Partial<DbReadState> }
      user_presence: { Row: DbUserPresence; Insert: Omit<DbUserPresence, 'updated_at'>; Update: Partial<DbUserPresence> }
    }
    Functions: {
      accept_invite: { Args: { _token: string }; Returns: string }
    }
    Enums: {
      workspace_role: WorkspaceRole
      channel_visibility: ChannelVisibility
      conversation_kind: ConversationKind
      presence_status: PresenceStatus
      notification_type: NotificationType
      notification_entity_type: NotificationEntityType
    }
  }
}
