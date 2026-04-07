import { useState, useRef } from 'react'
import { Input } from 'antd'
import {
  PlusOutlined, SendOutlined, CaretDownOutlined,
  BoldOutlined, ItalicOutlined, UnderlineOutlined, StrikethroughOutlined,
  LinkOutlined, OrderedListOutlined, UnorderedListOutlined,
  CodeOutlined,
  SmileOutlined,
  FontSizeOutlined,
  VideoCameraOutlined,
  AudioOutlined,
} from '@ant-design/icons'

const { TextArea } = Input

interface MessageComposerProps {
  placeholder?: string
  onSend: (body: string) => void | Promise<void>
  disabled?: boolean
}

const ToolbarButton = ({ icon, title }: { icon: React.ReactNode; title: string }) => (
  <button
    title={title}
    style={{
      width: 28, height: 28, borderRadius: 'var(--radius-sm)',
      background: 'none', border: 'none',
      color: 'var(--color-text-muted)', cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 15,
    }}
    onMouseEnter={(e) => { e.currentTarget.style.background = '#f0f0f0'; e.currentTarget.style.color = 'var(--color-text)' }}
    onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--color-text-muted)' }}
  >
    {icon}
  </button>
)

export function MessageComposer({ placeholder = 'メッセージを入力...', onSend, disabled }: MessageComposerProps) {
  const [value, setValue] = useState('')
  const [sending, setSending] = useState(false)
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null)

  async function handleSend() {
    const trimmed = value.trim()
    if (!trimmed || sending) return
    setSending(true)
    try { await onSend(trimmed); setValue(''); setTimeout(() => textAreaRef.current?.focus(), 0) }
    catch { /* upstream */ }
    finally { setSending(false) }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const hasText = value.trim().length > 0

  return (
    <div style={{ padding: '0 20px 20px', flexShrink: 0 }}>
      <div style={{ border: '1px solid #bbb', borderRadius: 'var(--radius-lg)', background: '#fff', overflow: 'hidden' }}>
        {/* Rich text toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '4px 8px', borderBottom: '1px solid var(--color-border-light)', gap: 0 }}>
          <ToolbarButton icon={<BoldOutlined />} title="太字" />
          <ToolbarButton icon={<ItalicOutlined />} title="斜体" />
          <ToolbarButton icon={<UnderlineOutlined />} title="下線" />
          <ToolbarButton icon={<StrikethroughOutlined />} title="取り消し線" />
          <div style={{ width: 1, height: 18, background: 'var(--color-border)', margin: '0 4px' }} />
          <ToolbarButton icon={<LinkOutlined />} title="リンク" />
          <ToolbarButton icon={<OrderedListOutlined />} title="番号付きリスト" />
          <ToolbarButton icon={<UnorderedListOutlined />} title="箇条書きリスト" />
          <div style={{ width: 1, height: 18, background: 'var(--color-border)', margin: '0 4px' }} />
          <ToolbarButton icon={<CodeOutlined />} title="コード" />
        </div>

        {/* Text input */}
        <TextArea
          ref={(el) => { textAreaRef.current = el?.resizableTextArea?.textArea ?? null }}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoSize={{ minRows: 2, maxRows: 10 }}
          variant="borderless"
          disabled={disabled}
          style={{
            padding: '8px 14px', resize: 'none',
            fontSize: 'var(--font-size-base)', lineHeight: 1.46668,
            fontFamily: 'var(--font-sans)',
          }}
        />

        {/* Bottom toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 8px', borderTop: '1px solid var(--color-border-light)' }}>
          <div style={{ display: 'flex', gap: 0 }}>
            <ToolbarButton icon={<PlusOutlined />} title="添付" />
            <ToolbarButton icon={<FontSizeOutlined />} title="書式" />
            <ToolbarButton icon={<SmileOutlined />} title="絵文字" />
            <ToolbarButton icon={<span style={{ fontSize: 15, fontWeight: 700 }}>@</span>} title="メンション" />
            <ToolbarButton icon={<VideoCameraOutlined />} title="ビデオクリップ" />
            <ToolbarButton icon={<AudioOutlined />} title="音声" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <button
              onClick={handleSend}
              disabled={!hasText || disabled || sending}
              style={{
                width: 32, height: 28,
                borderRadius: 'var(--radius-sm) 0 0 var(--radius-sm)',
                background: hasText ? '#007a5a' : '#ddd',
                border: 'none',
                color: hasText ? '#fff' : '#999',
                cursor: hasText ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, transition: 'all 0.1s',
              }}
            >
              <SendOutlined />
            </button>
            <button
              style={{
                width: 20, height: 28,
                borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
                background: hasText ? '#005e45' : '#ccc',
                border: 'none', borderLeft: '1px solid rgba(255,255,255,0.3)',
                color: hasText ? '#fff' : '#999',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10,
              }}
            >
              <CaretDownOutlined />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
