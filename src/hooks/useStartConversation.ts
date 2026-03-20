import { useEffect, useRef } from 'react'
import { useProjectStore } from '@/stores/project-store'
import { useSettingsStore } from '@/stores/settings-store'
import { createProvider } from '@/providers/registry'
import { startConversation } from '@/engine/conversation-engine'

export function useStartConversation() {
  const {
    messages,
    plan,
    idea,
    addAssistantMessage,
    updatePlanSection,
    setLoading,
    setError,
    addTokens,
    persist,
    setName,
  } = useProjectStore()
  const { provider: providerConfig, personality } = useSettingsStore()
  const hasStarted = useRef(false)

  useEffect(() => {
    if (hasStarted.current || !idea || messages.length > 0 || !providerConfig) return
    hasStarted.current = true

    const run = async () => {
      setLoading(true)
      setError(null)
      try {
        const provider = createProvider(providerConfig)
        const result = await startConversation(provider, idea, personality, plan)

        for (const update of result.planUpdates) {
          updatePlanSection(update.section, update.data)
        }
        if (result.planUpdates.some((u) => u.section === 'overview' && u.data.name)) {
          setName(result.planUpdates.find((u) => u.section === 'overview')?.data.name as string)
        }

        addAssistantMessage(result.reply.content)
        if (result.usage) addTokens(result.usage.totalTokens)
        await persist()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [
    idea,
    messages.length,
    providerConfig,
    personality,
    plan,
    addAssistantMessage,
    updatePlanSection,
    setLoading,
    setError,
    addTokens,
    persist,
    setName,
  ])
}
