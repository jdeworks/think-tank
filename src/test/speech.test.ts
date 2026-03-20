import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis'

// Mock SpeechRecognition
class MockSpeechRecognition {
  continuous = false
  interimResults = false
  lang = ''
  onresult: ((event: unknown) => void) | null = null
  onerror: ((event: unknown) => void) | null = null
  onend: (() => void) | null = null
  onstart: (() => void) | null = null

  start() {
    this.onstart?.()
  }

  stop() {
    this.onend?.()
  }

  abort() {
    this.onend?.()
  }
}

// Mock SpeechSynthesis
const mockCancel = vi.fn()
const mockSpeak = vi.fn()
const mockGetVoices = vi.fn(() => [])

beforeEach(() => {
  vi.clearAllMocks()
  mockCancel.mockClear()
  mockSpeak.mockClear()
})

describe('useSpeechRecognition', () => {
  beforeEach(() => {
    // @ts-expect-error - mocking browser API
    window.webkitSpeechRecognition = MockSpeechRecognition
  })

  it('reports supported when SpeechRecognition exists', () => {
    const { result } = renderHook(() => useSpeechRecognition())
    expect(result.current.isSupported).toBe(true)
  })

  it('reports not supported when SpeechRecognition missing', () => {
    // @ts-expect-error - removing mock
    delete window.webkitSpeechRecognition
    // @ts-expect-error - removing mock
    delete window.SpeechRecognition

    const { result } = renderHook(() => useSpeechRecognition())
    expect(result.current.isSupported).toBe(false)
  })

  it('starts with idle state', () => {
    const { result } = renderHook(() => useSpeechRecognition())
    expect(result.current.isListening).toBe(false)
    expect(result.current.transcript).toBe('')
    expect(result.current.interimTranscript).toBe('')
    expect(result.current.error).toBeNull()
  })

  it('sets isListening to true when started', () => {
    const { result } = renderHook(() => useSpeechRecognition())

    act(() => {
      result.current.start()
    })

    expect(result.current.isListening).toBe(true)
  })

  it('sets isListening to false when stopped', () => {
    const { result } = renderHook(() => useSpeechRecognition())

    act(() => {
      result.current.start()
    })
    expect(result.current.isListening).toBe(true)

    act(() => {
      result.current.stop()
    })
    expect(result.current.isListening).toBe(false)
  })

  it('sets error when not supported and start is called', () => {
    // @ts-expect-error - removing mock
    delete window.webkitSpeechRecognition
    // @ts-expect-error - removing mock
    delete window.SpeechRecognition

    const { result } = renderHook(() => useSpeechRecognition())

    act(() => {
      result.current.start()
    })

    expect(result.current.error).toContain('not supported')
  })
})

describe('useSpeechSynthesis', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'speechSynthesis', {
      value: {
        cancel: mockCancel,
        speak: mockSpeak,
        getVoices: mockGetVoices,
      },
      writable: true,
      configurable: true,
    })
  })

  it('reports supported when speechSynthesis exists', () => {
    const { result } = renderHook(() => useSpeechSynthesis())
    expect(result.current.isSupported).toBe(true)
  })

  it('starts not speaking', () => {
    const { result } = renderHook(() => useSpeechSynthesis())
    expect(result.current.isSpeaking).toBe(false)
  })

  it('calls speechSynthesis.cancel when stop is called', () => {
    const { result } = renderHook(() => useSpeechSynthesis())

    act(() => {
      result.current.stop()
    })

    expect(mockCancel).toHaveBeenCalled()
  })

  it('calls speechSynthesis.speak with cleaned text', () => {
    const { result } = renderHook(() => useSpeechSynthesis())

    act(() => {
      result.current.speak('Hello **world**')
    })

    expect(mockCancel).toHaveBeenCalled()
    expect(mockSpeak).toHaveBeenCalledOnce()

    const utterance = mockSpeak.mock.calls[0][0]
    expect(utterance).toBeInstanceOf(SpeechSynthesisUtterance)
    // Bold markdown should be stripped
    expect(utterance.text).toBe('Hello world')
  })

  it('strips markdown headings', () => {
    const { result } = renderHook(() => useSpeechSynthesis())

    act(() => {
      result.current.speak('## Heading\nSome text')
    })

    const utterance = mockSpeak.mock.calls[0][0]
    expect(utterance.text).not.toContain('##')
    expect(utterance.text).toContain('Heading')
    expect(utterance.text).toContain('Some text')
  })

  it('strips code blocks', () => {
    const { result } = renderHook(() => useSpeechSynthesis())
    const codeBlock = 'Before\n```\nconst x = 1\n```\nAfter'

    act(() => {
      result.current.speak(codeBlock)
    })

    const utterance = mockSpeak.mock.calls[0][0]
    expect(utterance.text).not.toContain('const x')
    expect(utterance.text).toContain('Before')
    expect(utterance.text).toContain('After')
  })

  it('does not speak empty text', () => {
    const { result } = renderHook(() => useSpeechSynthesis())

    act(() => {
      result.current.speak('')
    })

    expect(mockSpeak).not.toHaveBeenCalled()
  })

  it('cancels before cleanup on unmount', () => {
    const { unmount } = renderHook(() => useSpeechSynthesis())
    unmount()
    expect(mockCancel).toHaveBeenCalled()
  })
})
