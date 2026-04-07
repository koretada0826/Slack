import type { MessageWithSender } from '@/types/entities'
import type { MessageGroup } from './types'

const GROUP_INTERVAL_MS = 5 * 60 * 1000 // 5 minutes

/**
 * Groups consecutive messages from the same sender within a time window.
 * Only groups top-level messages (not thread replies).
 */
export function groupMessages(messages: MessageWithSender[]): MessageGroup[] {
  const groups: MessageGroup[] = []

  for (const msg of messages) {
    const lastGroup = groups[groups.length - 1]

    if (lastGroup && canGroupWith(lastGroup, msg)) {
      lastGroup.messages.push(msg)
    } else {
      groups.push({
        sender_id: msg.sender_id,
        sender_display_name: msg.sender.display_name,
        sender_avatar_url: msg.sender.avatar_url,
        first_message_created_at: msg.created_at,
        messages: [msg],
      })
    }
  }

  return groups
}

function canGroupWith(group: MessageGroup, msg: MessageWithSender): boolean {
  if (group.sender_id !== msg.sender_id) return false
  if (msg.deleted_at) return false

  const lastMsg = group.messages[group.messages.length - 1]
  const timeDiff =
    new Date(msg.created_at).getTime() - new Date(lastMsg.created_at).getTime()

  return timeDiff < GROUP_INTERVAL_MS
}

/**
 * Extracts @mentions from plain text.
 * Pattern: @username (alphanumeric + underscores/hyphens)
 */
export function extractMentionNames(text: string): string[] {
  const matches = text.match(/@([\w-]+)/g)
  if (!matches) return []
  return matches.map((m) => m.slice(1))
}

/** Format timestamp for message display */
export function formatMessageTime(isoString: string): string {
  const date = new Date(isoString)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

/** Format date separator */
export function formatDateSeparator(isoString: string): string {
  const date = new Date(isoString)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString()) return 'Today'
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'

  return date.toLocaleDateString([], {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}
