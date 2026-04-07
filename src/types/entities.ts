import type {
  DbProfile,
  DbWorkspace,
  DbWorkspaceMember,
  DbChannel,
  DbConversation,
  DbMessage,
  DbMessageReaction,
  DbNotification,
} from './db'

/** Profile with workspace membership info */
export interface WorkspaceMemberProfile extends DbProfile {
  membership: DbWorkspaceMember
}

/** Channel with computed fields */
export interface ChannelWithMeta extends DbChannel {
  unread_count?: number
  is_member?: boolean
}

/** Conversation with member profiles */
export interface ConversationWithMembers extends DbConversation {
  members: DbProfile[]
  unread_count?: number
  last_message?: DbMessage | null
}

/** Message with sender profile and thread info */
export interface MessageWithSender extends DbMessage {
  sender: DbProfile
  reactions: ReactionSummary[]
  thread_count?: number
  latest_thread_reply_at?: string | null
}

/** Aggregated reaction */
export interface ReactionSummary {
  emoji: string
  count: number
  user_ids: string[]
  reacted_by_me: boolean
}

/** Workspace with current user's role */
export interface WorkspaceWithRole extends DbWorkspace {
  role: DbWorkspaceMember['role']
}

/** Notification with readable info */
export type NotificationItem = DbNotification

/** Aggregated reaction from DB */
export interface DbReactionAggregated extends DbMessageReaction {
  profiles?: DbProfile
}
