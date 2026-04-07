import { Tooltip } from 'antd'
import { useNavigate } from 'react-router-dom'
import {
  HomeOutlined,
  MessageOutlined,
  BellOutlined,
  PlusOutlined,
  MoreOutlined,
} from '@ant-design/icons'
import { useWorkspaceStore } from '@/store/workspaceStore'
import { useNotificationStore } from '@/store/notificationStore'
import { Badge } from 'antd'
import type { WorkspaceWithRole } from '@/types/entities'

export function WorkspaceRail() {
  const navigate = useNavigate()
  const { workspaces, currentWorkspace, setCurrentWorkspace } = useWorkspaceStore()
  const { unreadCount } = useNotificationStore()
  const slug = currentWorkspace?.slug ?? ''

  function handleSelect(ws: WorkspaceWithRole) {
    setCurrentWorkspace(ws)
    navigate(`/ws/${ws.slug}`)
  }

  const navItems = [
    { icon: <HomeOutlined />, label: 'ホーム', onClick: () => {} },
    {
      icon: (
        <Badge count={unreadCount} size="small" offset={[2, -2]}>
          <MessageOutlined style={{ color: 'inherit', fontSize: 18 }} />
        </Badge>
      ),
      label: 'DM',
      onClick: () => {},
    },
    { icon: <BellOutlined />, label: 'アクティビティ', onClick: () => navigate(`/ws/${slug}/notifications`) },
  ]

  return (
    <div
      style={{
        width: 'var(--workspace-rail-width)',
        height: '100%',
        background: 'var(--color-rail-bg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '12px 0 8px',
        gap: 2,
        overflowY: 'auto',
        flexShrink: 0,
      }}
    >
      {/* Workspace icon */}
      {workspaces.map((ws) => {
        const isActive = currentWorkspace?.id === ws.id
        return (
          <Tooltip key={ws.id} title={ws.name} placement="right">
            <button
              onClick={() => handleSelect(ws)}
              style={{
                width: 36,
                height: 36,
                borderRadius: isActive ? 8 : 18,
                background: '#611f69',
                color: '#fff',
                border: isActive ? '2px solid #fff' : '2px solid transparent',
                cursor: 'pointer',
                fontSize: 16,
                fontWeight: 900,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'border-radius 0.15s',
                marginBottom: 12,
              }}
            >
              {ws.name.charAt(0).toUpperCase()}
            </button>
          </Tooltip>
        )
      })}

      {/* Nav items */}
      {navItems.map((item) => (
        <Tooltip key={item.label} title={item.label} placement="right">
          <button
            onClick={item.onClick}
            style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              padding: '8px 0',
              background: 'none',
              border: 'none',
              color: 'var(--color-rail-text)',
              cursor: 'pointer',
              fontSize: 18,
            }}
          >
            {item.icon}
            <span style={{ fontSize: 10, lineHeight: 1 }}>{item.label}</span>
          </button>
        </Tooltip>
      ))}

      <div style={{ flex: 1 }} />

      {/* Add workspace */}
      <Tooltip title="ワークスペース追加" placement="right">
        <button
          onClick={() => navigate('/workspaces')}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            color: 'var(--color-rail-text)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
            marginBottom: 4,
          }}
        >
          <PlusOutlined />
        </button>
      </Tooltip>

      <Tooltip title="その他" placement="right">
        <button
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            background: 'none',
            border: 'none',
            color: 'var(--color-rail-text)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
          }}
        >
          <MoreOutlined />
        </button>
      </Tooltip>
    </div>
  )
}
