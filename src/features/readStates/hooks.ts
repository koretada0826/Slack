import { useCallback } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useWorkspaceStore } from '@/store/workspaceStore'
import { upsertReadState } from './api'
import type { ChatTarget } from '@/types/common'

/**
 * Returns a function that marks the current chat target as read,
 * given the last visible message ID.
 */
export function useMarkAsRead() {
  const { user } = useAuthStore()
  const { currentWorkspace } = useWorkspaceStore()

  return useCallback(
    async (target: ChatTarget, lastMessageId: string) => {
      if (!user || !currentWorkspace || !target) return

      await upsertReadState({
        user_id: user.id,
        workspace_id: currentWorkspace.id,
        channel_id: target.type === 'channel' ? target.id : undefined,
        conversation_id:
          target.type === 'conversation' ? target.id : undefined,
        last_read_message_id: lastMessageId,
      })
    },
    [user, currentWorkspace]
  )
}
