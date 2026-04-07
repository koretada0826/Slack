import type { DbChannel } from '@/types/db'

interface ChannelWelcomeProps {
  channel: DbChannel
}

const cards = [
  {
    title: '社内ハンドブックを追加する',
    subtitle: 'canvas テンプレート',
    bg: '#1a5e4b',
    content: (
      <div style={{ background: '#fff', borderRadius: 6, padding: '10px 12px', fontSize: 12, marginTop: 8 }}>
        <div style={{ fontWeight: 700, marginBottom: 6 }}>オンボーディング</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 10 }}>👥</span> チーム
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 10 }}>✅</span> やることリスト
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 10 }}>📁</span> リソース
          </div>
        </div>
      </div>
    ),
  },
  {
    title: '歓迎メッセージをパーソナライズする',
    subtitle: '短い動画クリップを録画する',
    bg: '#d4507a',
    content: (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>
          🎬
        </div>
      </div>
    ),
  },
  {
    title: 'チームのメンバーを招待する',
    subtitle: 'チーム全員を追加する',
    bg: '#5c3a2e',
    content: (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center', marginTop: 12 }}>
        {['👨‍💼', '👩‍💻', '👨‍🎓', '👩‍🎨'].map((emoji, i) => (
          <div key={i} style={{ width: 48, height: 48, borderRadius: 8, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
            {emoji}
          </div>
        ))}
      </div>
    ),
  },
]

export function ChannelWelcome({ channel }: ChannelWelcomeProps) {
  return (
    <div style={{ padding: '32px 20px 16px' }}>
      {/* Welcome heading */}
      <h2 style={{ fontSize: 28, fontWeight: 900, color: 'var(--color-text)', marginBottom: 8, lineHeight: 1.3 }}>
        全員がここ <span style={{ opacity: 0.6 }}>#</span> {channel.name} にいます
      </h2>
      <p style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-text-secondary)', marginBottom: 24, lineHeight: 1.5 }}>
        {channel.description || `このチャンネルはワークスペースの全員が参加しています。ニュース、イベント、最新情報を共有しましょう。`} ⭐
      </p>

      {/* Getting started cards */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, overflowX: 'auto' }}>
        {cards.map((card, i) => (
          <div
            key={i}
            style={{
              minWidth: 180,
              maxWidth: 200,
              borderRadius: 12,
              background: card.bg,
              padding: 16,
              color: '#fff',
              cursor: 'pointer',
              flex: '1 1 0',
              transition: 'transform 0.1s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
          >
            <div style={{ fontWeight: 700, fontSize: 'var(--font-size-base)', marginBottom: 2 }}>
              {card.title}
            </div>
            <div style={{ fontSize: 'var(--font-size-xs)', opacity: 0.8 }}>
              {card.subtitle}
            </div>
            {card.content}
          </div>
        ))}
      </div>
    </div>
  )
}
