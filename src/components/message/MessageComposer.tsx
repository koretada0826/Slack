import { useState, useRef } from 'react'
import { Input, Popover } from 'antd'
import {
  SendOutlined, CaretDownOutlined,
  BoldOutlined, ItalicOutlined, UnderlineOutlined, StrikethroughOutlined,
  LinkOutlined, OrderedListOutlined, UnorderedListOutlined,
  CodeOutlined,
  SmileOutlined,
  FontSizeOutlined,
} from '@ant-design/icons'

const { TextArea } = Input

interface MessageComposerProps {
  placeholder?: string
  onSend: (body: string) => void | Promise<void>
  disabled?: boolean
}

const EMOJI_CATEGORIES = [
  { label: 'よく使う', emojis: ['👍', '❤️', '😂', '🎉', '🤔', '👀', '🙏', '🔥', '✅', '💯'] },
  { label: '顔', emojis: ['😀', '😃', '😄', '😁', '😆', '🥹', '😅', '🤣', '🥲', '😊', '😇', '🙂', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚'] },
  { label: 'ジェスチャー', emojis: ['👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '👏', '🙌', '🤝', '👊', '✊', '🤛', '🤜', '💪', '🙏', '👋', '🤚', '✋', '🖖'] },
  { label: 'ハート', emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '💕', '💞', '💓', '💗', '💖', '💘', '💝'] },
  { label: 'オブジェクト', emojis: ['🎉', '🎊', '🎁', '🏆', '🥇', '⭐', '🌟', '💡', '📌', '📎', '✏️', '📝', '📅', '🗓️', '🔔', '📣', '💬', '🚀', '⚡', '🎯'] },
]

const ToolbarButton = ({ icon, title, onClick }: { icon: React.ReactNode; title: string; onClick?: () => void }) => (
  <button
    title={title}
    onClick={onClick}
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

function EmojiPicker({ onSelect }: { onSelect: (emoji: string) => void }) {
  return (
    <div style={{ width: 280, maxHeight: 320, overflowY: 'auto' }}>
      {EMOJI_CATEGORIES.map((cat) => (
        <div key={cat.label}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-muted)', padding: '8px 4px 4px', textTransform: 'uppercase' }}>
            {cat.label}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {cat.emojis.map((emoji) => (
              <button
                key={emoji}
                onClick={() => onSelect(emoji)}
                style={{
                  width: 32, height: 32, fontSize: 18,
                  background: 'none', border: 'none', cursor: 'pointer',
                  borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#f0f0f0' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'none' }}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export function MessageComposer({ placeholder = 'メッセージを入力...', onSend, disabled }: MessageComposerProps) {
  const [value, setValue] = useState('')
  const [sending, setSending] = useState(false)
  const [emojiOpen, setEmojiOpen] = useState(false)
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

  function insertEmoji(emoji: string) {
    setValue((prev) => prev + emoji)
    setEmojiOpen(false)
    setTimeout(() => textAreaRef.current?.focus(), 0)
  }

  function insertAtMention() {
    setValue((prev) => prev + '@')
    setTimeout(() => textAreaRef.current?.focus(), 0)
  }

  function applyFormat(prefix: string, suffix: string) {
    const ta = textAreaRef.current
    if (!ta) return
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const selected = value.substring(start, end)
    const newValue = value.substring(0, start) + prefix + selected + suffix + value.substring(end)
    setValue(newValue)
    setTimeout(() => {
      ta.focus()
      ta.selectionStart = start + prefix.length
      ta.selectionEnd = end + prefix.length
    }, 0)
  }

  const hasText = value.trim().length > 0

  return (
    <div style={{ padding: '0 20px 20px', flexShrink: 0 }}>
      <div style={{ border: '1px solid #bbb', borderRadius: 'var(--radius-lg)', background: '#fff', overflow: 'hidden' }}>
        {/* Rich text toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '4px 8px', borderBottom: '1px solid var(--color-border-light)', gap: 0 }}>
          <ToolbarButton icon={<BoldOutlined />} title="太字" onClick={() => applyFormat('**', '**')} />
          <ToolbarButton icon={<ItalicOutlined />} title="斜体" onClick={() => applyFormat('_', '_')} />
          <ToolbarButton icon={<UnderlineOutlined />} title="下線" onClick={() => applyFormat('<u>', '</u>')} />
          <ToolbarButton icon={<StrikethroughOutlined />} title="取り消し線" onClick={() => applyFormat('~~', '~~')} />
          <div style={{ width: 1, height: 18, background: 'var(--color-border)', margin: '0 4px' }} />
          <ToolbarButton icon={<LinkOutlined />} title="リンク" onClick={() => applyFormat('[', '](url)')} />
          <ToolbarButton icon={<OrderedListOutlined />} title="番号付きリスト" onClick={() => applyFormat('1. ', '')} />
          <ToolbarButton icon={<UnorderedListOutlined />} title="箇条書きリスト" onClick={() => applyFormat('- ', '')} />
          <div style={{ width: 1, height: 18, background: 'var(--color-border)', margin: '0 4px' }} />
          <ToolbarButton icon={<CodeOutlined />} title="コード" onClick={() => applyFormat('`', '`')} />
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
            <ToolbarButton icon={<FontSizeOutlined />} title="書式" />
            <Popover
              content={<EmojiPicker onSelect={insertEmoji} />}
              trigger="click"
              open={emojiOpen}
              onOpenChange={setEmojiOpen}
              placement="topLeft"
            >
              <div>
                <ToolbarButton icon={<SmileOutlined />} title="絵文字" onClick={() => setEmojiOpen(!emojiOpen)} />
              </div>
            </Popover>
            <ToolbarButton icon={<span style={{ fontSize: 15, fontWeight: 700 }}>@</span>} title="メンション" onClick={() => insertAtMention()} />
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
