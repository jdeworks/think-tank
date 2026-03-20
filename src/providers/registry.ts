import type { ProviderConfig } from '@/schema/settings'
import type { LLMProvider } from './types'
import { OpenAIProvider } from './openai'
import { AnthropicProvider } from './anthropic'

export function createProvider(config: ProviderConfig): LLMProvider {
  switch (config.type) {
    case 'openai':
      return new OpenAIProvider(config.apiKey, config.model, config.baseUrl)
    case 'openai-compatible':
      return new OpenAIProvider(
        config.apiKey,
        config.model,
        config.baseUrl || 'http://localhost:11434/v1',
      )
    case 'anthropic':
      return new AnthropicProvider(config.apiKey, config.model)
    default:
      throw new Error(`Unknown provider type: ${config.type}`)
  }
}
