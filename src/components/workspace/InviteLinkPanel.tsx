import { useState } from 'react'
import { Button, Input, Typography, message, Space } from 'antd'
import { CopyOutlined, PlusOutlined } from '@ant-design/icons'
import { supabase } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/authStore'
import { useWorkspaceStore } from '@/store/workspaceStore'

const { Text } = Typography

export function InviteLinkPanel() {
  const [inviteUrl, setInviteUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { user } = useAuthStore()
  const { currentWorkspace } = useWorkspaceStore()

  async function handleGenerate() {
    if (!user || !currentWorkspace) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('invites')
        .insert({
          workspace_id: currentWorkspace.id,
          role: 'member',
          invited_by: user.id,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .select('token')
        .single()

      if (error) throw error

      const url = `${window.location.origin}/invite/${data.token}`
      setInviteUrl(url)
    } catch {
      message.error('招待リンクの生成に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  function handleCopy() {
    if (!inviteUrl) return
    navigator.clipboard.writeText(inviteUrl)
    message.success('リンクをコピーしました！')
  }

  return (
    <div>
      <Text
        type="secondary"
        style={{
          fontSize: 12,
          fontWeight: 600,
          textTransform: 'uppercase',
          display: 'block',
          marginBottom: 12,
        }}
      >
        招待リンク
      </Text>

      {inviteUrl ? (
        <Space.Compact style={{ width: '100%' }}>
          <Input value={inviteUrl} readOnly />
          <Button icon={<CopyOutlined />} onClick={handleCopy}>
            コピー
          </Button>
        </Space.Compact>
      ) : (
        <Button
          icon={<PlusOutlined />}
          onClick={handleGenerate}
          loading={loading}
        >
          招待リンクを生成
        </Button>
      )}

      <Text
        type="secondary"
        style={{ fontSize: 12, display: 'block', marginTop: 8 }}
      >
        リンクは7日間有効です
      </Text>
    </div>
  )
}
