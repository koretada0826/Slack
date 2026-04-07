import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

export function ProtectedLayout() {
  const { session, profile, initialized } = useAuthStore()

  // 初期化中 → ローディング表示
  if (!initialized) {
    return null
  }

  // セッションなし → ログインへ
  if (!session) {
    return <Navigate to="/login" replace />
  }

  // プロフィール未設定 → オンボーディングへ
  if (profile && !profile.display_name.trim()) {
    return <Navigate to="/onboarding" replace />
  }

  return <Outlet />
}
