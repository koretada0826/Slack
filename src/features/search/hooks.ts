import { useState, useCallback } from 'react'
import { useWorkspaceStore } from '@/store/workspaceStore'
import { searchAll } from './api'
import type { SearchResults } from './types'

export function useSearch() {
  const [results, setResults] = useState<SearchResults>({
    users: [],
    channels: [],
    messages: [],
  })
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState('')
  const { currentWorkspace } = useWorkspaceStore()

  const search = useCallback(
    async (q: string) => {
      setQuery(q)
      if (!currentWorkspace || !q.trim()) {
        setResults({ users: [], channels: [], messages: [] })
        return
      }
      setLoading(true)
      try {
        const data = await searchAll(currentWorkspace.id, q)
        setResults(data)
      } catch {
        setResults({ users: [], channels: [], messages: [] })
      } finally {
        setLoading(false)
      }
    },
    [currentWorkspace]
  )

  return { results, loading, query, search }
}
