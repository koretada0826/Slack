import { ConfigProvider, App as AntdApp } from 'antd'
import { antdTheme } from '@/styles/antd-theme'
import { useAuthInit } from '@/features/auth/hooks'

interface AppProvidersProps {
  children: React.ReactNode
}

function AuthInitializer({ children }: { children: React.ReactNode }) {
  useAuthInit()
  return <>{children}</>
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ConfigProvider theme={antdTheme}>
      <AntdApp>
        <AuthInitializer>{children}</AuthInitializer>
      </AntdApp>
    </ConfigProvider>
  )
}
