import { useState } from 'react'
import { PlusOutlined, CaretDownOutlined, CaretRightOutlined } from '@ant-design/icons'
import { DmListItem } from './DmListItem'
import { useUiStore } from '@/store/uiStore'
import type { ConversationWithMembers } from '@/types/entities'

interface DmListProps {
  conversations: ConversationWithMembers[]
  onStartDmClick: () => void
}

export function DmList({ conversations, onStartDmClick }: DmListProps) {
  const [collapsed, setCollapsed] = useState(false)
  const { activeChatTarget, setActiveChatTarget, setMobileDrawerOpen } = useUiStore()

  function handleSelect(conversationId: string) {
    setActiveChatTarget({ type: 'conversation', id: conversationId })
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
          ダイレクトメッセージ
        </button>
        <button
          onClick={onStartDmClick}
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
          title="DMを開始"
        >
          <PlusOutlined />
        </button>
      </div>
      {!collapsed &&
        conversations.map((conv) => (
          <DmListItem
            key={conv.id}
            conversation={conv}
            isActive={
              activeChatTarget?.type === 'conversation' &&
              activeChatTarget.id === conv.id
            }
            onClick={() => handleSelect(conv.id)}
          />
        ))}
    </div>
  )
}
