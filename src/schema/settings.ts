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
    type: 'openai' as const,
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4.1', 'gpt-4.1-mini', 'gpt-4.1-nano'],
  },
  {
    type: 'anthropic' as const,
    name: 'Anthropic (Claude)',
    baseUrl: 'https://api.anthropic.com',
    models: ['claude-sonnet-4-6', 'claude-haiku-4-5-20251001'],
  },
  {
    type: 'openai-compatible' as const,
    name: 'OpenAI Compatible (Ollama, LM Studio, etc.)',
    baseUrl: 'http://localhost:11434/v1',
    models: [],
  },
]
