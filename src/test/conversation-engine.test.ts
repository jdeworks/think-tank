import { describe, it, expect, vi } from 'vitest'
import { startConversation, continueConversation } from '@/engine/conversation-engine'
import { createEmptyPlan } from '@/schema/project-plan'
import { createMessage } from '@/schema/conversation'
import type { LLMProvider, ChatRequest, ChatResponse } from '@/providers/types'

// Creates a mock that returns toolCalls on the first call and plain text on subsequent calls
// (matches the real engine loop: tool call → tool results → continuation)
function createMockProvider(response: Partial<ChatResponse> = {}): LLMProvider {
  let callCount = 0
  return {
    id: 'mock',
    name: 'Mock Provider',
    chat: vi.fn(async (_req: ChatRequest): Promise<ChatResponse> => {
      callCount++
      // First call may have tool calls; subsequent calls return plain text (continuation)
      if (callCount === 1) {
        return {
          content: response.content ?? 'Mock response',
          toolCalls: response.toolCalls,
          usage: response.usage ?? { promptTokens: 100, completionTokens: 50, totalTokens: 150 },
        }
      }
      return {
        content: response.content ?? 'Continuation response',
        toolCalls: undefined,
        usage: response.usage ?? { promptTokens: 50, completionTokens: 25, totalTokens: 75 },
      }
    }),
    validateKey: vi.fn(async () => true),
  }
}

describe('startConversation', () => {
  it('sends system prompt and initial prompt', async () => {
    const provider = createMockProvider()
    const plan = createEmptyPlan()

    await startConversation(provider, 'Build a todo app', 'friendly', plan)

    expect(provider.chat).toHaveBeenCalled()
    const call = vi.mocked(provider.chat).mock.calls[0][0]
    expect(call.messages[0].role).toBe('system')
    expect(call.messages[1].role).toBe('user')
    expect(call.messages[1].content).toContain('Build a todo app')
  })

  it('returns assistant reply', async () => {
    const provider = createMockProvider({ content: 'Great idea! What problem does this solve?' })
    const plan = createEmptyPlan()

    const result = await startConversation(provider, 'idea', 'friendly', plan)

    expect(result.reply.role).toBe('assistant')
    expect(result.reply.content).toBe('Great idea! What problem does this solve?')
  })

  it('extracts plan updates from tool calls', async () => {
    const provider = createMockProvider({
      content: 'Let me ask you some questions.',
      toolCalls: [
        {
          name: 'update_plan',
          arguments: JSON.stringify({
            section: 'overview',
            data: { name: 'Todo App', description: 'A task management app' },
          }),
        },
      ],
    })
    const plan = createEmptyPlan()

    const result = await startConversation(provider, 'idea', 'friendly', plan)

    expect(result.planUpdates).toHaveLength(1)
    expect(result.planUpdates[0].section).toBe('overview')
    expect(result.planUpdates[0].data).toEqual({
      name: 'Todo App',
      description: 'A task management app',
    })
  })

  it('makes follow-up call after tool calls for continuation', async () => {
    const provider = createMockProvider({
      content: 'Initial response.',
      toolCalls: [
        {
          name: 'update_plan',
          arguments: JSON.stringify({ section: 'overview', data: { name: 'App' } }),
        },
      ],
    })
    const plan = createEmptyPlan()

    await startConversation(provider, 'idea', 'friendly', plan)

    // Should have called chat twice: once with tool calls, once for continuation
    expect(provider.chat).toHaveBeenCalledTimes(2)
  })

  it('handles multiple tool calls', async () => {
    const provider = createMockProvider({
      content: 'Response',
      toolCalls: [
        {
          name: 'update_plan',
          arguments: JSON.stringify({ section: 'overview', data: { name: 'App' } }),
        },
        {
          name: 'update_plan',
          arguments: JSON.stringify({ section: 'architecture', data: { systemType: 'Web app' } }),
        },
      ],
    })
    const plan = createEmptyPlan()

    const result = await startConversation(provider, 'idea', 'friendly', plan)

    expect(result.planUpdates).toHaveLength(2)
  })

  it('skips malformed tool calls', async () => {
    const provider = createMockProvider({
      content: 'Response',
      toolCalls: [
        { name: 'update_plan', arguments: 'invalid json' },
        {
          name: 'update_plan',
          arguments: JSON.stringify({ section: 'overview', data: { name: 'OK' } }),
        },
      ],
    })
    const plan = createEmptyPlan()

    const result = await startConversation(provider, 'idea', 'friendly', plan)

    expect(result.planUpdates).toHaveLength(1)
  })

  it('skips tool calls without section or data', async () => {
    const provider = createMockProvider({
      content: 'Response',
      toolCalls: [
        { name: 'update_plan', arguments: JSON.stringify({ section: 'overview' }) },
        { name: 'update_plan', arguments: JSON.stringify({ data: { name: 'No Section' } }) },
      ],
    })
    const plan = createEmptyPlan()

    const result = await startConversation(provider, 'idea', 'friendly', plan)

    expect(result.planUpdates).toHaveLength(0)
  })

  it('returns usage stats', async () => {
    const provider = createMockProvider({
      usage: { promptTokens: 200, completionTokens: 100, totalTokens: 300 },
    })
    const plan = createEmptyPlan()

    const result = await startConversation(provider, 'idea', 'friendly', plan)

    expect(result.usage).toEqual({ promptTokens: 200, completionTokens: 100, totalTokens: 300 })
  })

  it('provides fallback content when response is empty', async () => {
    const provider = createMockProvider({ content: '' })
    const plan = createEmptyPlan()

    const result = await startConversation(provider, 'idea', 'friendly', plan)

    expect(result.reply.content).toContain('updated the plan')
  })

  it('includes tools in the request', async () => {
    const provider = createMockProvider()
    const plan = createEmptyPlan()

    await startConversation(provider, 'idea', 'friendly', plan)

    const call = vi.mocked(provider.chat).mock.calls[0][0]
    expect(call.tools).toBeDefined()
    expect(call.tools![0].function.name).toBe('update_plan')
  })
})

describe('continueConversation', () => {
  it('includes conversation history', async () => {
    const provider = createMockProvider()
    const plan = createEmptyPlan()
    const history = [
      createMessage('assistant', 'What problem does this solve?'),
      createMessage('user', 'I want to track my tasks'),
    ]

    await continueConversation(provider, 'It should be simple', history, 'friendly', plan)

    const call = vi.mocked(provider.chat).mock.calls[0][0]
    // system + 2 history + 1 new user message
    expect(call.messages).toHaveLength(4)
    expect(call.messages[0].role).toBe('system')
    expect(call.messages[1].content).toBe('What problem does this solve?')
    expect(call.messages[2].content).toBe('I want to track my tasks')
    expect(call.messages[3].content).toBe('It should be simple')
  })

  it('uses current plan state in system prompt', async () => {
    const provider = createMockProvider()
    const plan = createEmptyPlan()
    plan.overview.name = 'Task Tracker'

    await continueConversation(provider, 'message', [], 'friendly', plan)

    const call = vi.mocked(provider.chat).mock.calls[0][0]
    expect(call.messages[0].content).toContain('Task Tracker')
  })

  it('truncates long conversation history', async () => {
    const provider = createMockProvider()
    const plan = createEmptyPlan()
    // Create 50 messages (exceeds MAX_HISTORY_MESSAGES of 40)
    const history = Array.from({ length: 50 }, (_, i) =>
      createMessage(i % 2 === 0 ? 'user' : 'assistant', `Message ${i}`),
    )

    await continueConversation(provider, 'latest', history, 'friendly', plan)

    const call = vi.mocked(provider.chat).mock.calls[0][0]
    // system + truncated history (4 head + 36 tail) + 1 new user = 42
    expect(call.messages.length).toBeLessThanOrEqual(42)
    // First history message should be Message 0
    expect(call.messages[1].content).toBe('Message 0')
    // Last should be the new user message
    expect(call.messages[call.messages.length - 1].content).toBe('latest')
  })

  it('propagates errors from provider', async () => {
    const provider: LLMProvider = {
      id: 'mock',
      name: 'Mock',
      chat: vi.fn(async () => {
        throw new Error('API rate limit')
      }),
      validateKey: vi.fn(async () => true),
    }
    const plan = createEmptyPlan()

    await expect(continueConversation(provider, 'message', [], 'friendly', plan)).rejects.toThrow(
      'API rate limit',
    )
  })
})
