import { useState, useEffect } from 'react'
import { Modal, Select, message } from 'antd'
import { supabase } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/authStore'
import { useWorkspaceStore } from '@/store/workspaceStore'
import { useUiStore } from '@/store/uiStore'
import { createConversation, findExistingDm } from '@/features/conversations/api'
import type { DbProfile } from '@/types/db'

interface StartDmModalProps {
  open: boolean
  onClose: () => void
  onCreated: () => void
}

export function StartDmModal({ open, onClose, onCreated }: StartDmModalProps) {
  const [members, setMembers] = useState<DbProfile[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { user } = useAuthStore()
  const { currentWorkspace } = useWorkspaceStore()
  const { setActiveChatTarget, setMobileDrawerOpen } = useUiStore()

  useEffect(() => {
    if (!open || !currentWorkspace) return

    async function loadMembers() {
      const { data } = await supabase
        .from('workspace_members')
        .select('user_id, profiles(*)')
        .eq('workspace_id', currentWorkspace!.id)

      if (data) {
        const profiles = data
          .map((d) => d.profiles as unknown as DbProfile)
          .filter((p): p is DbProfile => p !== null && p.id !== user?.id)
        setMembers(profiles)
      }
    }
    loadMembers()
  }, [open, currentWorkspace, user])

  async function handleOk() {
    if (!selectedUserId || !user || !currentWorkspace) return
    setLoading(true)
    try {
      // Check for existing DM
      const existing = await findExistingDm(
        currentWorkspace.id,
        user.id,
        selectedUserId
      )

      if (existing) {
        setActiveChatTarget({ type: 'conversation', id: existing.id })
      } else {
        const conv = await createConversation(user.id, {
          workspace_id: currentWorkspace.id,
          kind: 'dm',
          member_ids: [selectedUserId],
        })
        setActiveChatTarget({ type: 'conversation', id: conv.id })
        onCreated()
      }

      setMobileDrawerOpen(false)
      onClose()
      setSelectedUserId(null)
    } catch {
      message.error('会話の開始に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      title="ダイレクトメッセージを開始"
      open={open}
      onCancel={() => {
        onClose()
        setSelectedUserId(null)
      }}
      onOk={handleOk}
      confirmLoading={loading}
      okText="開始"
      okButtonProps={{ disabled: !selectedUserId }}
      destroyOnClose
    >
      <Select
        showSearch
        placeholder="チームメイトを検索"
        value={selectedUserId}
        onChange={setSelectedUserId}
        style={{ width: '100%' }}
        optionFilterProp="label"
        options={members.map((m) => ({
          label: m.display_name || m.email,
          value: m.id,
        }))}
      />
    </Modal>
  )
}
