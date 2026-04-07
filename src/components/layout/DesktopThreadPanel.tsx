import { useThreadStore } from '@/store/threadStore'
import { ThreadPanel } from '@/components/thread/ThreadPanel'

export function DesktopThreadPanel() {
  const { activeThreadMessageId, closeThread } = useThreadStore()

  if (!activeThreadMessageId) return null

  return <ThreadPanel onClose={closeThread} />
}
