import { useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'

/**
 * Generic hook for managing a Supabase realtime channel lifecycle.
 * Handles subscribe on mount and unsubscribe on unmount/deps change.
 */
export function useRealtimeChannel(
  channelName: string | null,
  setup: ((channel: ReturnType<typeof supabase.channel>) => ReturnType<typeof supabase.channel>) | null
) {
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    if (!channelName || !setup) return

    const channel = setup(supabase.channel(channelName))
    channel.subscribe()
    channelRef.current = channel

    return () => {
      channel.unsubscribe()
      channelRef.current = null
    }
  }, [channelName, setup])

  return channelRef
}
