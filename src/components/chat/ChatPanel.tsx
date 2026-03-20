import { useEffect, useRef } from 'react'
import { useProjectStore } from '@/stores/project-store'
import { useSettingsStore } from '@/stores/settings-store'
import { createProvider } from '@/providers/registry'
import { continueConversation } from '@/engine/conversation-engine'
import { MessageBubble } from './MessageBubble'
import { ChatInput } from './ChatInput'
import { formatTokens, estimateCost } from '@/utils/tokens'
import { useStartConversation } from '@/hooks/useStartConversation'

export function ChatPanel() {
  const {
    messages,
    isLoading,
    error,
    addUserMessage,
    addAssistantMessage,
    updatePlanSection,
    setLoading,
    setError,
    addTokens,
    totalTokens,
    persist,
  } = useProjectStore()
  const { provider: providerConfig, personality } = useSettingsStore()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useStartConversation()

  const handleSend = async (content: string) => {
    if (!providerConfig?.apiKey) return
    addUserMessage(content)
    setLoading(true)
    setError(null)

    try {
      const provider = createProvider(providerConfig)
      const currentMessages = [...useProjectStore.getState().messages]
      const currentPlan = useProjectStore.getState().plan

      const result = await continueConversation(
        provider,
        content,
        currentMessages,
        personality,
        currentPlan,
      )

      for (const update of result.planUpdates) {
        updatePlanSection(update.section, update.data)
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

  return (
    <div className="flex flex-col h-full">
      {/* Token counter */}
      {totalTokens > 0 && providerConfig && (
        <div className="px-4 py-1.5 bg-[var(--bg-alt)] border-b border-[var(--border)] text-xs text-[var(--text-secondary)] flex justify-end gap-3">
          <span>Tokens: {formatTokens(totalTokens)}</span>
          <span>Cost: {estimateCost(providerConfig.model, totalTokens)}</span>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-100 dark:bg-slate-700 rounded-2xl rounded-bl-md px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                <span className="inline-flex gap-1">
                  <span className="animate-bounce" style={{ animationDelay: '0ms' }}>
                    .
                  </span>
                  <span className="animate-bounce" style={{ animationDelay: '150ms' }}>
                    .
                  </span>
                  <span className="animate-bounce" style={{ animationDelay: '300ms' }}>
                    .
                  </span>
                </span>
              </div>
            </div>
          )}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg p-3 text-sm">
              {error}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <ChatInput onSend={handleSend} disabled={isLoading} />
    </div>
  )
}
