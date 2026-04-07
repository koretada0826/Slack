import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Typography, Button, Tabs, List } from 'antd'
import { ArrowLeftOutlined, NumberOutlined, UserOutlined, FileTextOutlined } from '@ant-design/icons'
import { useSearch } from '@/features/search/hooks'
import { useDebounce } from '@/hooks/useDebounce'
import { GlobalSearchInput } from '@/components/common/GlobalSearchInput'
import { AppAvatar } from '@/components/common/AppAvatar'
import { EmptyState } from '@/components/common/EmptyState'
import { LoadingState } from '@/components/common/LoadingState'
import { formatMessageTime } from '@/features/messages/utils'

const { Text } = Typography

export default function SearchPage() {
  const { workspaceSlug } = useParams<{ workspaceSlug: string }>()
  const navigate = useNavigate()
  const [input, setInput] = useState('')
  const debouncedInput = useDebounce(input, 300)
  const { results, loading, search } = useSearch()

  useEffect(() => {
    search(debouncedInput)
  }, [debouncedInput, search])

  const totalResults =
    results.users.length + results.channels.length + results.messages.length

  return (
    <div
      style={{
        maxWidth: 640,
        margin: '0 auto',
        minHeight: '100dvh',
        background: 'var(--color-bg)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '16px 16px 12px',
        }}
      >
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(`/ws/${workspaceSlug}`)}
        />
        <div style={{ flex: 1 }}>
          <GlobalSearchInput
            value={input}
            onChange={setInput}
            placeholder="ユーザー、チャンネル、メッセージを検索..."
          />
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <LoadingState />
      ) : !input.trim() ? (
        <EmptyState description="検索キーワードを入力" />
      ) : totalResults === 0 ? (
        <EmptyState description={`見つかりませんでした：「${input}」`} />
      ) : (
        <Tabs
          defaultActiveKey="all"
          style={{ padding: '0 16px' }}
          items={[
            {
              key: 'all',
              label: `すべて (${totalResults})`,
              children: (
                <div>
                  {results.users.length > 0 && (
                    <>
                      <Text
                        type="secondary"
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          display: 'block',
                          marginBottom: 8,
                        }}
                      >
                        ユーザー
                      </Text>
                      <List
                        size="small"
                        dataSource={results.users}
                        renderItem={(u) => (
                          <List.Item style={{ padding: '8px 0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <AppAvatar
                                name={u.display_name}
                                src={u.avatar_url ?? undefined}
                                size={28}
                              />
                              <Text>{u.display_name}</Text>
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                {u.email}
                              </Text>
                            </div>
                          </List.Item>
                        )}
                      />
                    </>
                  )}

                  {results.channels.length > 0 && (
                    <>
                      <Text
                        type="secondary"
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          display: 'block',
                          margin: '16px 0 8px',
                        }}
                      >
                        チャンネル
                      </Text>
                      <List
                        size="small"
                        dataSource={results.channels}
                        renderItem={(ch) => (
                          <List.Item style={{ padding: '8px 0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <NumberOutlined style={{ color: 'var(--color-text-secondary)' }} />
                              <Text>{ch.name}</Text>
                              {ch.description && (
                                <Text type="secondary" ellipsis style={{ fontSize: 13 }}>
                                  {ch.description}
                                </Text>
                              )}
                            </div>
                          </List.Item>
                        )}
                      />
                    </>
                  )}

                  {results.messages.length > 0 && (
                    <>
                      <Text
                        type="secondary"
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          display: 'block',
                          margin: '16px 0 8px',
                        }}
                      >
                        メッセージ
                      </Text>
                      <List
                        size="small"
                        dataSource={results.messages}
                        renderItem={(msg) => (
                          <List.Item style={{ padding: '8px 0' }}>
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                <Text strong style={{ fontSize: 13 }}>
                                  {msg.sender_display_name}
                                </Text>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                  {formatMessageTime(msg.created_at)}
                                </Text>
                              </div>
                              <Text
                                ellipsis
                                style={{
                                  fontSize: 13,
                                  display: 'block',
                                  color: 'var(--color-text-secondary)',
                                }}
                              >
                                {msg.body_plaintext}
                              </Text>
                            </div>
                          </List.Item>
                        )}
                      />
                    </>
                  )}
                </div>
              ),
            },
            {
              key: 'users',
              label: <><UserOutlined /> ユーザー ({results.users.length})</>,
              children: results.users.length === 0 ? (
                <EmptyState description="ユーザーが見つかりませんでした" />
              ) : (
                <List
                  dataSource={results.users}
                  renderItem={(u) => (
                    <List.Item>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <AppAvatar
                          name={u.display_name}
                          src={u.avatar_url ?? undefined}
                          size={32}
                        />
                        <div>
                          <Text strong>{u.display_name}</Text>
                          <Text
                            type="secondary"
                            style={{ fontSize: 12, display: 'block' }}
                          >
                            {u.email}
                          </Text>
                        </div>
                      </div>
                    </List.Item>
                  )}
                />
              ),
            },
            {
              key: 'channels',
              label: <><NumberOutlined /> チャンネル ({results.channels.length})</>,
              children: results.channels.length === 0 ? (
                <EmptyState description="チャンネルが見つかりませんでした" />
              ) : (
                <List
                  dataSource={results.channels}
                  renderItem={(ch) => (
                    <List.Item>
                      <div>
                        <Text strong># {ch.name}</Text>
                        {ch.description && (
                          <Text
                            type="secondary"
                            style={{ fontSize: 13, display: 'block' }}
                          >
                            {ch.description}
                          </Text>
                        )}
                      </div>
                    </List.Item>
                  )}
                />
              ),
            },
            {
              key: 'messages',
              label: <><FileTextOutlined /> メッセージ ({results.messages.length})</>,
              children: results.messages.length === 0 ? (
                <EmptyState description="メッセージが見つかりませんでした" />
              ) : (
                <List
                  dataSource={results.messages}
                  renderItem={(msg) => (
                    <List.Item>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <Text strong>{msg.sender_display_name}</Text>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {formatMessageTime(msg.created_at)}
                          </Text>
                        </div>
                        <Text style={{ fontSize: 14, display: 'block' }}>
                          {msg.body_plaintext}
                        </Text>
                      </div>
                    </List.Item>
                  )}
                />
              ),
            },
          ]}
        />
      )}
    </div>
  )
}
