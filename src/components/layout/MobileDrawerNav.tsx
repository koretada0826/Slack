import { Drawer } from 'antd'
import { useUiStore } from '@/store/uiStore'
import { Sidebar } from './Sidebar'

export function MobileDrawerNav() {
  const { mobileDrawerOpen, setMobileDrawerOpen } = useUiStore()

  return (
    <Drawer
      open={mobileDrawerOpen}
      onClose={() => setMobileDrawerOpen(false)}
      placement="left"
      width={300}
      styles={{ body: { padding: 0, background: 'var(--color-sidebar)' } }}
      closable={false}
    >
      <Sidebar />
    </Drawer>
  )
}
