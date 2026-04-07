import { MessageComposer } from '@/components/message/MessageComposer'

interface ThreadComposerProps {
  onSend: (body: string) => void | Promise<void>
}

export function ThreadComposer({ onSend }: ThreadComposerProps) {
  return <MessageComposer placeholder="返信を入力..." onSend={onSend} />
}
