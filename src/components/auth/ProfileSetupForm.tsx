import { Form, Input, Button, message } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useUpdateProfile } from '@/features/profiles/hooks'

interface FormValues {
  display_name: string
  status_message: string
}

export function ProfileSetupForm() {
  const navigate = useNavigate()
  const { update, loading } = useUpdateProfile()
  const [form] = Form.useForm()

  async function handleFinish(values: FormValues) {
    try {
      await update({
        display_name: values.display_name.trim(),
        status_message: values.status_message?.trim() || null,
      })
      message.success('プロフィールを更新しました')
      navigate('/workspaces', { replace: true })
    } catch {
      message.error('プロフィールの更新に失敗しました')
    }
  }

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      requiredMark={false}
      style={{ maxWidth: 400 }}
    >
      <Form.Item
        name="display_name"
        label="表示名"
        rules={[{ required: true, message: 'お名前を入力してください' }]}
      >
        <Input placeholder="お名前" size="large" maxLength={50} />
      </Form.Item>

      <Form.Item name="status_message" label="ステータス（任意）">
        <Input placeholder="今何をしていますか？" size="large" maxLength={100} />
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          size="large"
          block
          loading={loading}
          style={{ height: 44 }}
        >
          続ける
        </Button>
      </Form.Item>
    </Form>
  )
}
