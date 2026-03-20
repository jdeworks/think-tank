import { create } from 'zustand'

type View = 'home' | 'chat' | 'plan'

interface UIState {
  view: View
  sidebarOpen: boolean
  settingsOpen: boolean
  setView: (view: View) => void
  toggleSidebar: () => void
  setSettingsOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>()((set) => ({
  view: 'home',
  sidebarOpen: typeof window !== 'undefined' && window.innerWidth >= 1024,
  settingsOpen: false,
  setView: (view) => set({ view }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSettingsOpen: (open) => set({ settingsOpen: open }),
}))
