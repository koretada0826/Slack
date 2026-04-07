import { useNavigate, useParams } from 'react-router-dom'
import { Typography, Button } from 'antd'
import { ArrowLeftOutlined, CheckOutlined } from '@ant-design/icons'
import { useNotifications } from '@/features/notifications/hooks'
import { NotificationList } from '@/components/notifications/NotificationList'
import { LoadingState } from '@/components/common/LoadingState'

const { Title } = Typography

export default function NotificationPage() {
  const { workspaceSlug } = useParams<{ workspaceSlug: string }>()
  const navigate = useNavigate()
  const { notifications, loading, markRead, markAllRead } = useNotifications()

  return (
    <div
      style={{
        maxWidth: 640,
        margin: '0 auto',
        minHeight: '100dvh',
        background: 'var(--color-bg)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 16px 8px',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(`/ws/${workspaceSlug}`)}
          />
          <Title level={4} style={{ margin: 0 }}>
            通知
          </Title>
        </div>
        <Button
          type="text"
          icon={<CheckOutlined />}
          onClick={markAllRead}
        >
          すべて既読にする
        </Button>
      </div>

      {loading ? (
        <LoadingState />
      ) : (
        <NotificationList notifications={notifications} onRead={markRead} />
      )}
    </div>
  )
}
