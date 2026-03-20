export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ChatRequest {
  messages: ChatMessage[]
  model: string
  temperature?: number
  maxTokens?: number
  tools?: ToolDefinition[]
}

export interface ToolDefinition {
  type: 'function'
  function: {
    name: string
    description: string
    parameters: Record<string, unknown>
  }
}

export interface ToolCall {
  name: string
  arguments: string
}

export interface ChatResponse {
  content: string
  toolCalls?: ToolCall[]
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

export interface LLMProvider {
  id: string
  name: string
  chat(request: ChatRequest): Promise<ChatResponse>
  validateKey(): Promise<boolean>
}
