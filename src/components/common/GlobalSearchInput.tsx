import { Input } from 'antd'
import { SearchOutlined } from '@ant-design/icons'

interface GlobalSearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function GlobalSearchInput({
  value,
  onChange,
  placeholder = '検索...',
}: GlobalSearchInputProps) {
  return (
    <Input
      prefix={<SearchOutlined style={{ color: 'var(--color-text-tertiary)' }} />}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      allowClear
      size="large"
      style={{
        borderRadius: 'var(--radius-lg)',
      }}
    />
  )
}
