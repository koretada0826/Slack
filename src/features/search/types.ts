import type { DbProfile, DbChannel, DbMessage } from '@/types/db'

export type SearchResultType = 'user' | 'channel' | 'message'

export interface SearchResults {
  users: DbProfile[]
  channels: DbChannel[]
  messages: (DbMessage & { sender_display_name: string })[]
}
