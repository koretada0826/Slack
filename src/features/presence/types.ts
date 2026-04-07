import type { PresenceStatus } from '@/types/db'

export interface PresenceUpdate {
  workspace_id: string
  status: PresenceStatus
}
