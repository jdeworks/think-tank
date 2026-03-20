import type { ChatRequest, ChatResponse, LLMProvider } from './types'

export class OpenAIProvider implements LLMProvider {
  id = 'openai'
  name = 'OpenAI'
  private apiKey: string
  private baseUrl: string
  private model: string

  constructor(apiKey: string, model: string, baseUrl = 'https://api.openai.com/v1') {
    this.apiKey = apiKey
    this.baseUrl = baseUrl.replace(/\/$/, '')
    this.model = model
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const body: Record<string, unknown> = {
      model: request.model || this.model,
      messages: request.messages,
      temperature: request.temperature ?? 0.7,
    }

    if (request.maxTokens) {
      body.max_tokens = request.maxTokens
    }

    if (request.tools?.length) {
      body.tools = request.tools
      body.tool_choice = 'auto'
    }

    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`OpenAI API error (${res.status}): ${err}`)
    }

    const data = await res.json()
    const choice = data.choices?.[0]

    const toolCalls = choice?.message?.tool_calls?.map(
      (tc: { function: { name: string; arguments: string } }) => ({
        name: tc.function.name,
        arguments: tc.function.arguments,
      }),
    )

    return {
      content: choice?.message?.content ?? '',
      toolCalls,
      usage: data.usage
        ? {
            promptTokens: data.usage.prompt_tokens,
            completionTokens: data.usage.completion_tokens,
            totalTokens: data.usage.total_tokens,
          }
        : undefined,
    }
  }

  async validateKey(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/models`, {
        headers: { Authorization: `Bearer ${this.apiKey}` },
      })
      return res.ok
    } catch {
      return false
    }
  }
}
