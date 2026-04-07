import { supabase } from './client'

/**
 * Creates a typed realtime channel for Postgres changes.
 * Usage: createRealtimeChannel('my-channel', 'messages', 'channel_id=eq.xxx', callback)
 */
export function createRealtimeChannel<T extends Record<string, unknown>>(
  channelName: string,
  table: string,
  filter: string,
  onInsert?: (payload: T) => void,
  onUpdate?: (payload: T) => void,
  onDelete?: (payload: T) => void
) {
  let channel = supabase.channel(channelName)

  if (onInsert) {
    channel = channel.on<T>(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table, filter },
      (payload) => {
        if (payload.eventType === 'INSERT') onInsert(payload.new)
      }
    )
  }

  if (onUpdate) {
    channel = channel.on<T>(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table, filter },
      (payload) => {
        if (payload.eventType === 'UPDATE') onUpdate(payload.new)
      }
    )
  }

  if (onDelete) {
    channel = channel.on<T>(
      'postgres_changes',
      { event: 'DELETE', schema: 'public', table, filter },
      (payload) => {
        if (payload.eventType === 'DELETE') onDelete(payload.old as T)
      }
    )
  }

  return channel.subscribe()
}
