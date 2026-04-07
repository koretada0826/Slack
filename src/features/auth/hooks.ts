import { useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/authStore'
import { fetchProfile } from '@/features/profiles/api'

export function useAuthInit() {
  const initCalled = useRef(false)

  useEffect(() => {
    if (initCalled.current) return
    initCalled.current = true

    const store = useAuthStore.getState()

    supabase.auth.getSession().then(({ data: { session } }) => {
      store.setSession(session)
      if (session?.user) {
        fetchProfile(session.user.id)
          .then((p) => store.setProfile(p))
          .catch(() => {})
          .finally(() => store.setInitialized(true))
      } else {
        store.setInitialized(true)
      }
    }).catch(() => {
      store.setInitialized(true)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const s = useAuthStore.getState()
      s.setSession(session)
      if (session?.user) {
        try {
          const profile = await fetchProfile(session.user.id)
          s.setProfile(profile)
        } catch { /* */ }
      } else {
        s.setProfile(null)
      }
    })

    return () => { subscription.unsubscribe() }
  }, [])
}
