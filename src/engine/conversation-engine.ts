import type { LLMProvider, ChatMessage } from '@/providers/types'
import type { ProjectPlan, PlanSectionKey } from '@/schema/project-plan'
import { createMessage, type Message } from '@/schema/conversation'
import type { Personality } from '@/schema/settings'
import { buildSystemPrompt, buildInitialPrompt, getUpdatePlanTool } from './prompts'
import { getIncompleteSections, getNextSection } from './section-map'
import { loadSectionGuide } from '@/utils/prompt-loader'

const SECTION_SLUG_MAP: Record<string, { num: number; slug: string }> = {
  foundation: { num: 0, slug: 'foundation' },
  overview: { num: 1, slug: 'overview' },
  competitors: { num: 2, slug: 'competitors' },
  requirements: { num: 3, slug: 'requirements' },
  architecture: { num: 4, slug: 'architecture' },
  techStack: { num: 5, slug: 'tech-stack' },
  hosting: { num: 6, slug: 'hosting' },
  security: { num: 7, slug: 'security' },
  design: { num: 8, slug: 'design' },
  budget: { num: 9, slug: 'budget' },
  timeline: { num: 10, slug: 'timeline' },
  risks: { num: 11, slug: 'risks' },
}

export interface EngineResult {
  reply: Message
  planUpdates: Array<{ section: PlanSectionKey; data: Record<string, unknown> }>
  usage?: { promptTokens: number; completionTokens: number; totalTokens: number }
}

// Keep the first 4 messages (system + initial context) and the last 36
// to avoid exceeding LLM context limits on long conversations.
const MAX_HISTORY_MESSAGES = 40

export async function startConversation(
  provider: LLMProvider,
  idea: string,
  personality: Personality,
  plan: ProjectPlan,
): Promise<EngineResult> {
  const incompleteSections = getIncompleteSections(plan)
  const sectionGuide = await loadCurrentSectionGuide(plan)
  const systemPrompt = buildSystemPrompt(personality, plan, incompleteSections, sectionGuide)
  const initialPrompt = buildInitialPrompt(idea, personality)

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: initialPrompt },
  ]

  return callLLM(provider, messages)
}

export async function continueConversation(
  provider: LLMProvider,
  userMessage: string,
  conversationHistory: Message[],
  personality: Personality,
  plan: ProjectPlan,
): Promise<EngineResult> {
  const incompleteSections = getIncompleteSections(plan)
  const sectionGuide = await loadCurrentSectionGuide(plan)
  const systemPrompt = buildSystemPrompt(personality, plan, incompleteSections, sectionGuide)

  let historyMessages = conversationHistory.map((m) => ({
    role: m.role as 'user' | 'assistant' | 'system',
    content: m.content,
  }))

  // Truncate history to stay within context limits: keep the first 4 messages
  // (initial context) and the most recent messages up to MAX_HISTORY_MESSAGES.
  if (historyMessages.length > MAX_HISTORY_MESSAGES) {
    const head = historyMessages.slice(0, 4)
    const tail = historyMessages.slice(-(MAX_HISTORY_MESSAGES - 4))
    historyMessages = [...head, ...tail]
  }

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...historyMessages,
    { role: 'user', content: userMessage },
  ]

  return callLLM(provider, messages)
}

async function callLLM(provider: LLMProvider, messages: ChatMessage[]): Promise<EngineResult> {
  const planUpdates: Array<{ section: PlanSectionKey; data: Record<string, unknown> }> = []
  let fullContent = ''
  let lastUsage: EngineResult['usage'] = undefined

  // Loop to handle tool calls: after extracting tool results, send them back
  // to the LLM so it can continue generating text.
  let currentMessages = [...messages]
  while (true) {
    const response = await provider.chat({
      messages: currentMessages,
      model: '',
      temperature: 0.7,
      maxTokens: 4096,
      tools: [getUpdatePlanTool()],
    })

    if (response.content) {
      fullContent += response.content
    }
    lastUsage = response.usage

    const updateCalls = (response.toolCalls ?? []).filter((tc) => tc.name === 'update_plan')
    if (updateCalls.length === 0) {
      break
    }

    for (const tc of updateCalls) {
      try {
        const args = JSON.parse(tc.arguments)
        if (args.section && args.data) {
          planUpdates.push({
            section: args.section as PlanSectionKey,
            data: args.data,
          })
        }
      } catch {
        // Skip malformed tool calls
      }
    }

    // Send tool results back to the LLM for continuation
    currentMessages = [
      ...currentMessages,
      { role: 'assistant', content: response.content || '' },
      {
        role: 'user',
        content: updateCalls.map((tc) => `Tool "${tc.name}" executed successfully.`).join(' '),
      },
    ]
  }

  return {
    reply: createMessage(
      'assistant',
      fullContent ||
        "I've updated the plan based on our discussion. What would you like to explore next?",
    ),
    planUpdates,
    usage: lastUsage,
  }
}

async function loadCurrentSectionGuide(plan: ProjectPlan): Promise<string> {
  const next = getNextSection(plan)
  if (!next) {
    // All sections complete — load implementation review
    return loadSectionGuide(12, 'implementation-review')
  }
  const info = SECTION_SLUG_MAP[next]
  if (!info) return ''
  return loadSectionGuide(info.num, info.slug)
}
