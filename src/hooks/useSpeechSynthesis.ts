import { useState, useCallback, useRef, useEffect } from 'react'

export function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window

  const speak = useCallback(
    (text: string) => {
      if (!isSupported) return

      // Cancel any ongoing speech
      window.speechSynthesis.cancel()

      // Strip markdown formatting for cleaner speech
      const cleaned = text
        .replace(/#{1,6}\s/g, '') // headings
        .replace(/\*\*([^*]+)\*\*/g, '$1') // bold
        .replace(/\*([^*]+)\*/g, '$1') // italic
        .replace(/```[\s\S]*?```/g, '') // code blocks (before inline code)
        .replace(/`([^`]+)`/g, '$1') // inline code
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links
        .replace(/^[-*]\s/gm, '') // list bullets
        .replace(/^\d+\.\s/gm, '') // numbered lists
        .replace(/\n{2,}/g, '. ') // paragraphs to pauses
        .replace(/\n/g, ' ')
        .trim()

      if (!cleaned) return

      const utterance = new SpeechSynthesisUtterance(cleaned)
      utteranceRef.current = utterance

      // Use a natural voice if available
      const voices = window.speechSynthesis.getVoices()
      const preferredVoice = voices.find(
        (v) => v.lang.startsWith(navigator.language.slice(0, 2)) && v.localService,
      )
      if (preferredVoice) {
        utterance.voice = preferredVoice
      }

      utterance.rate = 1.0
      utterance.pitch = 1.0

      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)

      window.speechSynthesis.speak(utterance)
    },
    [isSupported],
  )

  const stop = useCallback(() => {
    if (!isSupported) return
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }, [isSupported])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isSupported) {
        window.speechSynthesis.cancel()
      }
    }
  }, [isSupported])

  return {
    isSupported,
    isSpeaking,
    speak,
    stop,
  }
}
