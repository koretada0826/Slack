import { create } from 'zustand'

interface ThreadState {
  /** The root message ID of the currently open thread */
  activeThreadMessageId: string | null

  setActiveThread: (messageId: string | null) => void
  closeThread: () => void
}

export const useThreadStore = create<ThreadState>((set) => ({
  activeThreadMessageId: null,

  setActiveThread: (messageId) => set({ activeThreadMessageId: messageId }),
  closeThread: () => set({ activeThreadMessageId: null }),
}))
