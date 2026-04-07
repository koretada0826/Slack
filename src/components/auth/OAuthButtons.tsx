import { Button, message } from 'antd'
import { GoogleOutlined } from '@ant-design/icons'
import { loginWithGoogle } from '@/features/auth/api'

export function OAuthButtons() {
  async function handleGoogleLogin() {
    try {
      await loginWithGoogle()
    } catch {
      message.error('Googleログインの開始に失敗しました')
    }
  }

  return (
    <Button
      icon={<GoogleOutlined />}
      size="large"
      block
      onClick={handleGoogleLogin}
      style={{ height: 44 }}
    >
      Googleで続ける
    </Button>
  )
}
