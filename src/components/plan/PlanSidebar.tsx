import { useProjectStore } from '@/stores/project-store'
import { PLAN_SECTIONS, getAdaptiveLabels } from '@/schema/project-plan'
import { getSectionCompleteness, getOverallCompleteness } from '@/engine/section-map'
import { Badge } from '@/components/common/Badge'
import { useUIStore } from '@/stores/ui-store'

export function PlanSidebar() {
  const { plan, name } = useProjectStore()
  const { sidebarOpen, toggleSidebar, setView } = useUIStore()
  const overall = getOverallCompleteness(plan)
  const labels = getAdaptiveLabels(plan)

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed bottom-4 left-4 z-40 bg-blue-500 text-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-lg hover:bg-blue-600 active:scale-[0.98] transition-all"
        aria-label="Toggle sidebar"
      >
        {sidebarOpen ? '\u2715' : '\u2630'}
      </button>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/30 backdrop-blur-xs z-30"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed lg:relative z-30 lg:z-auto
        w-60 bg-[var(--bg-alt)] border-r border-[var(--border)] flex flex-col h-full
        transition-transform duration-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
      >
        <div className="p-4 border-b border-[var(--border)]">
          <h2 className="font-semibold text-slate-900 dark:text-slate-100 text-sm truncate">
            {name || plan.overview.name || 'New Project'}
          </h2>
          <div className="mt-3">
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
              <span>Overall Progress</span>
              <span className="font-semibold tabular-nums">{overall}%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${overall}%` }}
              />
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-2 space-y-1">
          {PLAN_SECTIONS.map((key) => {
            const completeness = getSectionCompleteness(plan, key)
            return (
              <button
                key={key}
                onClick={() => {
                  setView('plan')
                  if (window.innerWidth < 1024) toggleSidebar()
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-left hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
              >
                <span
                  className={
                    completeness > 0
                      ? 'text-slate-800 dark:text-slate-200'
                      : 'text-slate-400 dark:text-slate-500'
                  }
                >
                  {labels[key]}
                </span>
                <Badge value={completeness} />
              </button>
            )
          })}
        </nav>

        <div className="p-3 border-t border-[var(--border)]">
          <button
            onClick={() => {
              setView('plan')
              if (window.innerWidth < 1024) toggleSidebar()
            }}
            className="w-full text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold py-2.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors min-h-[44px]"
          >
            View Full Plan
          </button>
        </div>
      </div>
    </>
  )
}
