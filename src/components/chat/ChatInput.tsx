import { useState, useRef, useEffect, useMemo } from 'react'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'
import { useSettingsStore } from '@/stores/settings-store'

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
  placeholder?: string
}

function MicButton({
  isListening,
  disabled,
  onClick,
}: {
  isListening: boolean
  disabled: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={isListening ? 'Stop recording' : 'Start recording'}
      className={`rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center transition-all duration-150 shrink-0 ${
        isListening
          ? 'bg-red-500 text-white shadow-sm animate-pulse'
          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
      } disabled:opacity-40 disabled:cursor-not-allowed`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" x2="12" y1="19" y2="22" />
      </svg>
    </button>
  )
}

export function ChatInput({
  onSend,
  disabled,
  placeholder = 'Type your answer...',
}: ChatInputProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const voiceInputEnabled = useSettingsStore((s) => s.voiceInputEnabled)
  const prevListeningRef = useRef(false)

  const {
    isSupported: voiceSupported,
    isListening,
    transcript,
    interimTranscript,
    error: voiceError,
    start: startListening,
    stop: stopListening,
  } = useSpeechRecognition()

  // Derive the display value from voice state rather than using setState in effect
  const displayValue = useMemo(() => {
    if (isListening) return `${transcript} ${interimTranscript}`.trim()
    return value
  }, [isListening, transcript, interimTranscript, value])

  // Auto-send when recording stops with a transcript (transition from listening→not)
  useEffect(() => {
    if (prevListeningRef.current && !isListening && transcript.trim()) {
      const timer = setTimeout(() => {
        onSend(transcript.trim())
      }, 500)
      return () => clearTimeout(timer)
    }
    prevListeningRef.current = isListening
  }, [isListening, transcript, onSend])

  useEffect(() => {
    if (!disabled && textareaRef.current) textareaRef.current.focus()
  }, [disabled])

  const handleSubmit = () => {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const showMic = voiceInputEnabled && voiceSupported

  return (
    <div className="border-t border-[var(--border)] p-4 bg-white dark:bg-slate-800">
      {voiceError && (
        <div className="max-w-3xl mx-auto mb-2 text-xs text-red-500">{voiceError}</div>
      )}
      {isListening && interimTranscript && (
        <div className="max-w-3xl mx-auto mb-2 text-sm text-slate-400 dark:text-slate-500 italic">
          {interimTranscript}...
        </div>
      )}
      <div className="flex gap-3 items-end max-w-3xl mx-auto">
        {showMic && (
          <MicButton
            isListening={isListening}
            disabled={Boolean(disabled)}
            onClick={isListening ? stopListening : startListening}
          />
        )}
        <textarea
          ref={textareaRef}
          value={displayValue}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isListening ? 'Listening...' : placeholder}
          disabled={disabled || isListening}
          rows={1}
          className="flex-1 resize-none rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-2.5 text-base bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-400 min-h-[44px] transition-colors"
          style={{ maxHeight: '120px' }}
          onInput={(e) => {
            const t = e.target as HTMLTextAreaElement
            t.style.height = 'auto'
            t.style.height = Math.min(t.scrollHeight, 120) + 'px'
          }}
        />
        <button
          onClick={handleSubmit}
          disabled={disabled || !value.trim() || isListening}
          className="rounded-lg bg-blue-500 text-white px-5 py-2.5 text-sm font-semibold hover:bg-blue-600 active:bg-blue-700 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 shrink-0 min-h-[44px] shadow-sm"
        >
          Send
        </button>
      </div>
    </div>
  )
}
