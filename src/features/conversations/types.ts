import type { ConversationKind } from '@/types/db'

export interface CreateConversationParams {
  workspace_id: string
  kind: ConversationKind
  member_ids: string[]
}
