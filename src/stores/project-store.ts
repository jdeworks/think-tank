import { create } from 'zustand'
import { createEmptyPlan, type ProjectPlan, type PlanSectionKey } from '@/schema/project-plan'
import { createMessage, type Message } from '@/schema/conversation'
import { saveProject, type StoredProject } from '@/storage/project-db'
import { useSettingsStore } from '@/stores/settings-store'
import type { Personality } from '@/schema/settings'

interface ProjectState {
  id: string | null
  name: string
  idea: string
  plan: ProjectPlan
  messages: Message[]
  isLoading: boolean
  error: string | null
  totalTokens: number

  startNewProject: (idea: string) => void
  loadFromStored: (project: StoredProject) => void
  addUserMessage: (content: string) => void
  addAssistantMessage: (content: string) => void
  updatePlanSection: (section: PlanSectionKey, data: Record<string, unknown>) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  addTokens: (tokens: number) => void
  persist: () => Promise<void>
  setName: (name: string) => void
}

export const useProjectStore = create<ProjectState>()((set, get) => ({
  id: null,
  name: '',
  idea: '',
  plan: createEmptyPlan(),
  messages: [],
  isLoading: false,
  error: null,
  totalTokens: 0,

  startNewProject: (idea: string) => {
    const id = crypto.randomUUID()
    set({
      id,
      name: '',
      idea,
      plan: createEmptyPlan(),
      messages: [],
      isLoading: false,
      error: null,
      totalTokens: 0,
    })
  },

  loadFromStored: (project: StoredProject) => {
    set({
      id: project.id,
      name: project.name,
      idea: project.idea,
      plan: project.plan,
      messages: project.messages,
      isLoading: false,
      error: null,
      totalTokens: 0,
    })
    if (project.personality) {
      useSettingsStore.getState().setPersonality(project.personality as Personality)
    }
  },

  addUserMessage: (content: string) => {
    const msg = createMessage('user', content)
    set((state) => ({ messages: [...state.messages, msg] }))
  },

  addAssistantMessage: (content: string) => {
    const msg = createMessage('assistant', content)
    set((state) => ({ messages: [...state.messages, msg] }))
  },

  updatePlanSection: (section: PlanSectionKey, data: Record<string, unknown>) => {
    set((state) => {
      const currentSection = state.plan[section]
      let updated: unknown

      if (Array.isArray(currentSection)) {
        if (Array.isArray(data)) {
          updated = [...currentSection, ...data]
        } else if (Array.isArray((data as Record<string, unknown>)?.items)) {
          updated = [...currentSection, ...((data as Record<string, unknown>).items as unknown[])]
        } else {
          updated = data
        }
      } else if (typeof currentSection === 'object' && currentSection !== null) {
        updated = { ...currentSection, ...data }
      } else {
        updated = data
      }

      return {
        plan: {
          ...state.plan,
          [section]: updated,
          meta: { ...state.plan.meta, lastModified: new Date().toISOString() },
        },
      }
    })
  },

  setLoading: (loading: boolean) => set({ isLoading: loading }),
  setError: (error: string | null) => set({ error }),
  addTokens: (tokens: number) => set((state) => ({ totalTokens: state.totalTokens + tokens })),
  setName: (name: string) => set({ name }),

  persist: async () => {
    const state = get()
    if (!state.id) return
    await saveProject({
      id: state.id,
      name: state.name || state.plan.overview.name || 'Untitled Project',
      idea: state.idea,
      plan: state.plan,
      messages: state.messages,
      personality: useSettingsStore.getState().personality,
      createdAt: state.plan.meta.createdAt,
      updatedAt: new Date().toISOString(),
    })
  },
}))
