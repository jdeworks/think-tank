import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ProviderConfig, Personality } from '@/schema/settings'

interface SettingsState {
  provider: ProviderConfig | null
  personality: Personality
  voiceEnabled: boolean
  setProvider: (provider: ProviderConfig) => void
  setPersonality: (personality: Personality) => void
  setVoiceEnabled: (enabled: boolean) => void
  clearProvider: () => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      provider: null,
      personality: 'friendly',
      voiceEnabled: false,
      setProvider: (provider) => set({ provider }),
      setPersonality: (personality) => set({ personality }),
      setVoiceEnabled: (voiceEnabled) => set({ voiceEnabled }),
      clearProvider: () => set({ provider: null }),
    }),
    {
      name: 'think-tank-settings',
    },
  ),
)
