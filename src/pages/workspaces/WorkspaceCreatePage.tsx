import { useNavigate } from 'react-router-dom'
import { Typography, Button } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { WorkspaceCreateForm } from '@/components/workspace/WorkspaceCreateForm'

const { Title, Text } = Typography

export default function WorkspaceCreatePage() {
  const navigate = useNavigate()

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100dvh',
        background: 'var(--color-bg-secondary)',
        padding: 16,
      }}
    >
      <div style={{ width: '100%', maxWidth: 440 }}>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/workspaces')}
          style={{ marginBottom: 16 }}
        >
          戻る
        </Button>

        <div
          style={{
            background: '#fff',
            borderRadius: 'var(--radius-xl)',
            padding: '40px 32px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <Title level={3} style={{ marginBottom: 4 }}>
              ワークスペースを作成
            </Title>
            <Text type="secondary">
              チームのためのスペースを用意しましょう
            </Text>
          </div>

          <WorkspaceCreateForm />
        </div>
      </div>
    </div>
  )
}
