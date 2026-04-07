import { groupMessages, formatDateSeparator } from '@/features/messages/utils'
import { MessageGroup } from './MessageGroup'
import { useAutoScroll } from '@/hooks/useAutoScroll'
import { LoadingState } from '@/components/common/LoadingState'
import type { MessageWithSender } from '@/types/entities'
import type { DbChannel } from '@/types/db'
import { ChannelWelcome } from '@/components/channel/ChannelWelcome'

interface MessageListProps {
  messages: MessageWithSender[]
  loading: boolean
  onThreadOpen: (messageId: string) => void
  channelInfo?: DbChannel | null
}

function isSameDay(a: string, b: string): boolean {
  return new Date(a).toDateString() === new Date(b).toDateString()
}

export function MessageList({ messages, loading, onThreadOpen, channelInfo }: MessageListProps) {
  const { containerRef } = useAutoScroll(messages)

  if (loading) return <LoadingState />

  const groups = groupMessages(messages)

  return (
    <div
      ref={containerRef}
      style={{
        flex: 1,
        overflowY: 'auto',
        paddingBottom: 8,
      }}
    >
      {/* Welcome banner for channels */}
      {channelInfo && <ChannelWelcome channel={channelInfo} />}

      {/* Date separators + message groups */}
      {groups.map((group, idx) => {
        const prevGroup = groups[idx - 1]
        const showDateSeparator =
          idx === 0 ||
          (prevGroup && !isSameDay(prevGroup.first_message_created_at, group.first_message_created_at))

        return (
          <div key={`${group.sender_id}-${group.first_message_created_at}-${idx}`}>
            {showDateSeparator && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '16px 20px 8px',
                  gap: 16,
                }}
              >
                <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
                <button
                  style={{
                    background: '#fff',
                    border: '1px solid var(--color-border)',
                    borderRadius: 24,
                    padding: '4px 16px',
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: 700,
                    color: 'var(--color-text)',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  {formatDateSeparator(group.first_message_created_at)}
                </button>
                <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
              </div>
            )}
            <MessageGroup group={group} onThreadOpen={onThreadOpen} />
          </div>
        )
      })}

      {messages.length === 0 && !channelInfo && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-base)' }}>
          まだメッセージがありません。最初のメッセージを送ってみましょう！
        </div>
      )}
    </div>
  )
}
