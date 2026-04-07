import { useState } from 'react'
import { Form, Input, Button, message } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { createWorkspace, createDefaultChannel } from '@/features/workspaces/api'

interface FormValues {
  name: string
  slug: string
  description: string
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function WorkspaceCreateForm() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const name = e.target.value
    const currentSlug = form.getFieldValue('slug') as string
    // Auto-generate slug only if user hasn't manually edited it
    if (!currentSlug || currentSlug === slugify(form.getFieldValue('name') || '')) {
      form.setFieldsValue({ slug: slugify(name) })
    }
  }

  async function handleFinish(values: FormValues) {
    if (!user) return
    setLoading(true)
    try {
      const ws = await createWorkspace(user.id, {
        name: values.name.trim(),
        slug: values.slug.trim(),
        description: values.description?.trim(),
      })
      await createDefaultChannel(ws.id, user.id)
      message.success('ワークスペースを作成しました！')
      navigate(`/ws/${ws.slug}`, { replace: true })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'ワークスペースの作成に失敗しました'
      if (msg.includes('duplicate') || msg.includes('unique')) {
        message.error('このURLスラッグは既に使われています')
      } else {
        message.error(msg)
      }
    } finally {
      setLoading(false)
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
        name="name"
        label="ワークスペース名"
        rules={[{ required: true, message: '名前を入力してください' }]}
      >
        <Input
          placeholder="My Team"
          size="large"
          maxLength={50}
          onChange={handleNameChange}
        />
      </Form.Item>

      <Form.Item
        name="slug"
        label="URLスラッグ"
        rules={[
          { required: true, message: 'URLスラッグを入力してください' },
          {
            pattern: /^[a-z0-9][a-z0-9-]*[a-z0-9]$/,
            message: '小文字、数字、ハイフンのみ使用できます',
          },
        ]}
        extra="ワークスペースのURLに使用されます"
      >
        <Input placeholder="my-team" size="large" maxLength={40} />
      </Form.Item>

      <Form.Item name="description" label="説明（任意）">
        <Input.TextArea
          placeholder="このワークスペースの目的は？"
          rows={3}
          maxLength={200}
        />
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
          ワークスペースを作成
        </Button>
      </Form.Item>
    </Form>
  )
}
