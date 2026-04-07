import { useState } from 'react'
import { Modal, Form, Input, Radio, message } from 'antd'
import { useAuthStore } from '@/store/authStore'
import { useWorkspaceStore } from '@/store/workspaceStore'
import { createChannel } from '@/features/channels/api'
import type { ChannelVisibility } from '@/types/db'

interface ChannelCreateModalProps {
  open: boolean
  onClose: () => void
  onCreated: () => void
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function ChannelCreateModal({
  open,
  onClose,
  onCreated,
}: ChannelCreateModalProps) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const { user } = useAuthStore()
  const { currentWorkspace } = useWorkspaceStore()

  async function handleFinish(values: {
    name: string
    description: string
    visibility: ChannelVisibility
  }) {
    if (!user || !currentWorkspace) return
    setLoading(true)
    try {
      await createChannel(user.id, {
        workspace_id: currentWorkspace.id,
        name: values.name.trim(),
        slug: slugify(values.name),
        description: values.description?.trim(),
        visibility: values.visibility,
      })
      message.success('チャンネルを作成しました')
      form.resetFields()
      onCreated()
      onClose()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'チャンネルの作成に失敗しました'
      if (msg.includes('duplicate') || msg.includes('unique')) {
        message.error('この名前のチャンネルは既に存在します')
      } else {
        message.error(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      title="チャンネルを作成"
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      confirmLoading={loading}
      okText="作成"
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{ visibility: 'public' }}
        requiredMark={false}
      >
        <Form.Item
          name="name"
          label="名前"
          rules={[{ required: true, message: 'チャンネル名を入力' }]}
        >
          <Input placeholder="e.g. design-reviews" maxLength={80} />
        </Form.Item>

        <Form.Item name="description" label="説明（任意）">
          <Input.TextArea rows={2} maxLength={200} />
        </Form.Item>

        <Form.Item name="visibility" label="公開設定">
          <Radio.Group>
            <Radio value="public">パブリック — ワークスペースの全員が参加可能</Radio>
            <Radio value="private">プライベート — 招待制</Radio>
          </Radio.Group>
        </Form.Item>
      </Form>
    </Modal>
  )
}
