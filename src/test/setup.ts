import '@testing-library/jest-dom/vitest'

// Mock crypto.randomUUID for test determinism
let uuidCounter = 0
Object.defineProperty(globalThis.crypto, 'randomUUID', {
  value: () => `test-uuid-${++uuidCounter}`,
  writable: true,
})

// Reset UUID counter between tests
beforeEach(() => {
  uuidCounter = 0
})

// Mock SpeechSynthesisUtterance (not available in jsdom)
class MockSpeechSynthesisUtterance {
  text: string
  voice: unknown = null
  rate = 1
  pitch = 1
  onstart: (() => void) | null = null
  onend: (() => void) | null = null
  onerror: (() => void) | null = null
  constructor(text: string) {
    this.text = text
  }
}
Object.defineProperty(globalThis, 'SpeechSynthesisUtterance', {
  value: MockSpeechSynthesisUtterance,
  writable: true,
})

// Mock localforage
vi.mock('localforage', () => {
  const store = new Map<string, unknown>()
  return {
    default: {
      createInstance: () => ({
        getItem: vi.fn(async (key: string) => store.get(key) ?? null),
        setItem: vi.fn(async (key: string, value: unknown) => {
          store.set(key, value)
        }),
        removeItem: vi.fn(async (key: string) => {
          store.delete(key)
        }),
        iterate: vi.fn(async (cb: (value: unknown, key: string) => void) => {
          store.forEach((value, key) => cb(value, key))
        }),
        clear: vi.fn(async () => store.clear()),
      }),
    },
  }
})
