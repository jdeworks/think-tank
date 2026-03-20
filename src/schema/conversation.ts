import { z } from 'zod/v4'

const MessageRole = z.enum(['user', 'assistant', 'system'])

export const MessageSchema = z.object({
  id: z.string(),
  role: MessageRole,
  content: z.string(),
  timestamp: z.string(),
})

export type Message = z.infer<typeof MessageSchema>

export function createMessage(role: 'user' | 'assistant' | 'system', content: string): Message {
  return {
    id: crypto.randomUUID(),
    role,
    content,
    timestamp: new Date().toISOString(),
  }
}
