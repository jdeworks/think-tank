import { useState, useCallback, useRef, useEffect } from 'react'

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
  message: string
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  abort(): void
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
  onstart: (() => void) | null
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance
    webkitSpeechRecognition: new () => SpeechRecognitionInstance
  }
}

export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const isSupported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current)
      silenceTimerRef.current = null
    }
  }, [])

  const stop = useCallback(() => {
    clearSilenceTimer()
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsListening(false)
    setInterimTranscript('')
  }, [clearSilenceTimer])

  const start = useCallback(() => {
    if (!isSupported) {
      setError('Speech recognition is not supported in this browser. Try Chrome or Edge.')
      return
    }

    setError(null)
    setTranscript('')
    setInterimTranscript('')

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognitionRef.current = recognition

    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = navigator.language || 'en-US'

    let finalTranscript = ''

    recognition.onstart = () => {
      setIsListening(true)
    }

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      clearSilenceTimer()

      let interim = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          finalTranscript += result[0].transcript + ' '
        } else {
          interim += result[0].transcript
        }
      }

      setTranscript(finalTranscript.trim())
      setInterimTranscript(interim)

      // Auto-stop after 3 seconds of silence
      silenceTimerRef.current = setTimeout(() => {
        stop()
      }, 3000)
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === 'no-speech') {
        // Not a real error — just no speech detected yet
        return
      }
      if (event.error === 'aborted') {
        return
      }
      setError(`Speech recognition error: ${event.error}`)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
      setInterimTranscript('')
      clearSilenceTimer()
    }

    recognition.start()
  }, [isSupported, stop, clearSilenceTimer])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearSilenceTimer()
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
    }
  }, [clearSilenceTimer])

  return {
    isSupported,
    isListening,
    transcript,
    interimTranscript,
    error,
    start,
    stop,
  }
}
