import type { Message } from '@/schema/conversation'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis'
import { useSettingsStore } from '@/stores/settings-store'

interface MessageBubbleProps {
  message: Message
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user'
  const { isSupported: ttsSupported, isSpeaking, speak, stop } = useSpeechSynthesis()
  const voiceEnabled = useSettingsStore((s) => s.voiceEnabled)

  const showSpeaker = !isUser && voiceEnabled && ttsSupported

  const handleSpeak = () => {
    if (isSpeaking) {
      stop()
    } else {
      speak(message.content)
    }
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-5 py-3 text-sm leading-relaxed ${
          isUser
            ? 'bg-blue-500 text-white rounded-br-md shadow-sm'
            : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-md'
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0.5 prose-headings:my-2 dark:prose-invert">
            <Markdown remarkPlugins={[remarkGfm]}>{message.content}</Markdown>
          </div>
        )}

        {/* Speaker button for assistant messages */}
        {showSpeaker && (
          <button
            onClick={handleSpeak}
            aria-label={isSpeaking ? 'Stop speaking' : 'Read aloud'}
            className={`mt-2 inline-flex items-center gap-1.5 text-xs rounded-md px-2 py-1 transition-colors ${
              isSpeaking
                ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {isSpeaking ? (
                <>
                  <rect x="6" y="4" width="4" height="16" />
                  <rect x="14" y="4" width="4" height="16" />
                </>
              ) : (
                <>
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                </>
              )}
            </svg>
            {isSpeaking ? 'Stop' : 'Listen'}
          </button>
        )}
      </div>
    </div>
  )
}
