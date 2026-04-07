import { useNavigate } from 'react-router-dom'
import { Dropdown } from 'antd'
import { useWorkspaceStore } from '@/store/workspaceStore'
import type { MenuProps } from 'antd'

interface WorkspaceSwitcherProps {
  children: React.ReactNode
}

export function WorkspaceSwitcher({ children }: WorkspaceSwitcherProps) {
  const navigate = useNavigate()
  const { workspaces, currentWorkspace, setCurrentWorkspace } =
    useWorkspaceStore()

  const items: MenuProps['items'] = [
    ...workspaces.map((ws) => ({
      key: ws.id,
      label: ws.name,
      disabled: ws.id === currentWorkspace?.id,
    })),
    { type: 'divider' as const },
    { key: 'manage', label: 'すべてのワークスペース' },
  ]

  const handleClick: MenuProps['onClick'] = ({ key }) => {
    if (key === 'manage') {
      navigate('/workspaces')
      return
    }
    const ws = workspaces.find((w) => w.id === key)
    if (ws) {
      setCurrentWorkspace(ws)
      navigate(`/ws/${ws.slug}`)
    }
  }

  return (
    <Dropdown menu={{ items, onClick: handleClick }} trigger={['click']}>
      {children}
    </Dropdown>
  )
}
