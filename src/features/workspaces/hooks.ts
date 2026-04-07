import { useState, useEffect, useCallback } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useWorkspaceStore } from '@/store/workspaceStore'
import { fetchMyWorkspaces } from './api'
import type { WorkspaceWithRole } from '@/types/entities'

export function useMyWorkspaces() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuthStore()
  const { workspaces, setWorkspaces } = useWorkspaceStore()

  const refresh = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const data = await fetchMyWorkspaces(user.id)
      setWorkspaces(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch workspaces')
    } finally {
      setLoading(false)
    }
  }, [user, setWorkspaces])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { workspaces, loading, error, refresh }
}

export function useSetCurrentWorkspace() {
  const { setCurrentWorkspace } = useWorkspaceStore()

  return useCallback(
    (ws: WorkspaceWithRole) => {
      setCurrentWorkspace(ws)
    },
    [setCurrentWorkspace]
  )
}
