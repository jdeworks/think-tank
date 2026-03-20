import { useProjectStore } from '@/stores/project-store'
import { PLAN_SECTIONS, SECTION_LABELS } from '@/schema/project-plan'
import { getSectionCompleteness } from '@/engine/section-map'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { useUIStore } from '@/stores/ui-store'
import { ArchitectureDiagram } from './ArchitectureDiagram'
import { MermaidDiagram } from './MermaidDiagram'
import { DiagramSection } from './DiagramSection'
import { componentsToMermaid, dataModelToMermaid, timelineToMermaid } from '@/utils/mermaid-helpers'
import { exportAsJSON, exportAsMarkdown, exportAsZip, createShareUrl } from '@/utils/export'
import { useState } from 'react'

export function PlanView() {
  const { plan, name } = useProjectStore()
  const { setView } = useUIStore()
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [diagramView, setDiagramView] = useState<'flow' | 'interactive'>('interactive')

  const projectName = name || 'project-plan'
  const handleExportJSON = () => exportAsJSON(plan, projectName)
  const handleExportMD = () => exportAsMarkdown(plan, projectName)
  const handleExportZip = () => exportAsZip(plan, projectName)
  const handleShare = () => {
    const url = createShareUrl(plan)
    navigator.clipboard.writeText(url)
    setShareUrl(url)
    setTimeout(() => setShareUrl(null), 3000)
  }

  const hasComponents = plan.architecture.components && plan.architecture.components.length > 0
  const hasDataModel = plan.architecture.dataModel && plan.architecture.dataModel.length > 0
  const hasTimeline = plan.timeline.phases && plan.timeline.phases.length > 0

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto p-4 sm:p-6">
        <PlanHeader
          name={name || plan.overview.name || 'Project Plan'}
          shareUrl={shareUrl}
          onBack={() => setView('chat')}
          onShare={handleShare}
          onExportMD={handleExportMD}
          onExportJSON={handleExportJSON}
          onExportZip={handleExportZip}
        />

        {hasComponents && (
          <ArchitectureSection
            components={plan.architecture.components!}
            diagramView={diagramView}
            onViewChange={setDiagramView}
          />
        )}

        {hasDataModel && (
          <DiagramSection
            title="Data Model"
            chart={dataModelToMermaid(plan.architecture.dataModel!)}
            filename="data-model"
          />
        )}

        {hasTimeline && (
          <DiagramSection
            title="Timeline"
            chart={timelineToMermaid(plan.timeline.phases!)}
            filename="timeline"
          />
        )}

        {PLAN_SECTIONS.map((key) => {
          const completeness = getSectionCompleteness(plan, key)
          const section = plan[key]
          return (
            <div
              key={key}
              className="mb-6 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                <h3 className="font-semibold text-slate-800 dark:text-slate-200">
                  {SECTION_LABELS[key]}
                </h3>
                <Badge value={completeness} size="md" />
              </div>
              <div className="p-4 text-sm text-slate-700 dark:text-slate-300">
                {completeness === 0 ? (
                  <p className="text-slate-400 italic">
                    No data yet — discuss this topic in the chat.
                  </p>
                ) : (
                  <pre className="whitespace-pre-wrap font-sans">{renderSection(section)}</pre>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function PlanHeader({
  name,
  shareUrl,
  onBack,
  onShare,
  onExportMD,
  onExportJSON,
  onExportZip,
}: {
  name: string
  shareUrl: string | null
  onBack: () => void
  onShare: () => void
  onExportMD: () => void
  onExportJSON: () => void
  onExportZip: () => void
}) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-slate-400 hover:text-slate-600 cursor-pointer">
          &larr; Back to Chat
        </button>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{name}</h1>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="ghost" size="sm" onClick={onShare}>
          {shareUrl ? 'Copied!' : 'Share'}
        </Button>
        <Button variant="secondary" size="sm" onClick={onExportZip}>
          Download ZIP
        </Button>
        <Button variant="ghost" size="sm" onClick={onExportMD}>
          .md
        </Button>
        <Button variant="ghost" size="sm" onClick={onExportJSON}>
          .json
        </Button>
      </div>
    </div>
  )
}

function ArchitectureSection({
  components,
  diagramView,
  onViewChange,
}: {
  components: Array<{ name: string; description: string; connections?: string[] }>
  diagramView: 'flow' | 'interactive'
  onViewChange: (v: 'flow' | 'interactive') => void
}) {
  const chart = componentsToMermaid(components)
  return (
    <DiagramSection title="Architecture Overview" chart={chart} filename="architecture">
      <div className="flex justify-end mb-2">
        <div className="flex gap-1 bg-slate-100 dark:bg-slate-700 rounded-lg p-0.5">
          <button
            onClick={() => onViewChange('interactive')}
            className={`px-3 py-1 text-xs rounded-md transition-colors ${diagramView === 'interactive' ? 'bg-white dark:bg-slate-600 shadow-sm text-slate-900 dark:text-slate-100' : 'text-slate-500'}`}
          >
            Interactive
          </button>
          <button
            onClick={() => onViewChange('flow')}
            className={`px-3 py-1 text-xs rounded-md transition-colors ${diagramView === 'flow' ? 'bg-white dark:bg-slate-600 shadow-sm text-slate-900 dark:text-slate-100' : 'text-slate-500'}`}
          >
            Flowchart
          </button>
        </div>
      </div>
      {diagramView === 'interactive' ? (
        <ArchitectureDiagram components={components} />
      ) : (
        <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-white dark:bg-slate-800">
          <MermaidDiagram chart={chart} />
        </div>
      )}
    </DiagramSection>
  )
}

function renderSection(section: unknown): string {
  if (Array.isArray(section)) {
    if (section.length === 0) return 'No items yet.'
    return section
      .map((item, i) => {
        if (typeof item === 'string') return `\u2022 ${item}`
        return `${i + 1}. ${JSON.stringify(item, null, 2)}`
      })
      .join('\n\n')
  }
  if (typeof section === 'object' && section !== null) {
    return Object.entries(section)
      .filter(([, v]) => v !== undefined && v !== null && v !== '')
      .map(([k, v]) => {
        const label = k.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())
        if (typeof v === 'string') return `${label}: ${v}`
        if (Array.isArray(v)) {
          if (v.length === 0) return null
          return `${label}:\n${v.map((item) => (typeof item === 'string' ? `  \u2022 ${item}` : `  \u2022 ${JSON.stringify(item)}`)).join('\n')}`
        }
        if (typeof v === 'object' && v !== null) {
          return `${label}:\n${Object.entries(v)
            .filter(([, nv]) => nv !== undefined && nv !== null)
            .map(([nk, nv]) => `  ${nk}: ${nv}`)
            .join('\n')}`
        }
        return `${label}: ${String(v)}`
      })
      .filter(Boolean)
      .join('\n\n')
  }
  return String(section)
}
