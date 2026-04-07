import { create } from 'zustand'
import type { WorkspaceWithRole } from '@/types/entities'

interface WorkspaceState {
  currentWorkspace: WorkspaceWithRole | null
  workspaces: WorkspaceWithRole[]

  setCurrentWorkspace: (workspace: WorkspaceWithRole | null) => void
  setWorkspaces: (workspaces: WorkspaceWithRole[]) => void
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  currentWorkspace: null,
  workspaces: [],

  setCurrentWorkspace: (workspace) => set({ currentWorkspace: workspace }),
  setWorkspaces: (workspaces) => set({ workspaces }),
}))
