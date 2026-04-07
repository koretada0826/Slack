import { useState } from 'react'
import {
  EditOutlined,
  CaretDownOutlined,
  SettingOutlined,
  AudioOutlined,
  ContactsOutlined,
  StarOutlined,
  PlusOutlined,
  AppstoreOutlined,
  RobotOutlined,
} from '@ant-design/icons'
import { useWorkspaceStore } from '@/store/workspaceStore'
import { useChannels } from '@/features/channels/hooks'
import { useConversations } from '@/features/conversations/hooks'
import { ChannelList } from '@/components/channel/ChannelList'
import { ChannelCreateModal } from '@/components/channel/ChannelCreateModal'
import { DmList } from '@/components/dm/DmList'
import { StartDmModal } from '@/components/dm/StartDmModal'

export function Sidebar() {
  const { currentWorkspace } = useWorkspaceStore()
  const { channels, refresh: refreshChannels } = useChannels()
  const { conversations, refresh: refreshConversations } = useConversations()
  const [channelModalOpen, setChannelModalOpen] = useState(false)
  const [dmModalOpen, setDmModalOpen] = useState(false)
  const [starCollapsed, setStarCollapsed] = useState(false)

  const sidebarItem = (icon: React.ReactNode, label: string, onClick?: () => void) => (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        width: '100%',
        padding: '3px 20px 3px 20px',
        background: 'none',
        border: 'none',
        color: 'var(--color-sidebar-text)',
        cursor: 'pointer',
        fontSize: 'var(--font-size-base)',
        textAlign: 'left',
        height: 28,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-sidebar-hover)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
    >
      <span style={{ width: 18, display: 'flex', justifyContent: 'center', fontSize: 15, opacity: 0.8 }}>{icon}</span>
      {label}
    </button>
  )

  return (
    <div
      style={{
        width: 'var(--sidebar-width)',
        height: '100%',
        background: 'var(--color-sidebar-bg)',
        color: 'var(--color-sidebar-text)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}
    >
      {/* Workspace header */}
      <div
        style={{
          height: 'var(--header-height)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 12px 0 16px',
          borderBottom: '1px solid var(--color-sidebar-border)',
        }}
      >
        <button
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            background: 'none', border: 'none',
            color: 'var(--color-sidebar-text-bright)',
            cursor: 'pointer', fontSize: 18, fontWeight: 900, padding: 0,
          }}
        >
          {currentWorkspace?.name ?? 'TeamHub'}
          <CaretDownOutlined style={{ fontSize: 10, opacity: 0.6 }} />
        </button>
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            style={{
              width: 28, height: 28, borderRadius: 'var(--radius-sm)',
              background: 'none', border: 'none',
              color: 'var(--color-sidebar-text)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
            }}
          >
            <SettingOutlined />
          </button>
          <button
            onClick={() => setDmModalOpen(true)}
            style={{
              width: 28, height: 28, borderRadius: 'var(--radius-sm)',
              background: 'rgba(255,255,255,0.12)', border: 'none',
              color: 'var(--color-sidebar-text-bright)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
            }}
          >
            <EditOutlined />
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '6px 0' }}>
        {/* Top nav items */}
        {sidebarItem(<AudioOutlined />, 'ハドルミーティング')}
        {sidebarItem(<ContactsOutlined />, 'ディレクトリ')}

        {/* Divider */}
        <div style={{ height: 1, background: 'var(--color-sidebar-border)', margin: '8px 16px' }} />

        {/* Starred section */}
        <div style={{ padding: '0 8px 0 4px', height: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={() => setStarCollapsed(!starCollapsed)}
            style={{
              display: 'flex', alignItems: 'center', gap: 2,
              background: 'none', border: 'none',
              color: 'var(--color-sidebar-text)', cursor: 'pointer',
              fontSize: 'var(--font-size-sm)', fontWeight: 700,
              padding: '2px 8px', borderRadius: 'var(--radius-md)',
            }}
          >
            <CaretDownOutlined style={{ fontSize: 10, transform: starCollapsed ? 'rotate(-90deg)' : 'none', transition: '0.15s' }} />
            <StarOutlined style={{ fontSize: 13, color: '#f5a623' }} />
            スター付き
          </button>
        </div>
        {!starCollapsed && (
          <div style={{ padding: '4px 20px 4px 32px', fontSize: 'var(--font-size-sm)', color: 'var(--color-sidebar-text-muted)', lineHeight: 1.4 }}>
            重要なアイテムをここにドラッグ＆ドロップします
          </div>
        )}

        {/* Divider */}
        <div style={{ height: 1, background: 'var(--color-sidebar-border)', margin: '8px 16px' }} />

        {/* Channels */}
        <ChannelList channels={channels} onCreateClick={() => setChannelModalOpen(true)} />

        {/* Add channel link */}
        <button
          onClick={() => setChannelModalOpen(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            width: '100%', padding: '3px 20px 3px 28px',
            background: 'none', border: 'none',
            color: 'var(--color-sidebar-text)', cursor: 'pointer',
            fontSize: 'var(--font-size-base)', textAlign: 'left', height: 28,
            margin: '0 8px', borderRadius: 'var(--radius-md)',
            maxWidth: 'calc(100% - 16px)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-sidebar-hover)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
        >
          <PlusOutlined style={{ fontSize: 12 }} />
          チャンネルを追加する
        </button>

        {/* Divider */}
        <div style={{ height: 1, background: 'var(--color-sidebar-border)', margin: '8px 16px' }} />

        {/* DM */}
        <DmList conversations={conversations} onStartDmClick={() => setDmModalOpen(true)} />

        {/* Invite members */}
        <button
          onClick={() => setDmModalOpen(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            width: '100%', padding: '3px 20px 3px 28px',
            background: 'none', border: 'none',
            color: 'var(--color-sidebar-text)', cursor: 'pointer',
            fontSize: 'var(--font-size-base)', textAlign: 'left', height: 28,
            margin: '0 8px', borderRadius: 'var(--radius-md)',
            maxWidth: 'calc(100% - 16px)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-sidebar-hover)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
        >
          <PlusOutlined style={{ fontSize: 12 }} />
          メンバーを招待
        </button>

        {/* Divider */}
        <div style={{ height: 1, background: 'var(--color-sidebar-border)', margin: '8px 16px' }} />

        {/* App section */}
        {sidebarItem(<AppstoreOutlined />, 'App')}
        {sidebarItem(<RobotOutlined />, 'TeamBot')}
      </div>

      {/* Modals */}
      <ChannelCreateModal open={channelModalOpen} onClose={() => setChannelModalOpen(false)} onCreated={refreshChannels} />
      <StartDmModal open={dmModalOpen} onClose={() => setDmModalOpen(false)} onCreated={refreshConversations} />
    </div>
  )
}
