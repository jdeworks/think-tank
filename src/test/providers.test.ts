import { describe, it, expect, vi, beforeEach } from 'vitest'
import { OpenAIProvider } from '@/providers/openai'
import { AnthropicProvider } from '@/providers/anthropic'
import { createProvider } from '@/providers/registry'

// Mock fetch globally
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

beforeEach(() => {
  mockFetch.mockReset()
})

describe('OpenAIProvider', () => {
  it('sends correct headers and body', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: 'Hello', tool_calls: null } }],
        usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
      }),
    })

    const provider = new OpenAIProvider('sk-test', 'gpt-4o')
    await provider.chat({
      messages: [{ role: 'user', content: 'Hi' }],
      model: 'gpt-4o',
    })

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.openai.com/v1/chat/completions',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer sk-test',
          'Content-Type': 'application/json',
        }),
      }),
    )

    const body = JSON.parse(mockFetch.mock.calls[0][1].body)
    expect(body.model).toBe('gpt-4o')
    expect(body.messages).toEqual([{ role: 'user', content: 'Hi' }])
  })

  it('parses response correctly', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: 'Response text' } }],
        usage: { prompt_tokens: 100, completion_tokens: 50, total_tokens: 150 },
      }),
    })

    const provider = new OpenAIProvider('sk-test', 'gpt-4o')
    const result = await provider.chat({
      messages: [{ role: 'user', content: 'Hi' }],
      model: '',
    })

    expect(result.content).toBe('Response text')
    expect(result.usage).toEqual({ promptTokens: 100, completionTokens: 50, totalTokens: 150 })
  })

  it('parses tool calls', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: 'Let me update the plan.',
              tool_calls: [
                {
                  function: {
                    name: 'update_plan',
                    arguments: '{"section":"overview","data":{"name":"Test"}}',
                  },
                },
              ],
            },
          },
        ],
        usage: { prompt_tokens: 10, completion_tokens: 10, total_tokens: 20 },
      }),
    })

    const provider = new OpenAIProvider('sk-test', 'gpt-4o')
    const result = await provider.chat({
      messages: [{ role: 'user', content: 'Hi' }],
      model: '',
      tools: [
        {
          type: 'function',
          function: { name: 'update_plan', description: 'Update plan', parameters: {} },
        },
      ],
    })

    expect(result.toolCalls).toHaveLength(1)
    expect(result.toolCalls![0].name).toBe('update_plan')
    expect(JSON.parse(result.toolCalls![0].arguments)).toEqual({
      section: 'overview',
      data: { name: 'Test' },
    })
  })

  it('throws on API error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      text: async () => 'Unauthorized',
    })

    const provider = new OpenAIProvider('bad-key', 'gpt-4o')
    await expect(
      provider.chat({ messages: [{ role: 'user', content: 'Hi' }], model: '' }),
    ).rejects.toThrow('OpenAI API error (401)')
  })

  it('uses custom base URL', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: 'OK' } }],
      }),
    })

    const provider = new OpenAIProvider('key', 'llama3', 'http://localhost:11434/v1')
    await provider.chat({ messages: [{ role: 'user', content: 'Hi' }], model: '' })

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:11434/v1/chat/completions',
      expect.anything(),
    )
  })

  it('strips trailing slash from base URL', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ choices: [{ message: { content: 'OK' } }] }),
    })

    const provider = new OpenAIProvider('key', 'model', 'http://localhost:11434/v1/')
    await provider.chat({ messages: [{ role: 'user', content: 'Hi' }], model: '' })

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:11434/v1/chat/completions',
      expect.anything(),
    )
  })

  it('validates key successfully', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true })
    const provider = new OpenAIProvider('good-key', 'gpt-4o')
    expect(await provider.validateKey()).toBe(true)
  })

  it('validates key failure', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false })
    const provider = new OpenAIProvider('bad-key', 'gpt-4o')
    expect(await provider.validateKey()).toBe(false)
  })

  it('handles network error in validateKey', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))
    const provider = new OpenAIProvider('key', 'gpt-4o')
    expect(await provider.validateKey()).toBe(false)
  })

  it('sends tools when provided', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ choices: [{ message: { content: 'OK' } }] }),
    })

    const provider = new OpenAIProvider('key', 'gpt-4o')
    await provider.chat({
      messages: [{ role: 'user', content: 'Hi' }],
      model: '',
      tools: [
        {
          type: 'function',
          function: { name: 'test', description: 'Test tool', parameters: {} },
        },
      ],
    })

    const body = JSON.parse(mockFetch.mock.calls[0][1].body)
    expect(body.tools).toBeDefined()
    expect(body.tool_choice).toBe('auto')
  })

  it('does not send tools when empty', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ choices: [{ message: { content: 'OK' } }] }),
    })

    const provider = new OpenAIProvider('key', 'gpt-4o')
    await provider.chat({
      messages: [{ role: 'user', content: 'Hi' }],
      model: '',
    })

    const body = JSON.parse(mockFetch.mock.calls[0][1].body)
    expect(body.tools).toBeUndefined()
  })
})

describe('AnthropicProvider', () => {
  it('separates system message from conversation', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        content: [{ type: 'text', text: 'Hello' }],
        usage: { input_tokens: 10, output_tokens: 5 },
      }),
    })

    const provider = new AnthropicProvider('sk-ant-test', 'claude-sonnet-4-6')
    await provider.chat({
      messages: [
        { role: 'system', content: 'You are helpful' },
        { role: 'user', content: 'Hi' },
      ],
      model: '',
    })

    const body = JSON.parse(mockFetch.mock.calls[0][1].body)
    expect(body.system).toBe('You are helpful')
    expect(body.messages).toEqual([{ role: 'user', content: 'Hi' }])
  })

  it('sends correct headers', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        content: [{ type: 'text', text: 'OK' }],
        usage: { input_tokens: 1, output_tokens: 1 },
      }),
    })

    const provider = new AnthropicProvider('sk-ant-key', 'claude-sonnet-4-6')
    await provider.chat({
      messages: [{ role: 'user', content: 'Hi' }],
      model: '',
    })

    const headers = mockFetch.mock.calls[0][1].headers
    expect(headers['x-api-key']).toBe('sk-ant-key')
    expect(headers['anthropic-version']).toBe('2023-06-01')
    expect(headers['anthropic-dangerous-direct-browser-access']).toBe('true')
  })

  it('parses tool_use content blocks', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        content: [
          { type: 'text', text: 'Updating plan...' },
          {
            type: 'tool_use',
            name: 'update_plan',
            input: { section: 'overview', data: { name: 'Test' } },
          },
        ],
        usage: { input_tokens: 50, output_tokens: 30 },
      }),
    })

    const provider = new AnthropicProvider('key', 'claude-sonnet-4-6')
    const result = await provider.chat({
      messages: [{ role: 'user', content: 'Hi' }],
      model: '',
    })

    expect(result.content).toBe('Updating plan...')
    expect(result.toolCalls).toHaveLength(1)
    expect(result.toolCalls![0].name).toBe('update_plan')
    expect(JSON.parse(result.toolCalls![0].arguments)).toEqual({
      section: 'overview',
      data: { name: 'Test' },
    })
  })

  it('maps usage correctly', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        content: [{ type: 'text', text: 'OK' }],
        usage: { input_tokens: 200, output_tokens: 100 },
      }),
    })

    const provider = new AnthropicProvider('key', 'claude-sonnet-4-6')
    const result = await provider.chat({
      messages: [{ role: 'user', content: 'Hi' }],
      model: '',
    })

    expect(result.usage).toEqual({ promptTokens: 200, completionTokens: 100, totalTokens: 300 })
  })

  it('throws on API error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 429,
      text: async () => 'Rate limited',
    })

    const provider = new AnthropicProvider('key', 'claude-sonnet-4-6')
    await expect(
      provider.chat({ messages: [{ role: 'user', content: 'Hi' }], model: '' }),
    ).rejects.toThrow('Anthropic API error (429)')
  })
})

describe('createProvider', () => {
  it('creates OpenAI provider', () => {
    const provider = createProvider({
      id: 'openai',
      type: 'openai',
      name: 'OpenAI',
      apiKey: 'key',
      model: 'gpt-4o',
    })
    expect(provider.id).toBe('openai')
  })

  it('creates Anthropic provider', () => {
    const provider = createProvider({
      id: 'anthropic',
      type: 'anthropic',
      name: 'Anthropic',
      apiKey: 'key',
      model: 'claude-sonnet-4-6',
    })
    expect(provider.id).toBe('anthropic')
  })

  it('creates OpenAI-compatible provider', () => {
    const provider = createProvider({
      id: 'local',
      type: 'openai-compatible',
      name: 'Ollama',
      apiKey: 'key',
      model: 'llama3',
      baseUrl: 'http://localhost:11434/v1',
    })
    expect(provider.id).toBe('openai')
  })

  it('throws for unknown type', () => {
    expect(() =>
      createProvider({
        id: 'bad',
        type: 'bad' as 'openai',
        name: 'Bad',
        apiKey: 'key',
        model: 'model',
      }),
    ).toThrow('Unknown provider type')
  })
})
