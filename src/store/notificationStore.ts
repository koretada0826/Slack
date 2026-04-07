import { create } from 'zustand'

type CountUpdater = number | ((prev: number) => number)

interface NotificationState {
  unreadCount: number

  setUnreadCount: (countOrFn: CountUpdater) => void
  incrementUnread: () => void
  decrementUnread: () => void
}

export const useNotificationStore = create<NotificationState>((set) => ({
  unreadCount: 0,

  setUnreadCount: (countOrFn) =>
    set((s) => ({
      unreadCount:
        typeof countOrFn === 'function'
          ? countOrFn(s.unreadCount)
          : countOrFn,
    })),
  incrementUnread: () => set((s) => ({ unreadCount: s.unreadCount + 1 })),
  decrementUnread: () =>
    set((s) => ({ unreadCount: Math.max(0, s.unreadCount - 1) })),
}))
