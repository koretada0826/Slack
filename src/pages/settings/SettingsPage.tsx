import { useNavigate } from 'react-router-dom'
import { Typography, Button, Form, Input, Divider, message } from 'antd'
import { ArrowLeftOutlined, LogoutOutlined } from '@ant-design/icons'
import { useAuthStore } from '@/store/authStore'
import { useUpdateProfile } from '@/features/profiles/hooks'
import { logout } from '@/features/auth/api'
import { AppAvatar } from '@/components/common/AppAvatar'

const { Title, Text } = Typography

export default function SettingsPage() {
  const navigate = useNavigate()
  const { profile } = useAuthStore()
  const { update, loading } = useUpdateProfile()
  const [form] = Form.useForm()

  async function handleSave(values: {
    display_name: string
    status_message: string
  }) {
    try {
      await update({
        display_name: values.display_name.trim(),
        status_message: values.status_message?.trim() || null,
      })
      message.success('プロフィールを更新しました')
    } catch {
      message.error('プロフィールの更新に失敗しました')
    }
  }

  async function handleLogout() {
    await logout()
    useAuthStore.getState().reset()
    navigate('/login', { replace: true })
  }

  return (
    <div
      style={{
        maxWidth: 520,
        margin: '0 auto',
        minHeight: '100dvh',
        background: 'var(--color-bg)',
        padding: 16,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
        <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} />
        <Title level={4} style={{ margin: 0 }}>
          設定
        </Title>
      </div>

      {/* Profile section */}
      <div style={{ marginBottom: 32 }}>
        <Text
          type="secondary"
          style={{
            fontSize: 12,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            display: 'block',
            marginBottom: 16,
          }}
        >
          プロフィール
        </Text>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <AppAvatar
            name={profile?.display_name}
            src={profile?.avatar_url ?? undefined}
            size={64}
          />
          <div>
            <Text strong style={{ fontSize: 16, display: 'block' }}>
              {profile?.display_name}
            </Text>
            <Text type="secondary">{profile?.email}</Text>
          </div>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          initialValues={{
            display_name: profile?.display_name ?? '',
            status_message: profile?.status_message ?? '',
          }}
          requiredMark={false}
        >
          <Form.Item
            name="display_name"
            label="表示名"
            rules={[{ required: true, message: '名前は必須です' }]}
          >
            <Input maxLength={50} />
          </Form.Item>

          <Form.Item name="status_message" label="ステータス">
            <Input placeholder="今何をしていますか？" maxLength={100} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              変更を保存
            </Button>
          </Form.Item>
        </Form>
      </div>

      <Divider />

      {/* Account section */}
      <div>
        <Text
          type="secondary"
          style={{
            fontSize: 12,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            display: 'block',
            marginBottom: 16,
          }}
        >
          アカウント
        </Text>
        <Button
          danger
          icon={<LogoutOutlined />}
          onClick={handleLogout}
        >
          ログアウト
        </Button>
      </div>
    </div>
  )
}
