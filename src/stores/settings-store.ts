import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ProviderConfig, Personality } from '@/schema/settings'

interface SettingsState {
  provider: ProviderConfig | null
  personality: Personality
  voiceInputEnabled: boolean
  voiceOutputEnabled: boolean
  setProvider: (provider: ProviderConfig) => void
  setPersonality: (personality: Personality) => void
  setVoiceInputEnabled: (enabled: boolean) => void
  setVoiceOutputEnabled: (enabled: boolean) => void
  clearProvider: () => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      provider: null,
      personality: 'friendly',
      voiceInputEnabled: false,
      voiceOutputEnabled: false,
      setProvider: (provider) => set({ provider }),
      setPersonality: (personality) => set({ personality }),
      setVoiceInputEnabled: (voiceInputEnabled) => set({ voiceInputEnabled }),
      setVoiceOutputEnabled: (voiceOutputEnabled) => set({ voiceOutputEnabled }),
      clearProvider: () => set({ provider: null }),
    }),
    {
      name: 'think-tank-settings',
      partialize: (state) => ({
        // Persist everything EXCEPT the API key
        provider: state.provider ? { ...state.provider, apiKey: '' } : null,
        personality: state.personality,
        voiceInputEnabled: state.voiceInputEnabled,
        voiceOutputEnabled: state.voiceOutputEnabled,
      }),
    },
  ),
)
