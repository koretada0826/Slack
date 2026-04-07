import { create } from 'zustand'
import type { Session, User } from '@supabase/supabase-js'
import type { DbProfile } from '@/types/db'

interface AuthState {
  session: Session | null
  user: User | null
  profile: DbProfile | null
  initialized: boolean

  setSession: (session: Session | null) => void
  setProfile: (profile: DbProfile | null) => void
  setInitialized: (initialized: boolean) => void
  reset: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  profile: null,
  initialized: false,

  setSession: (session) =>
    set({
      session,
      user: session?.user ?? null,
    }),

  setProfile: (profile) => set({ profile }),

  setInitialized: (initialized) => set({ initialized }),

  reset: () =>
    set({
      session: null,
      user: null,
      profile: null,
      initialized: false,
    }),
}))
