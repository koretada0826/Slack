import { useCallback } from 'react'
import { useAuthStore } from '@/store/authStore'
import { toggleReaction } from './api'

export function useToggleReaction() {
  const { user } = useAuthStore()

  return useCallback(
    async (messageId: string, emoji: string) => {
      if (!user) return
      await toggleReaction(messageId, emoji, user.id)
    },
    [user]
  )
}
