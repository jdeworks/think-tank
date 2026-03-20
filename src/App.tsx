import { useEffect } from 'react'
import { useUIStore } from '@/stores/ui-store'
import { useProjectStore } from '@/stores/project-store'
import { useSettingsStore } from '@/stores/settings-store'
import { HomePage } from '@/components/project/HomePage'
import { ChatPanel } from '@/components/chat/ChatPanel'
import { PlanSidebar } from '@/components/plan/PlanSidebar'
import { PlanView } from '@/components/plan/PlanView'
import { SettingsModal } from '@/components/settings/SettingsModal'
import { loadFromShareUrl } from '@/utils/export'
import { createEmptyPlan } from '@/schema/project-plan'

export default function App() {
  const { view, setView, settingsOpen, setSettingsOpen } = useUIStore()
  const { id } = useProjectStore()
  const provider = useSettingsStore((s) => s.provider)

  useEffect(() => {
    const sharedPlan = loadFromShareUrl()
    if (sharedPlan) {
      const store = useProjectStore.getState()
      store.startNewProject('Imported from shared link')
      const empty = createEmptyPlan()
      for (const key of Object.keys(sharedPlan) as (keyof typeof sharedPlan)[]) {
        if (key === 'meta') continue
        const data = sharedPlan[key]
        if (data && JSON.stringify(data) !== JSON.stringify(empty[key])) {
          store.updatePlanSection(key, data as Record<string, unknown>)
        }
      }
      setView('plan')
      window.history.replaceState(null, '', window.location.pathname)
    }
  }, [setView])

  return (
    <div className="h-screen flex flex-col bg-[var(--bg)]">
      {/* Top bar */}
      <header className="h-14 sm:h-16 border-b border-[var(--border)] bg-[var(--bg)] flex items-center justify-between px-4 lg:px-8 shrink-0 sticky top-0 z-10">
        <button
          onClick={() => setView('home')}
          className="font-bold text-lg text-slate-900 dark:text-slate-100 hover:text-blue-500 transition-colors tracking-tight"
        >
          Think Tank
        </button>
        <div className="flex items-center gap-1">
          {id && view !== 'home' && (
            <>
              <button
                onClick={() => setView('chat')}
                className={`text-sm px-3 py-2.5 rounded-lg font-medium transition-colors min-h-[44px] ${
                  view === 'chat'
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                }`}
              >
                Chat
              </button>
              <button
                onClick={() => setView('plan')}
                className={`text-sm px-3 py-2.5 rounded-lg font-medium transition-colors min-h-[44px] ${
                  view === 'plan'
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                }`}
              >
                Plan
              </button>
            </>
          )}
          <button
            onClick={() => setSettingsOpen(true)}
            className="relative text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
            title="Settings"
            aria-label="Settings"
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
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            {!provider?.apiKey && (
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-amber-500 rounded-full" />
            )}
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {view === 'home' && <HomePage />}

        {view === 'chat' && id && (
          <>
            <PlanSidebar />
            <div className="flex-1 flex flex-col">
              <ChatPanel />
            </div>
          </>
        )}

        {view === 'plan' && id && (
          <>
            <PlanSidebar />
            <PlanView />
          </>
        )}
      </div>

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  )
}
