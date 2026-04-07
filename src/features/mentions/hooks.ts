import { useState, useCallback } from 'react'
import { useWorkspaceStore } from '@/store/workspaceStore'
import { searchMentionCandidates } from './api'
import type { MentionCandidate } from './types'

export function useMentionSearch() {
  const [candidates, setCandidates] = useState<MentionCandidate[]>([])
  const [loading, setLoading] = useState(false)
  const { currentWorkspace } = useWorkspaceStore()

  const search = useCallback(
    async (query: string) => {
      if (!currentWorkspace) return
      setLoading(true)
      try {
        const results = await searchMentionCandidates(
          currentWorkspace.id,
          query
        )
        setCandidates(results)
      } catch {
        setCandidates([])
      } finally {
        setLoading(false)
      }
    },
    [currentWorkspace]
  )

  const clear = useCallback(() => setCandidates([]), [])

  return { candidates, loading, search, clear }
}
