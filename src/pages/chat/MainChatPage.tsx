import { useEffect } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useWorkspaceStore } from '@/store/workspaceStore'
import { fetchMyWorkspaces } from '@/features/workspaces/api'
import { AppShell } from '@/components/layout/AppShell'
import { LoadingState } from '@/components/common/LoadingState'
import { useState } from 'react'

export default function MainChatPage() {
  const { workspaceSlug } = useParams<{ workspaceSlug: string }>()
  const { user } = useAuthStore()
  const { currentWorkspace, setCurrentWorkspace, setWorkspaces } =
    useWorkspaceStore()
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!user || !workspaceSlug) return

    // If current workspace matches, we're good
    if (currentWorkspace?.slug === workspaceSlug) {
      setLoading(false)
      return
    }

    // Otherwise fetch workspaces and find the right one
    let mounted = true
    async function load() {
      try {
        const workspaces = await fetchMyWorkspaces(user!.id)
        if (!mounted) return
        setWorkspaces(workspaces)

        const target = workspaces.find((ws) => ws.slug === workspaceSlug)
        if (target) {
          setCurrentWorkspace(target)
        } else {
          setNotFound(true)
        }
      } catch {
        setNotFound(true)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()

    return () => {
      mounted = false
    }
  }, [user, workspaceSlug, currentWorkspace?.slug, setCurrentWorkspace, setWorkspaces])

  if (loading) return <LoadingState fullScreen />
  if (notFound || !currentWorkspace) return <Navigate to="/workspaces" replace />

  return <AppShell />
}
