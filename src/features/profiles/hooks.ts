import { useState, useCallback } from 'react'
import { useAuthStore } from '@/store/authStore'
import { updateProfile } from './api'
import type { UpdateProfileParams } from './types'

export function useUpdateProfile() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user, setProfile } = useAuthStore()

  const update = useCallback(
    async (params: UpdateProfileParams) => {
      if (!user) return
      setLoading(true)
      setError(null)
      try {
        const updated = await updateProfile(user.id, params)
        setProfile(updated)
        return updated
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update profile'
        setError(message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [user, setProfile]
  )

  return { update, loading, error }
}
