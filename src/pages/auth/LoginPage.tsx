import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { message } from 'antd'
import { useAuthStore } from '@/store/authStore'
import { loginWithEmail, signUpWithEmail } from '@/features/auth/api'
import { fetchProfile } from '@/features/profiles/api'
import { GoogleOutlined, AppleOutlined } from '@ant-design/icons'

const DEMO_EMAIL = 'demo@gmail.com'
const DEMO_PASSWORD = 'demo1234'

export default function LoginPage() {
  const { session } = useAuthStore()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'email' | 'password' | 'signup'>('email')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')

  if (session) {
    return <Navigate to="/workspaces" replace />
  }

  async function doLogin(em: string, pw: string) {
    const { session: s } = await loginWithEmail({ email: em, password: pw })
    if (s) {
      useAuthStore.getState().setSession(s)
      try { const p = await fetchProfile(s.user.id); useAuthStore.getState().setProfile(p) } catch {}
      useAuthStore.getState().setInitialized(true)
      navigate('/workspaces', { replace: true })
    }
  }

  async function handleEmailContinue(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setStep('password')
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!password) return
    setLoading(true)
    try {
      await doLogin(email, password)
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'ログインに失敗しました')
    } finally { setLoading(false) }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password || !displayName) return
    setLoading(true)
    try {
      const { session: s } = await signUpWithEmail({ email, password, displayName })
      if (s) {
        useAuthStore.getState().setSession(s)
        try { const p = await fetchProfile(s.user.id); useAuthStore.getState().setProfile(p) } catch {}
        useAuthStore.getState().setInitialized(true)
        navigate('/workspaces', { replace: true })
      }
    } catch (err) {
      message.error(err instanceof Error ? err.message : '登録に失敗しました')
    } finally { setLoading(false) }
  }

  async function handleDemo() {
    setLoading(true)
    try { await doLogin(DEMO_EMAIL, DEMO_PASSWORD) }
    catch { message.error('デモログインに失敗しました') }
    finally { setLoading(false) }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', height: 52, padding: '0 16px', fontSize: 18,
    border: '1px solid #bababa', borderRadius: 8, outline: 'none',
    fontFamily: 'var(--font-sans)', background: '#fff', color: '#1d1c1d',
  }
  const primaryBtn: React.CSSProperties = {
    width: '100%', height: 52, borderRadius: 8, border: 'none',
    fontSize: 18, fontWeight: 700, cursor: 'pointer', color: '#fff',
    background: '#611f69', fontFamily: 'var(--font-sans)',
  }
  const oauthBtn: React.CSSProperties = {
    flex: 1, height: 52, borderRadius: 8, border: '1px solid #bababa',
    background: '#fff', cursor: 'pointer', display: 'flex',
    alignItems: 'center', justifyContent: 'center', gap: 8,
    fontSize: 16, fontWeight: 600, color: '#1d1c1d', fontFamily: 'var(--font-sans)',
  }

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: '#fff' }}>
      <div style={{ height: 4, background: '#611f69' }} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
        {/* Logo */}
        <div style={{ marginBottom: 32, display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="50" height="50" viewBox="0 0 54 54" fill="none">
            <path d="M13.3 33.3a4.8 4.8 0 0 1-4.8 4.8 4.8 4.8 0 0 1-4.8-4.8 4.8 4.8 0 0 1 4.8-4.8h4.8v4.8z" fill="#E01E5A"/>
            <path d="M15.7 33.3a4.8 4.8 0 0 1 4.8-4.8 4.8 4.8 0 0 1 4.8 4.8v12a4.8 4.8 0 0 1-4.8 4.8 4.8 4.8 0 0 1-4.8-4.8v-12z" fill="#E01E5A"/>
            <path d="M20.5 13.3a4.8 4.8 0 0 1-4.8-4.8A4.8 4.8 0 0 1 20.5 3.7a4.8 4.8 0 0 1 4.8 4.8v4.8h-4.8z" fill="#36C5F0"/>
            <path d="M20.5 15.7a4.8 4.8 0 0 1 4.8 4.8 4.8 4.8 0 0 1-4.8 4.8H8.5a4.8 4.8 0 0 1-4.8-4.8 4.8 4.8 0 0 1 4.8-4.8h12z" fill="#36C5F0"/>
            <path d="M40.5 20.5a4.8 4.8 0 0 1 4.8-4.8 4.8 4.8 0 0 1 4.8 4.8 4.8 4.8 0 0 1-4.8 4.8h-4.8v-4.8z" fill="#2EB67D"/>
            <path d="M38.1 20.5a4.8 4.8 0 0 1-4.8 4.8 4.8 4.8 0 0 1-4.8-4.8V8.5a4.8 4.8 0 0 1 4.8-4.8 4.8 4.8 0 0 1 4.8 4.8v12z" fill="#2EB67D"/>
            <path d="M33.3 40.5a4.8 4.8 0 0 1 4.8 4.8 4.8 4.8 0 0 1-4.8 4.8 4.8 4.8 0 0 1-4.8-4.8v-4.8h4.8z" fill="#ECB22E"/>
            <path d="M33.3 38.1a4.8 4.8 0 0 1-4.8-4.8 4.8 4.8 0 0 1 4.8-4.8h12a4.8 4.8 0 0 1 4.8 4.8 4.8 4.8 0 0 1-4.8 4.8h-12z" fill="#ECB22E"/>
          </svg>
          <span style={{ fontSize: 38, fontWeight: 900, color: '#1d1c1d', letterSpacing: '-1px' }}>slack</span>
        </div>

        {/* Step: Email */}
        {step === 'email' && (
          <>
            <h1 style={{ fontSize: 40, fontWeight: 900, color: '#1d1c1d', textAlign: 'center', marginBottom: 12, lineHeight: 1.2, maxWidth: 500 }}>
              最初にメールアドレスを入力してください
            </h1>
            <p style={{ fontSize: 16, color: '#616061', textAlign: 'center', marginBottom: 32 }}>
              仕事用の<strong>メールアドレス</strong>を使うことをおすすめします。
            </p>

            <div style={{ width: '100%', maxWidth: 440 }}>
              <form onSubmit={handleEmailContinue} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <input
                  type="email" placeholder="名前@work-email.com" value={email}
                  onChange={(e) => setEmail(e.target.value)} style={inputStyle}
                  autoComplete="email" autoFocus
                />
                <button type="submit" style={primaryBtn}>続行する</button>
              </form>

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '24px 0' }}>
                <div style={{ flex: 1, height: 1, background: '#ddd' }} />
                <span style={{ fontSize: 14, color: '#696969', whiteSpace: 'nowrap' }}>その他のオプション</span>
                <div style={{ flex: 1, height: 1, background: '#ddd' }} />
              </div>

              {/* OAuth buttons */}
              <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
                <button style={oauthBtn}>
                  <GoogleOutlined style={{ fontSize: 20, color: '#4285f4' }} /> Google
                </button>
                <button style={oauthBtn}>
                  <AppleOutlined style={{ fontSize: 20 }} /> Apple
                </button>
              </div>

              {/* Demo login */}
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <p style={{ fontSize: 15, color: '#696969', marginBottom: 4 }}>すでにアカウントをお持ちですか？</p>
                <button
                  onClick={handleDemo}
                  disabled={loading}
                  style={{ background: 'none', border: 'none', color: '#1264a3', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}
                >
                  デモアカウントでサインイン
                </button>
              </div>
            </div>
          </>
        )}

        {/* Step: Password */}
        {step === 'password' && (
          <>
            <h1 style={{ fontSize: 40, fontWeight: 900, color: '#1d1c1d', textAlign: 'center', marginBottom: 12, lineHeight: 1.2 }}>
              パスワードを入力
            </h1>
            <p style={{ fontSize: 16, color: '#616061', textAlign: 'center', marginBottom: 32 }}>
              {email} でサインイン
            </p>

            <div style={{ width: '100%', maxWidth: 440 }}>
              <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <input
                  type="password" placeholder="パスワード" value={password}
                  onChange={(e) => setPassword(e.target.value)} style={inputStyle}
                  autoComplete="current-password" autoFocus
                />
                <button type="submit" disabled={loading} style={primaryBtn}>
                  {loading ? '処理中...' : 'サインイン'}
                </button>
              </form>

              <div style={{ textAlign: 'center', marginTop: 20 }}>
                <button
                  onClick={() => setStep('signup')}
                  style={{ background: 'none', border: 'none', color: '#1264a3', fontSize: 15, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}
                >
                  アカウントをお持ちでない方は新規登録
                </button>
                <span style={{ margin: '0 8px', color: '#ccc' }}>|</span>
                <button
                  onClick={() => { setStep('email'); setPassword('') }}
                  style={{ background: 'none', border: 'none', color: '#1264a3', fontSize: 15, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}
                >
                  戻る
                </button>
              </div>
            </div>
          </>
        )}

        {/* Step: Signup */}
        {step === 'signup' && (
          <>
            <h1 style={{ fontSize: 40, fontWeight: 900, color: '#1d1c1d', textAlign: 'center', marginBottom: 12, lineHeight: 1.2 }}>
              新規アカウント作成
            </h1>
            <p style={{ fontSize: 16, color: '#616061', textAlign: 'center', marginBottom: 32 }}>
              情報を入力してアカウントを作成してください。
            </p>

            <div style={{ width: '100%', maxWidth: 440 }}>
              <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <input
                  type="text" placeholder="表示名" value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)} style={inputStyle} autoFocus
                />
                <input
                  type="email" placeholder="名前@work-email.com" value={email}
                  onChange={(e) => setEmail(e.target.value)} style={inputStyle}
                />
                <input
                  type="password" placeholder="パスワード（6文字以上）" value={password}
                  onChange={(e) => setPassword(e.target.value)} style={inputStyle}
                />
                <button type="submit" disabled={loading} style={primaryBtn}>
                  {loading ? '処理中...' : 'アカウント作成'}
                </button>
              </form>

              <div style={{ textAlign: 'center', marginTop: 20 }}>
                <button
                  onClick={() => setStep('email')}
                  style={{ background: 'none', border: 'none', color: '#1264a3', fontSize: 15, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}
                >
                  既存のワークスペースにサインイン
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: '20px 0', display: 'flex', justifyContent: 'center', gap: 28, fontSize: 13, color: '#696969' }}>
        <span style={{ cursor: 'pointer' }}>プライバシーと利用規約</span>
        <span style={{ cursor: 'pointer' }}>お問い合わせ</span>
        <span style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>🌐 地域を変更</span>
      </div>
    </div>
  )
}
