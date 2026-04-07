import { StarOutlined, TeamOutlined, SearchOutlined, BellOutlined, MoreOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useWorkspaceStore } from '@/store/workspaceStore'
import type { DbChannel } from '@/types/db'

interface ChannelHeaderProps {
  channel: DbChannel
}

export function ChannelHeader({ channel }: ChannelHeaderProps) {
  const navigate = useNavigate()
  const { currentWorkspace } = useWorkspaceStore()

  return (
    <div style={{ flexShrink: 0 }}>
      {/* Top search bar */}
      <div
        style={{
          height: 38,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 16px',
          background: 'var(--color-primary-hover)',
        }}
      >
        <button
          onClick={() => navigate(`/ws/${currentWorkspace?.slug}/search`)}
          style={{
            width: '100%', maxWidth: 600, height: 26,
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(255,255,255,0.2)',
            border: '1px solid rgba(255,255,255,0.15)',
            color: 'rgba(255,255,255,0.7)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 6, fontSize: 'var(--font-size-sm)',
          }}
        >
          <SearchOutlined style={{ fontSize: 12 }} />
          探している内容について説明する
        </button>
      </div>

      {/* Channel header */}
      <div
        style={{
          height: 'var(--header-height)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        {/* Left */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <StarOutlined style={{ color: 'var(--color-text-muted)', fontSize: 16, cursor: 'pointer' }} />
          <span style={{ fontWeight: 900, fontSize: 18, color: 'var(--color-text)' }}>
            # {channel.name}
          </span>
        </div>

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button
            style={{
              height: 28, padding: '0 10px', borderRadius: 'var(--radius-sm)',
              background: 'none', border: '1px solid var(--color-border)',
              color: 'var(--color-text-secondary)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 4,
              fontSize: 'var(--font-size-sm)',
            }}
          >
            <TeamOutlined /> チームのメンバーを招待する
          </button>
          {[BellOutlined, SearchOutlined, MoreOutlined].map((Icon, i) => (
            <button
              key={i}
              style={{
                width: 28, height: 28, borderRadius: 'var(--radius-sm)',
                background: 'none', border: 'none',
                color: 'var(--color-text-muted)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
              }}
            >
              <Icon />
            </button>
          ))}
        </div>
      </div>

      {/* Tabs: メッセージ / canvas */}
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 16,
          padding: '0 20px', borderBottom: '1px solid var(--color-border)',
          height: 36,
        }}
      >
        <button
          style={{
            background: 'none', border: 'none', borderBottom: '2px solid var(--color-primary)',
            color: 'var(--color-text)', cursor: 'pointer',
            fontSize: 'var(--font-size-sm)', fontWeight: 700,
            padding: '8px 4px', height: '100%',
            display: 'flex', alignItems: 'center', gap: 4,
          }}
        >
          💬 メッセージ
        </button>
        <button
          style={{
            background: 'none', border: 'none', borderBottom: '2px solid transparent',
            color: 'var(--color-text-muted)', cursor: 'pointer',
            fontSize: 'var(--font-size-sm)', fontWeight: 400,
            padding: '8px 4px', height: '100%',
            display: 'flex', alignItems: 'center', gap: 4,
          }}
        >
          📝 canvas を追加する
        </button>
        <button
          style={{
            background: 'none', border: 'none',
            color: 'var(--color-text-muted)', cursor: 'pointer',
            fontSize: 16, padding: '8px 4px', height: '100%',
          }}
        >
          +
        </button>
      </div>
    </div>
  )
}
