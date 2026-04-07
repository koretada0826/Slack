import { Avatar } from 'antd'
import { UserOutlined } from '@ant-design/icons'

interface AppAvatarProps {
  name?: string
  src?: string
  size?: number
}

function getInitial(name: string): string {
  return name.charAt(0).toUpperCase()
}

function hashColor(name: string): string {
  const colors = [
    '#0d9488', '#0ea5e9', '#8b5cf6', '#ec4899',
    '#f97316', '#84cc16', '#06b6d4', '#a855f7',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

export function AppAvatar({ name, src, size = 32 }: AppAvatarProps) {
  if (src) {
    return <Avatar src={src} size={size} />
  }

  if (name) {
    return (
      <Avatar
        size={size}
        style={{ background: hashColor(name), flexShrink: 0 }}
      >
        {getInitial(name)}
      </Avatar>
    )
  }

  return <Avatar size={size} icon={<UserOutlined />} />
}
