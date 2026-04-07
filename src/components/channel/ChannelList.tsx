import { useState } from 'react'
import { PlusOutlined, CaretDownOutlined, CaretRightOutlined } from '@ant-design/icons'
import { ChannelListItem } from './ChannelListItem'
import { useUiStore } from '@/store/uiStore'
import type { ChannelWithMeta } from '@/types/entities'

interface ChannelListProps {
  channels: ChannelWithMeta[]
  onCreateClick: () => void
}

export function ChannelList({ channels, onCreateClick }: ChannelListProps) {
  const [collapsed, setCollapsed] = useState(false)
  const { activeChatTarget, setActiveChatTarget, setMobileDrawerOpen } = useUiStore()

  function handleSelect(channelId: string) {
    setActiveChatTarget({ type: 'channel', id: channelId })
    setMobileDrawerOpen(false)
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 8px 0 4px',
          height: 28,
        }}
      >
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            background: 'none',
            border: 'none',
            color: 'var(--color-sidebar-text)',
            cursor: 'pointer',
            fontSize: 'var(--font-size-sm)',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: 'var(--radius-md)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-sidebar-hover)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
        >
          {collapsed ? (
            <CaretRightOutlined style={{ fontSize: 10 }} />
          ) : (
            <CaretDownOutlined style={{ fontSize: 10 }} />
          )}
          チャンネル
        </button>
        <button
          onClick={onCreateClick}
          style={{
            width: 24,
            height: 24,
            borderRadius: 'var(--radius-sm)',
            background: 'none',
            border: 'none',
            color: 'var(--color-sidebar-text)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-sidebar-hover)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
          title="チャンネルを作成"
        >
          <PlusOutlined />
        </button>
      </div>
      {!collapsed &&
        channels.map((ch) => (
          <ChannelListItem
            key={ch.id}
            channel={ch}
            isActive={
              activeChatTarget?.type === 'channel' &&
              activeChatTarget.id === ch.id
            }
            onClick={() => handleSelect(ch.id)}
          />
        ))}
    </div>
  )
}
