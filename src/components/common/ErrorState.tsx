import { Result, Button } from 'antd'

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
}

export function ErrorState({
  title = 'エラーが発生しました',
  message,
  onRetry,
}: ErrorStateProps) {
  return (
    <Result
      status="error"
      title={title}
      subTitle={message}
      extra={
        onRetry ? (
          <Button type="primary" onClick={onRetry}>
            再試行
          </Button>
        ) : undefined
      }
    />
  )
}
