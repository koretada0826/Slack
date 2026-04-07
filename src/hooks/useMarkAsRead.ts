import { useEffect, useRef } from 'react'
import { useMarkAsRead as useMarkAsReadFn } from '@/features/readStates/hooks'
import type { ChatTarget } from '@/types/common'
import type { MessageWithSender } from '@/types/entities'

/**
 * Automatically marks the active chat as read when:
 * - Messages load
 * - New messages arrive and user is at the bottom
 */
export function useAutoMarkAsRead(
  target: ChatTarget,
  messages: MessageWithSender[]
) {
  const markAsRead = useMarkAsReadFn()
  const lastMarkedRef = useRef<string | null>(null)

  useEffect(() => {
    if (!target || messages.length === 0) return

    const lastMessage = messages[messages.length - 1]
    if (lastMessage.id === lastMarkedRef.current) return

    // Mark as read after a short delay (user is viewing)
    const timer = setTimeout(() => {
      markAsRead(target, lastMessage.id)
      lastMarkedRef.current = lastMessage.id
    }, 1000)

    return () => clearTimeout(timer)
  }, [target, messages, markAsRead])
}
