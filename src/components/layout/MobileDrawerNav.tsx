import { Drawer } from 'antd'
import { useUiStore } from '@/store/uiStore'
import { useWorkspaceStore } from '@/store/workspaceStore'
import { useNavigate } from 'react-router-dom'
import { HomeOutlined, MessageOutlined, BellOutlined } from '@ant-design/icons'
import { Sidebar } from './Sidebar'

export function MobileDrawerNav() {
  const { mobileDrawerOpen, setMobileDrawerOpen, setActiveChatTarget } = useUiStore()
  const { currentWorkspace } = useWorkspaceStore()
  const navigate = useNavigate()
  const slug = currentWorkspace?.slug ?? ''

  function navigateAndClose(path: string) {
    navigate(path)
    setMobileDrawerOpen(false)
  }

  return (
    <Drawer
      open={mobileDrawerOpen}
      onClose={() => setMobileDrawerOpen(false)}
      placement="left"
      width={300}
      styles={{ body: { padding: 0, background: 'var(--color-sidebar-bg)' } }}
      closable={false}
    >
      {/* Quick nav bar for mobile */}
      <div
        style={{
          display: 'flex',
          gap: 4,
          padding: '8px 12px',
          borderBottom: '1px solid var(--color-sidebar-border)',
          background: 'var(--color-sidebar-bg)',
        }}
      >
        <button
          onClick={() => {
            setActiveChatTarget(null)
            navigateAndClose(`/ws/${slug}`)
          }}
          style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 4, padding: '6px 0', background: 'none', border: 'none',
            color: 'var(--color-sidebar-text)', cursor: 'pointer', fontSize: 13,
            borderRadius: 'var(--radius-sm)',
          }}
        >
          <HomeOutlined /> ホーム
        </button>
        <button
          onClick={() => {
            setActiveChatTarget(null)
            navigateAndClose(`/ws/${slug}`)
          }}
          style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 4, padding: '6px 0', background: 'none', border: 'none',
            color: 'var(--color-sidebar-text)', cursor: 'pointer', fontSize: 13,
            borderRadius: 'var(--radius-sm)',
          }}
        >
          <MessageOutlined /> DM
        </button>
        <button
          onClick={() => navigateAndClose(`/ws/${slug}/notifications`)}
          style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 4, padding: '6px 0', background: 'none', border: 'none',
            color: 'var(--color-sidebar-text)', cursor: 'pointer', fontSize: 13,
            borderRadius: 'var(--radius-sm)',
          }}
        >
          <BellOutlined /> 通知
        </button>
      </div>
      <Sidebar />
    </Drawer>
  )
}
