import { useNavigate } from 'react-router-dom'
import { useMyWorkspaces } from '@/features/workspaces/hooks'
import { useWorkspaceStore } from '@/store/workspaceStore'
import { LoadingState } from '@/components/common/LoadingState'
import { ErrorState } from '@/components/common/ErrorState'
import { useAuthStore } from '@/store/authStore'
import { logout } from '@/features/auth/api'
import type { WorkspaceWithRole } from '@/types/entities'

export default function WorkspaceSelectPage() {
  const navigate = useNavigate()
  const { workspaces, loading, error, refresh } = useMyWorkspaces()
  const { setCurrentWorkspace } = useWorkspaceStore()
  const { profile } = useAuthStore()

  function handleSelect(ws: WorkspaceWithRole) {
    setCurrentWorkspace(ws)
    navigate(`/ws/${ws.slug}`)
  }

  async function handleLogout() {
    await logout()
    useAuthStore.getState().reset()
    navigate('/login', { replace: true })
  }

  if (loading) return <LoadingState fullScreen />
  if (error) return <ErrorState message={error} onRetry={refresh} />

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: '#fff' }}>
      {/* Top accent */}
      <div style={{ height: 4, background: '#611f69' }} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 16px 40px' }}>
        {/* Logo */}
        <div style={{ marginBottom: 40, display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="40" height="40" viewBox="0 0 54 54" fill="none">
            <path d="M13.3 33.3a4.8 4.8 0 0 1-4.8 4.8 4.8 4.8 0 0 1-4.8-4.8 4.8 4.8 0 0 1 4.8-4.8h4.8v4.8z" fill="#E01E5A"/>
            <path d="M15.7 33.3a4.8 4.8 0 0 1 4.8-4.8 4.8 4.8 0 0 1 4.8 4.8v12a4.8 4.8 0 0 1-4.8 4.8 4.8 4.8 0 0 1-4.8-4.8v-12z" fill="#E01E5A"/>
            <path d="M20.5 13.3a4.8 4.8 0 0 1-4.8-4.8A4.8 4.8 0 0 1 20.5 3.7a4.8 4.8 0 0 1 4.8 4.8v4.8h-4.8z" fill="#36C5F0"/>
            <path d="M20.5 15.7a4.8 4.8 0 0 1 4.8 4.8 4.8 4.8 0 0 1-4.8 4.8H8.5a4.8 4.8 0 0 1-4.8-4.8 4.8 4.8 0 0 1 4.8-4.8h12z" fill="#36C5F0"/>
            <path d="M40.5 20.5a4.8 4.8 0 0 1 4.8-4.8 4.8 4.8 0 0 1 4.8 4.8 4.8 4.8 0 0 1-4.8 4.8h-4.8v-4.8z" fill="#2EB67D"/>
            <path d="M38.1 20.5a4.8 4.8 0 0 1-4.8 4.8 4.8 4.8 0 0 1-4.8-4.8V8.5a4.8 4.8 0 0 1 4.8-4.8 4.8 4.8 0 0 1 4.8 4.8v12z" fill="#2EB67D"/>
            <path d="M33.3 40.5a4.8 4.8 0 0 1 4.8 4.8 4.8 4.8 0 0 1-4.8 4.8 4.8 4.8 0 0 1-4.8-4.8v-4.8h4.8z" fill="#ECB22E"/>
            <path d="M33.3 38.1a4.8 4.8 0 0 1-4.8-4.8 4.8 4.8 0 0 1 4.8-4.8h12a4.8 4.8 0 0 1 4.8 4.8 4.8 4.8 0 0 1-4.8 4.8h-12z" fill="#ECB22E"/>
          </svg>
          <span style={{ fontSize: 32, fontWeight: 900, color: '#1d1c1d', letterSpacing: '-1px' }}>slack</span>
        </div>

        {/* Heading */}
        <h1 style={{ fontSize: 36, fontWeight: 900, color: '#1d1c1d', textAlign: 'center', marginBottom: 8 }}>
          ようこそ{profile ? `、${profile.display_name}さん` : ''}
        </h1>
        <p style={{ fontSize: 16, color: '#616061', textAlign: 'center', marginBottom: 40 }}>
          以下のワークスペースに参加するか、新しいワークスペースを作成してください。
        </p>

        {/* Workspace list */}
        <div style={{ width: '100%', maxWidth: 500 }}>
          {workspaces.map((ws) => (
            <button
              key={ws.id}
              onClick={() => handleSelect(ws)}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                width: '100%', padding: '16px 20px',
                background: '#fff', border: '1px solid #e8e8e8',
                borderRadius: 8, cursor: 'pointer', marginBottom: 8,
                textAlign: 'left', fontFamily: 'var(--font-sans)',
                transition: 'box-shadow 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)')}
              onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
            >
              {/* Workspace icon */}
              <div
                style={{
                  width: 44, height: 44, borderRadius: 8,
                  background: '#611f69', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 900, fontSize: 20, flexShrink: 0,
                }}
              >
                {ws.name.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 16, color: '#1d1c1d' }}>{ws.name}</div>
                {ws.description && (
                  <div style={{ fontSize: 13, color: '#616061', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {ws.description}
                  </div>
                )}
              </div>
              <div style={{ fontSize: 13, color: '#616061', flexShrink: 0 }}>
                {ws.role === 'owner' ? 'オーナー' : ws.role === 'admin' ? '管理者' : 'メンバー'}
              </div>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                <path d="M6 4l4 4-4 4" stroke="#616061" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          ))}

          {/* Create new workspace */}
          <button
            onClick={() => navigate('/workspaces/new')}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              width: '100%', padding: '16px 20px',
              background: '#fff', border: '1px dashed #bababa',
              borderRadius: 8, cursor: 'pointer', marginBottom: 8,
              fontSize: 16, fontWeight: 600, color: '#611f69',
              fontFamily: 'var(--font-sans)', transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#f9f0fa')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#fff')}
          >
            + 新しいワークスペースを作成する
          </button>

          {/* Logout */}
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <button
              onClick={handleLogout}
              style={{
                background: 'none', border: 'none', color: '#1264a3',
                fontSize: 15, cursor: 'pointer', fontFamily: 'var(--font-sans)',
              }}
            >
              別のアカウントでサインイン
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: '20px 0', display: 'flex', justifyContent: 'center', gap: 28, fontSize: 13, color: '#696969' }}>
        <span style={{ cursor: 'pointer' }}>プライバシーと利用規約</span>
        <span style={{ cursor: 'pointer' }}>お問い合わせ</span>
        <span style={{ cursor: 'pointer' }}>🌐 地域を変更</span>
      </div>
    </div>
  )
}
