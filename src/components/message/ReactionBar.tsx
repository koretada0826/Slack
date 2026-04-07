import { Button, Popover } from 'antd'
import { SmileOutlined } from '@ant-design/icons'
import type { ReactionSummary } from '@/types/entities'

interface ReactionBarProps {
  reactions: ReactionSummary[]
  onToggle: (emoji: string) => void
}

const QUICK_EMOJIS = ['👍', '❤️', '😂', '🎉', '🤔', '👀', '🙏', '🔥']

export function ReactionBar({ reactions, onToggle }: ReactionBarProps) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
      {reactions.map((r) => (
        <button
          key={r.emoji}
          onClick={() => onToggle(r.emoji)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            padding: '2px 8px',
            border: r.reacted_by_me
              ? '1px solid var(--color-primary)'
              : '1px solid var(--color-border)',
            borderRadius: 'var(--radius-full)',
            background: r.reacted_by_me ? 'var(--color-primary-bg)' : 'var(--color-bg-secondary)',
            cursor: 'pointer',
            fontSize: 13,
          }}
        >
          <span>{r.emoji}</span>
          <span style={{ color: 'var(--color-text-secondary)', fontSize: 12 }}>
            {r.count}
          </span>
        </button>
      ))}
      <Popover
        trigger="click"
        placement="topLeft"
        content={
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', maxWidth: 200 }}>
            {QUICK_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => onToggle(emoji)}
                style={{
                  fontSize: 20,
                  padding: 4,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
        }
      >
        <Button
          type="text"
          size="small"
          icon={<SmileOutlined />}
          style={{
            width: 28,
            height: 28,
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--color-border)',
          }}
        />
      </Popover>
    </div>
  )
}
