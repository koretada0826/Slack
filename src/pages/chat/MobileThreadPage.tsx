import { useParams, useNavigate } from 'react-router-dom'
import { ThreadPanel } from '@/components/thread/ThreadPanel'

export default function MobileThreadPage() {
  const { workspaceSlug, messageId } = useParams<{
    workspaceSlug: string
    messageId: string
  }>()
  const navigate = useNavigate()

  if (!workspaceSlug || !messageId) {
    return (
      <div
        style={{
          height: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 12,
          color: 'var(--color-text-muted)',
        }}
      >
        <p>スレッドが見つかりませんでした。</p>
        <button
          onClick={() => navigate(workspaceSlug ? `/ws/${workspaceSlug}` : '/')}
          style={{
            padding: '8px 16px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-border)',
            background: 'var(--color-bg)',
            cursor: 'pointer',
            color: 'var(--color-text)',
          }}
        >
          戻る
        </button>
      </div>
    )
  }

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <ThreadPanel
        isMobile
        messageId={messageId}
        onClose={() => navigate(`/ws/${workspaceSlug}`)}
      />
    </div>
  )
}
