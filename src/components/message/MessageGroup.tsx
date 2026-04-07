import { MessageItem } from './MessageItem'
import type { MessageGroup as MessageGroupType } from '@/features/messages/types'

interface MessageGroupProps {
  group: MessageGroupType
  onThreadOpen: (messageId: string) => void
}

export function MessageGroup({ group, onThreadOpen }: MessageGroupProps) {
  return (
    <div>
      {group.messages.map((msg, idx) => (
        <MessageItem
          key={msg.id}
          message={msg}
          showHeader={idx === 0}
          onThreadOpen={onThreadOpen}
        />
      ))}
    </div>
  )
}
