import type { ChannelVisibility } from '@/types/db'

export interface CreateChannelParams {
  workspace_id: string
  name: string
  slug: string
  description?: string
  visibility: ChannelVisibility
}

export interface UpdateChannelParams {
  name?: string
  description?: string
  topic?: string
}
