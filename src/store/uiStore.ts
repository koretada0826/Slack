import { create } from 'zustand'
import type { ChatTarget } from '@/types/common'

interface UiState {
  sidebarOpen: boolean
  mobileDrawerOpen: boolean
  activeChatTarget: ChatTarget

  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  setMobileDrawerOpen: (open: boolean) => void
  setActiveChatTarget: (target: ChatTarget) => void
}

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: true,
  mobileDrawerOpen: false,
  activeChatTarget: null,

  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setMobileDrawerOpen: (open) => set({ mobileDrawerOpen: open }),
  setActiveChatTarget: (target) => set({ activeChatTarget: target }),
}))
