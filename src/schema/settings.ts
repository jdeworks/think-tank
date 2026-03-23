import { z } from 'zod/v4'

const ProviderType = z.enum(['openai', 'anthropic', 'openai-compatible'])

export const ProviderConfigSchema = z.object({
  id: z.string(),
  type: ProviderType,
  name: z.string(),
  apiKey: z.string(),
  baseUrl: z.optional(z.string()),
  model: z.string(),
})

export type ProviderConfig = z.infer<typeof ProviderConfigSchema>

export const PersonalityType = z.enum(['friendly', 'researcher', 'critical', 'architect', 'budget'])

export type Personality = z.infer<typeof PersonalityType>

export const PERSONALITY_INFO: Record<
  Personality,
  { label: string; description: string; emoji: string }
> = {
  friendly: {
    label: 'Friendly Guide',
    description: 'Encouraging and clear, explains jargon simply',
    emoji: '🤝',
  },
  researcher: {
    label: 'Researcher',
    description: 'Focuses on competitors, market analysis, and inspiration',
    emoji: '🔍',
  },
  critical: {
    label: 'Critical Thinker',
    description: 'Challenges assumptions, asks tough questions',
    emoji: '🧠',
  },
  architect: {
    label: 'Technical Architect',
    description: 'Deep dives into architecture and scalability',
    emoji: '🏗️',
  },
  budget: {
    label: 'Budget Hawk',
    description: 'Focuses on costs, ROI, and resource efficiency',
    emoji: '💰',
  },
}

export const PROVIDER_PRESETS = [
  {
    id: 'openai',
    type: 'openai' as const,
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    models: ['gpt-4.1', 'gpt-4.1-mini', 'gpt-4.1-nano', 'gpt-4o', 'gpt-4o-mini'],
    free: false,
  },
  {
    id: 'anthropic',
    type: 'anthropic' as const,
    name: 'Anthropic (Claude)',
    baseUrl: 'https://api.anthropic.com',
    models: ['claude-sonnet-4-20250514', 'claude-haiku-4-5-20250514', 'claude-opus-4-20250514'],
    free: false,
  },
  {
    id: 'openrouter',
    type: 'openai-compatible' as const,
    name: 'OpenRouter (free models available)',
    baseUrl: 'https://openrouter.ai/api/v1',
    models: [
      'qwen/qwen3-coder:free',
      'nvidia/nemotron-3-super-120b-a12b:free',
      'stepfun/step-3.5-flash:free',
      'google/gemma-3-27b-it:free',
      'nousresearch/hermes-3-llama-3.1-405b:free',
    ],
    free: true,
  },
  {
    id: 'ollama',
    type: 'openai-compatible' as const,
    name: 'Ollama / LM Studio (local, free)',
    baseUrl: 'http://localhost:11434/v1',
    models: ['llama3.3', 'gemma3', 'qwen3', 'deepseek-r1', 'phi4', 'mistral'],
    free: true,
  },
]
