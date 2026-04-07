import { useState, useRef, useEffect } from 'react'
import { Button, Input } from 'antd'

const { TextArea } = Input

interface MessageEditorProps {
  initialBody: string
  onSave: (newBody: string) => void
  onCancel: () => void
  loading?: boolean
}

export function MessageEditor({
  initialBody,
  onSave,
  onCancel,
  loading,
}: MessageEditorProps) {
  const [value, setValue] = useState(initialBody)
  const textAreaRef = useRef<ReturnType<typeof TextArea> | null>(null)

  useEffect(() => {
    // Focus on mount
    const el = document.querySelector('.message-editor-textarea textarea') as HTMLTextAreaElement | null
    el?.focus()
    if (el) {
      el.selectionStart = el.value.length
    }
  }, [])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (value.trim()) onSave(value.trim())
    }
    if (e.key === 'Escape') {
      onCancel()
    }
  }

  return (
    <div style={{ padding: '4px 0' }}>
      <TextArea
        ref={textAreaRef}
        className="message-editor-textarea"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        autoSize={{ minRows: 1, maxRows: 8 }}
        style={{
          borderRadius: 'var(--radius-md)',
        }}
      />
      <div
        style={{
          display: 'flex',
          gap: 8,
          marginTop: 4,
          justifyContent: 'flex-end',
        }}
      >
        <Button size="small" onClick={onCancel}>
          キャンセル
        </Button>
        <Button
          size="small"
          type="primary"
          onClick={() => value.trim() && onSave(value.trim())}
          loading={loading}
          disabled={!value.trim() || value.trim() === initialBody}
        >
          保存
        </Button>
      </div>
    </div>
  )
}
