import { useIsMobile } from '@/hooks/useIsMobile'
import { WorkspaceRail } from './WorkspaceRail'
import { Sidebar } from './Sidebar'
import { MainPanel } from './MainPanel'
import { DesktopThreadPanel } from './DesktopThreadPanel'
import { MobileDrawerNav } from './MobileDrawerNav'
import { useUiStore } from '@/store/uiStore'
import { MenuOutlined } from '@ant-design/icons'

export function AppShell() {
  const isMobile = useIsMobile()
  const { setMobileDrawerOpen } = useUiStore()

  if (isMobile) {
    return (
      <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            height: 'var(--header-height)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 12px',
            borderBottom: '1px solid var(--color-border)',
            background: 'var(--color-bg)',
            flexShrink: 0,
            gap: 8,
          }}
        >
          <button
            onClick={() => setMobileDrawerOpen(true)}
            style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-sm)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              color: 'var(--color-text)',
            }}
          >
            <MenuOutlined />
          </button>
        </div>
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
          <MainPanel />
        </div>
        <MobileDrawerNav />
      </div>
    )
  }

  return (
    <div style={{ height: '100dvh', display: 'flex' }}>
      <WorkspaceRail />
      <Sidebar />
      <MainPanel />
      <DesktopThreadPanel />
    </div>
  )
}
