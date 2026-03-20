import { useState } from 'react'
import { useProjectStore } from '@/stores/project-store'
import { useSettingsStore } from '@/stores/settings-store'
import { useUIStore } from '@/stores/ui-store'
import { PERSONALITY_INFO } from '@/schema/settings'
import { EXAMPLE_TEMPLATES } from '@/data/example-templates'
import { ProjectList } from './ProjectList'
import { ImportButton } from '@/components/export/ImportButton'
import { Button } from '@/components/common/Button'

export function HomePage() {
  const [idea, setIdea] = useState('')
  const startNewProject = useProjectStore((s) => s.startNewProject)
  const { provider, personality } = useSettingsStore()
  const { setView, setSettingsOpen } = useUIStore()

  const handleStart = (text?: string) => {
    const projectIdea = text || idea.trim()
    if (!projectIdea) return
    if (!provider) {
      setSettingsOpen(true)
      return
    }
    startNewProject(projectIdea)
    setView('chat')
  }

  const personalityInfo = PERSONALITY_INFO[personality]

  return (
    <div className="flex-1 flex flex-col items-center justify-start pt-8 sm:pt-16 px-4 lg:px-8 pb-8 bg-[var(--bg)]">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-4 tracking-tight">
            Think Tank
          </h1>
          <p className="text-lg sm:text-xl text-slate-500 dark:text-slate-400 leading-8">
            Turn your idea into a structured project plan.
          </p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-2">
            Powered by AI — your API key, your data, all local.
          </p>
        </div>

        {/* Idea input */}
        <div className="mb-4">
          <textarea
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder='Describe your project idea... e.g. "I want to build a recipe sharing app where users can upload photos of their meals and get AI-generated recipes"'
            rows={4}
            className="w-full border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-3 text-base bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none min-h-[120px] transition-colors"
          />
        </div>

        {/* Status bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-3">
          <div className="flex items-center gap-3 text-sm flex-wrap">
            {provider ? (
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 bg-emerald-500 rounded-full inline-block animate-pulse" />
                {provider.name} ({provider.model})
              </span>
            ) : (
              <button
                onClick={() => setSettingsOpen(true)}
                className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-medium"
              >
                Set up your AI provider to get started
              </button>
            )}
            <span className="text-slate-300 dark:text-slate-600 hidden sm:inline">|</span>
            <span className="text-slate-500 dark:text-slate-400">
              {personalityInfo.emoji} {personalityInfo.label}
            </span>
          </div>
          <div className="flex gap-3">
            <ImportButton />
            <Button onClick={() => handleStart()} disabled={!idea.trim()} size="lg">
              Start Planning
            </Button>
          </div>
        </div>

        {/* How it works */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10 text-center">
          {[
            { step: '1', title: 'Share Your Idea', desc: 'Describe what you want to build' },
            { step: '2', title: 'Answer Questions', desc: 'AI guides you through key decisions' },
            { step: '3', title: 'Get Your Plan', desc: 'Export a complete project blueprint' },
          ].map((item) => (
            <div key={item.step} className="p-5">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-base">
                {item.step}
              </div>
              <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                {item.title}
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">{item.desc}</div>
            </div>
          ))}
        </div>

        {/* Example templates */}
        <div className="mb-10">
          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
            Or start from an example
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {EXAMPLE_TEMPLATES.map((template) => (
              <button
                key={template.id}
                onClick={() => handleStart(template.idea)}
                className="group text-left p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200"
              >
                <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {template.title}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {template.description}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Saved projects */}
        <ProjectList />
      </div>
    </div>
  )
}
