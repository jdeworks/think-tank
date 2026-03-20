import type { ChatRequest, ChatResponse, LLMProvider } from './types'

export class AnthropicProvider implements LLMProvider {
  id = 'anthropic'
  name = 'Anthropic'
  private apiKey: string
  private model: string

  constructor(apiKey: string, model: string) {
    this.apiKey = apiKey
    this.model = model
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const systemMsg = request.messages.find((m) => m.role === 'system')
    const nonSystemMsgs = request.messages.filter((m) => m.role !== 'system')

    const body: Record<string, unknown> = {
      model: request.model || this.model,
      max_tokens: request.maxTokens || 4096,
      messages: nonSystemMsgs.map((m) => ({ role: m.role, content: m.content })),
    }

    if (systemMsg) {
      body.system = systemMsg.content
    }

    if (request.tools?.length) {
      body.tools = request.tools.map((t) => ({
        name: t.function.name,
        description: t.function.description,
        input_schema: t.function.parameters,
      }))
    }

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Anthropic API error (${res.status}): ${err}`)
    }

    const data = await res.json()

    if (!data.content) return { content: '', usage: undefined }

    let content = ''
    const toolCalls: { name: string; arguments: string }[] = []

    for (const block of data.content) {
      if (block.type === 'text') {
        content += block.text
      } else if (block.type === 'tool_use') {
        toolCalls.push({
          name: block.name,
          arguments: JSON.stringify(block.input),
        })
      }
    }

    return {
      content,
      toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
      usage: data.usage
        ? {
            promptTokens: data.usage.input_tokens,
            completionTokens: data.usage.output_tokens,
            totalTokens: data.usage.input_tokens + data.usage.output_tokens,
          }
        : undefined,
    }
  }

  async validateKey(): Promise<boolean> {
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: 1,
          messages: [{ role: 'user', content: 'hi' }],
        }),
      })
      return res.ok
    } catch {
      return false
    }
  }
}
