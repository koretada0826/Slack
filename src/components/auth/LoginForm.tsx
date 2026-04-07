import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { message } from 'antd'
import { loginWithEmail, signUpWithEmail } from '@/features/auth/api'
import { useAuthStore } from '@/store/authStore'
import { fetchProfile } from '@/features/profiles/api'

type TabKey = 'login' | 'signup'

const DEMO_EMAIL = 'demo@gmail.com'
const DEMO_PASSWORD = 'demo1234'

export function LoginForm() {
  const [activeTab, setActiveTab] = useState<TabKey>('login')
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const navigate = useNavigate()

  async function doLogin(em: string, pw: string) {
    const { session } = await loginWithEmail({ email: em, password: pw })
    if (session) {
      useAuthStore.getState().setSession(session)
      try {
        const profile = await fetchProfile(session.user.id)
        useAuthStore.getState().setProfile(profile)
      } catch { /* */ }
      useAuthStore.getState().setInitialized(true)
      navigate('/workspaces', { replace: true })
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) return
    setLoading(true)
    try {
      if (activeTab === 'login') {
        await doLogin(email, password)
      } else {
        if (!displayName) { message.error('表示名を入力してください'); setLoading(false); return }
        const { session } = await signUpWithEmail({ email, password, displayName })
        if (session) {
          useAuthStore.getState().setSession(session)
          try {
            const profile = await fetchProfile(session.user.id)
            useAuthStore.getState().setProfile(profile)
          } catch { /* */ }
          useAuthStore.getState().setInitialized(true)
          navigate('/workspaces', { replace: true })
        } else {
          message.success('アカウントを作成しました！')
        }
      }
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'ログインに失敗しました')
    } finally {
      setLoading(false)
    }
  }

  async function handleDemoLogin() {
    setLoading(true)
    try {
      await doLogin(DEMO_EMAIL, DEMO_PASSWORD)
    } catch {
      message.error('デモログインに失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    height: 48,
    padding: '0 16px',
    fontSize: 16,
    border: '1px solid #bababa',
    borderRadius: 4,
    outline: 'none',
    fontFamily: 'var(--font-sans)',
    background: '#fff',
    color: '#1d1c1d',
  }

  const buttonStyle: React.CSSProperties = {
    width: '100%',
    height: 48,
    borderRadius: 4,
    border: 'none',
    fontSize: 16,
    fontWeight: 700,
    cursor: loading ? 'wait' : 'pointer',
    fontFamily: 'var(--font-sans)',
    transition: 'background 0.15s',
  }

  return (
    <div>
      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e8e8e8', marginBottom: 24 }}>
        {[
          { key: 'login' as TabKey, label: 'ログイン' },
          { key: 'signup' as TabKey, label: '新規登録' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              flex: 1,
              padding: '12px 0',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab.key ? '2px solid #1d1c1d' : '2px solid transparent',
              color: activeTab === tab.key ? '#1d1c1d' : '#696969',
              fontSize: 16,
              fontWeight: activeTab === tab.key ? 700 : 400,
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {activeTab === 'signup' && (
          <input
            type="text"
            placeholder="表示名"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            style={inputStyle}
          />
        )}

        <input
          type="email"
          placeholder="名前@work-email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
          autoComplete="email"
        />

        <input
          type="password"
          placeholder="パスワード"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
          autoComplete={activeTab === 'login' ? 'current-password' : 'new-password'}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            ...buttonStyle,
            background: '#1d1c1d',
            color: '#fff',
            marginTop: 4,
          }}
        >
          {loading ? '処理中...' : activeTab === 'login' ? 'サインイン' : 'アカウント作成'}
        </button>

        {activeTab === 'login' && (
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            style={{
              ...buttonStyle,
              background: '#4a154b',
              color: '#fff',
            }}
          >
            デモアカウントでログイン
          </button>
        )}
      </form>
    </div>
  )
}
