import { Spin } from 'antd'
import type { CSSProperties } from 'react'

interface LoadingStateProps {
  tip?: string
  fullScreen?: boolean
}

export function LoadingState({ tip = '読み込み中...', fullScreen }: LoadingStateProps) {
  const style: CSSProperties = fullScreen
    ? {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100dvh',
        width: '100%',
      }
    : {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 0',
        width: '100%',
      }

  return (
    <div style={style}>
      <Spin size="large" tip={tip}>
        <div style={{ padding: 50 }} />
      </Spin>
    </div>
  )
}
