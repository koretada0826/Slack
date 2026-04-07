import { useParams, useNavigate } from 'react-router-dom'
import { ThreadPanel } from '@/components/thread/ThreadPanel'

export default function MobileThreadPage() {
  const { workspaceSlug, messageId } = useParams<{
    workspaceSlug: string
    messageId: string
  }>()
  const navigate = useNavigate()

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
