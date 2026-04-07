import { useEffect, useState } from 'react'
import { useParams, useNavigate, Navigate } from 'react-router-dom'
import { message, Typography } from 'antd'
import { supabase } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/authStore'
import { LoadingState } from '@/components/common/LoadingState'
import { ErrorState } from '@/components/common/ErrorState'

const { Title } = Typography

export default function InviteAcceptPage() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const { session } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!session || !token) return

    async function accept() {
      try {
        const { data, error: rpcError } = await supabase.rpc('accept_invite', {
          _token: token!,
        })
        if (rpcError) throw rpcError

        message.success('招待を承認しました！')
        // data is the workspace_id — we need to find the slug
        // For now, redirect to workspace select
        if (data) {
          const { data: ws } = await supabase
            .from('workspaces')
            .select('slug')
            .eq('id', data)
            .single()
          if (ws) {
            navigate(`/ws/${ws.slug}`, { replace: true })
            return
          }
        }
        navigate('/workspaces', { replace: true })
      } catch (err) {
        setError(err instanceof Error ? err.message : '招待の承認に失敗しました')
      } finally {
        setLoading(false)
      }
    }
    accept()
  }, [session, token, navigate])

  if (!session) return <Navigate to="/login" replace />
  if (loading) return <LoadingState fullScreen tip="招待を承認中..." />
  if (error) return <ErrorState title="招待エラー" message={error} />

  return (
    <div style={{ textAlign: 'center', padding: 48 }}>
      <Title level={4}>リダイレクト中...</Title>
    </div>
  )
}
