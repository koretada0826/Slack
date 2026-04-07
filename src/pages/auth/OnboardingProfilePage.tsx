import { Navigate } from 'react-router-dom'
import { Typography } from 'antd'
import { useAuthStore } from '@/store/authStore'
import { ProfileSetupForm } from '@/components/auth/ProfileSetupForm'
import { LoadingState } from '@/components/common/LoadingState'

const { Title, Text } = Typography

export default function OnboardingProfilePage() {
  const { session, profile, initialized } = useAuthStore()

  if (!initialized) return <LoadingState fullScreen />
  if (!session) return <Navigate to="/login" replace />
  if (profile && profile.display_name.trim()) {
    return <Navigate to="/workspaces" replace />
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100dvh',
        background: 'var(--color-bg-secondary)',
        padding: 16,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 440,
          background: '#fff',
          borderRadius: 'var(--radius-xl)',
          padding: '40px 32px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title level={3} style={{ marginBottom: 4 }}>
            プロフィールを設定
          </Title>
          <Text type="secondary">チームに自分を紹介しましょう</Text>
        </div>

        <ProfileSetupForm />
      </div>
    </div>
  )
}
