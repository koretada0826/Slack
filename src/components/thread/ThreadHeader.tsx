import { Button, Typography } from 'antd'
import { ArrowLeftOutlined, CloseOutlined } from '@ant-design/icons'

const { Text } = Typography

interface ThreadHeaderProps {
  onClose: () => void
  isMobile?: boolean
}

export function ThreadHeader({ onClose, isMobile }: ThreadHeaderProps) {
  return (
    <div
      style={{
        height: 'var(--header-height)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        borderBottom: '1px solid var(--color-border)',
        flexShrink: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {isMobile && (
          <Button type="text" icon={<ArrowLeftOutlined />} onClick={onClose} />
        )}
        <Text strong>スレッド</Text>
      </div>
      {!isMobile && (
        <Button type="text" size="small" icon={<CloseOutlined />} onClick={onClose} />
      )}
    </div>
  )
}
