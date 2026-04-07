import { MessageItem } from '@/components/message/MessageItem'
import { useAutoScroll } from '@/hooks/useAutoScroll'
import { LoadingState } from '@/components/common/LoadingState'
import { EmptyState } from '@/components/common/EmptyState'
import type { MessageWithSender } from '@/types/entities'

interface ThreadMessageListProps {
  messages: MessageWithSender[]
  loading: boolean
}

export function ThreadMessageList({ messages, loading }: ThreadMessageListProps) {
  const { containerRef } = useAutoScroll(messages)

  if (loading) return <LoadingState />
  if (messages.length === 0) return <EmptyState description="まだ返信がありません" />

  return (
    <div
      ref={containerRef}
      style={{ flex: 1, overflowY: 'auto', paddingTop: 8, paddingBottom: 8 }}
    >
      {messages.map((msg, idx) => (
        <MessageItem
          key={msg.id}
          message={msg}
          showHeader={
            idx === 0 || messages[idx - 1].sender_id !== msg.sender_id
          }
          onThreadOpen={() => {
            /* no nested threads */
          }}
        />
      ))}
    </div>
  )
}
