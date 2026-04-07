import { useState } from 'react'
import { Drawer, Tabs, Form, Input, Button, Typography, Divider, message } from 'antd'
import { updateChannel } from '@/features/channels/api'
import { WorkspaceMemberList } from '@/components/workspace/WorkspaceMemberList'
import type { DbChannel } from '@/types/db'

const { Text } = Typography

interface ChannelSettingsDrawerProps {
  channel: DbChannel | null
  open: boolean
  onClose: () => void
  onUpdated: () => void
}

export function ChannelSettingsDrawer({
  channel,
  open,
  onClose,
  onUpdated,
}: ChannelSettingsDrawerProps) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  if (!channel) return null

  async function handleSave(values: { topic: string; description: string }) {
    if (!channel) return
    setLoading(true)
    try {
      await updateChannel(channel.id, {
        topic: values.topic?.trim() || undefined,
        description: values.description?.trim() || undefined,
      })
      message.success('チャンネルを更新しました')
      onUpdated()
    } catch {
      message.error('チャンネルの更新に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Drawer
      title={`# ${channel.name}`}
      open={open}
      onClose={onClose}
      width={380}
    >
      <Tabs
        items={[
          {
            key: 'about',
            label: '概要',
            children: (
              <div>
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleSave}
                  initialValues={{
                    topic: channel.topic ?? '',
                    description: channel.description ?? '',
                  }}
                  requiredMark={false}
                >
                  <Form.Item name="topic" label="トピック">
                    <Input placeholder="チャンネルのトピック" maxLength={250} />
                  </Form.Item>
                  <Form.Item name="description" label="説明">
                    <Input.TextArea rows={3} maxLength={500} />
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading}>
                      保存
                    </Button>
                  </Form.Item>
                </Form>

                <Divider />

                <Text type="secondary" style={{ fontSize: 12 }}>
                  Created {new Date(channel.created_at).toLocaleDateString()}
                </Text>
              </div>
            ),
          },
          {
            key: 'members',
            label: 'メンバー',
            children: <WorkspaceMemberList />,
          },
        ]}
      />
    </Drawer>
  )
}
