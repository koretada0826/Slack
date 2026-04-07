import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useWorkspaceStore } from '@/store/workspaceStore'
import { UserProfileCard } from '@/components/common/UserProfileCard'
import type { DbProfile } from '@/types/db'

interface MemberRow {
  user_id: string
  role: string
  profiles: DbProfile | null
}

export function WorkspaceMemberList() {
  const [members, setMembers] = useState<MemberRow[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<DbProfile | null>(null)
  const { currentWorkspace } = useWorkspaceStore()

  useEffect(() => {
    if (!currentWorkspace) return
    let mounted = true

    async function load() {
      const { data } = await supabase
        .from('workspace_members')
        .select('user_id, role, profiles(*)')
        .eq('workspace_id', currentWorkspace!.id)
        .order('joined_at')

      if (mounted && data) {
        setMembers(data as unknown as MemberRow[])
      }
      if (mounted) setLoading(false)
    }
    load()
    return () => { mounted = false }
  }, [currentWorkspace])

  if (loading) {
    return <div style={{ padding: 16, color: 'var(--color-text-muted)' }}>読み込み中...</div>
  }

  if (members.length === 0) {
    return <div style={{ padding: 16, color: 'var(--color-text-muted)' }}>メンバーがいません</div>
  }

  const AVATAR_COLORS = [
    '#e8485c', '#e06b2d', '#d4a72c', '#3eb991',
    '#2d9ee0', '#7c5bbf', '#e25996', '#4ec0c1',
  ]

  function getColor(name: string) {
    let hash = 0
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
  }

  const roleLabels: Record<string, string> = {
    owner: 'オーナー',
    admin: '管理者',
    member: 'メンバー',
    guest: 'ゲスト',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 8 }}>
        {members.length} メンバー
      </div>
      {members.map((m) => {
        const name = m.profiles?.display_name || m.profiles?.email || '不明'
        return (
          <div
            key={m.user_id}
            onClick={() => m.profiles && setSelectedUser(m.profiles)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '6px 8px', borderRadius: 6, cursor: 'pointer',
            }}
          >
            <div
              style={{
                width: 32, height: 32, borderRadius: 6,
                background: getColor(name), color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 14, flexShrink: 0,
              }}
            >
              {name.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {name}
              </div>
              {m.profiles?.status_message && (
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {m.profiles.status_message}
                </div>
              )}
            </div>
            <span style={{ fontSize: 11, color: 'var(--color-text-muted)', flexShrink: 0 }}>
              {roleLabels[m.role] ?? m.role}
            </span>
          </div>
        )
      })}
      <UserProfileCard user={selectedUser} open={!!selectedUser} onClose={() => setSelectedUser(null)} />
    </div>
  )
}
