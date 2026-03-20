import {
  SECTION_LABELS,
  ProjectPlanSchema,
  type ProjectPlan,
  type PlanSectionKey,
} from '@/schema/project-plan'
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string'
import JSZip from 'jszip'
import { componentsToMermaid, dataModelToMermaid, timelineToMermaid } from './mermaid-helpers'
import { fetchMermaidSvg } from './mermaid-render'

export function exportAsJSON(plan: ProjectPlan, filename: string) {
  const json = JSON.stringify(plan, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  downloadBlob(blob, `${filename}.json`)
}

export function exportAsMarkdown(plan: ProjectPlan, filename: string) {
  const md = planToMarkdown(plan)
  const blob = new Blob([md], { type: 'text/markdown' })
  downloadBlob(blob, `${filename}.md`)
}

export async function exportAsZip(plan: ProjectPlan, filename: string) {
  const zip = new JSZip()

  zip.file('plan.json', JSON.stringify(plan, null, 2))
  zip.file('plan.md', planToMarkdown(plan))

  // Generate and add SVG diagrams
  if (plan.architecture.components?.length) {
    const svg = await fetchMermaidSvg(componentsToMermaid(plan.architecture.components))
    if (svg) zip.file('architecture.svg', svg)
  }
  if (plan.architecture.dataModel?.length) {
    const svg = await fetchMermaidSvg(dataModelToMermaid(plan.architecture.dataModel))
    if (svg) zip.file('data-model.svg', svg)
  }
  if (plan.timeline.phases?.length) {
    const svg = await fetchMermaidSvg(timelineToMermaid(plan.timeline.phases))
    if (svg) zip.file('timeline.svg', svg)
  }

  const blob = await zip.generateAsync({ type: 'blob' })
  downloadBlob(blob, `${filename}.zip`)
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function importFromJSON(file: File): Promise<ProjectPlan> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const raw = JSON.parse(reader.result as string)
        const result = ProjectPlanSchema.safeParse(raw)
        if (!result.success) {
          reject(new Error(`Invalid project plan: ${result.error.message}`))
          return
        }
        resolve(result.data)
      } catch {
        reject(new Error('Invalid JSON file'))
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}

export function createShareUrl(plan: ProjectPlan): string {
  const compressed = compressToEncodedURIComponent(JSON.stringify(plan))
  const base = window.location.href.split('#')[0]
  return `${base}#plan=${compressed}`
}

export function loadFromShareUrl(): ProjectPlan | null {
  const hash = window.location.hash
  if (!hash.startsWith('#plan=')) return null
  try {
    const compressed = hash.slice(6)
    const json = decompressFromEncodedURIComponent(compressed)
    if (!json) return null
    const raw = JSON.parse(json)
    const result = ProjectPlanSchema.safeParse(raw)
    if (!result.success) {
      console.error(`Invalid shared plan: ${result.error.message}`)
      return null
    }
    return result.data
  } catch {
    return null
  }
}

function planToMarkdown(plan: ProjectPlan): string {
  const lines: string[] = []

  lines.push(`# ${plan.overview.name || 'Project Plan'}`)
  lines.push('')

  if (plan.overview.description) {
    lines.push(`> ${plan.overview.description}`)
    lines.push('')
  }

  const sections: [PlanSectionKey, (p: ProjectPlan) => string][] = [
    ['overview', renderOverview],
    ['requirements', renderRequirements],
    ['architecture', renderArchitecture],
    ['techStack', renderTechStack],
    ['hosting', renderHosting],
    ['security', renderSecurity],
    ['design', renderDesign],
    ['budget', renderBudget],
    ['timeline', renderTimeline],
    ['risks', renderRisks],
    ['competitors', renderCompetitors],
  ]

  for (const [key, renderer] of sections) {
    const content = renderer(plan)
    if (content) {
      lines.push(`## ${SECTION_LABELS[key]}`)
      lines.push('')
      lines.push(content)
      lines.push('')
    }
  }

  return lines.join('\n')
}

function renderOverview(plan: ProjectPlan): string {
  const o = plan.overview
  const parts: string[] = []
  if (o.problemStatement) parts.push(`**Problem:** ${o.problemStatement}`)
  if (o.goals?.length) parts.push(`**Goals:**\n${o.goals.map((g) => `- ${g}`).join('\n')}`)
  if (o.nonGoals?.length)
    parts.push(`**Non-Goals:**\n${o.nonGoals.map((g) => `- ${g}`).join('\n')}`)
  if (o.targetUsers) parts.push(`**Target Users:** ${o.targetUsers}`)
  if (o.successMetrics?.length)
    parts.push(`**Success Metrics:**\n${o.successMetrics.map((m) => `- ${m}`).join('\n')}`)
  return parts.join('\n\n')
}

function renderRequirements(plan: ProjectPlan): string {
  const r = plan.requirements
  const parts: string[] = []
  if (r.functional?.length) {
    parts.push('**Functional Requirements:**')
    for (const req of r.functional) {
      parts.push(`- [${req.priority.toUpperCase()}] ${req.description}`)
    }
  }
  if (r.nonFunctional?.length)
    parts.push(`**Non-Functional:**\n${r.nonFunctional.map((n) => `- ${n}`).join('\n')}`)
  if (r.constraints?.length)
    parts.push(`**Constraints:**\n${r.constraints.map((c) => `- ${c}`).join('\n')}`)
  return parts.join('\n\n')
}

function renderArchitecture(plan: ProjectPlan): string {
  const a = plan.architecture
  const parts: string[] = []
  if (a.systemType) parts.push(`**Type:** ${a.systemType}`)
  if (a.pattern) parts.push(`**Pattern:** ${a.pattern}`)
  if (a.apiDesign) parts.push(`**API:** ${a.apiDesign}`)
  if (a.components?.length) {
    parts.push('**Components:**')
    for (const c of a.components) {
      parts.push(`- **${c.name}:** ${c.description}`)
    }
  }
  if (a.dataModel?.length) {
    parts.push('**Data Model:**')
    for (const e of a.dataModel) {
      parts.push(`- **${e.entity}:** ${e.fields.join(', ')}`)
    }
  }
  return parts.join('\n\n')
}

function renderTechStack(plan: ProjectPlan): string {
  const t = plan.techStack
  const parts: string[] = []
  if (t.frontend)
    parts.push(
      `**Frontend:** ${[t.frontend.framework, t.frontend.uiLibrary, t.frontend.stateManagement].filter(Boolean).join(' + ')}`,
    )
  if (t.backend)
    parts.push(
      `**Backend:** ${[t.backend.language, t.backend.framework].filter(Boolean).join(' / ')}`,
    )
  if (t.database)
    parts.push(`**Database:** ${[t.database.type, t.database.product].filter(Boolean).join(' - ')}`)
  if (t.infrastructure) parts.push(`**Infrastructure:** ${t.infrastructure}`)
  if (t.rationale) parts.push(`**Rationale:** ${t.rationale}`)
  return parts.join('\n\n')
}

function renderHosting(plan: ProjectPlan): string {
  const h = plan.hosting
  const parts: string[] = []
  if (h.platform) parts.push(`**Platform:** ${h.platform}`)
  if (h.cicd) parts.push(`**CI/CD:** ${h.cicd}`)
  if (h.environments?.length) parts.push(`**Environments:** ${h.environments.join(', ')}`)
  if (h.domain) parts.push(`**Domain:** ${h.domain}`)
  if (h.estimatedMonthlyCost) parts.push(`**Estimated Cost:** ${h.estimatedMonthlyCost}/month`)
  return parts.join('\n\n')
}

function renderSecurity(plan: ProjectPlan): string {
  const s = plan.security
  const parts: string[] = []
  if (s.authentication) parts.push(`**Auth:** ${s.authentication}`)
  if (s.authorization) parts.push(`**Authorization:** ${s.authorization}`)
  if (s.dataEncryption) parts.push(`**Encryption:** ${s.dataEncryption}`)
  if (s.knownRisks?.length)
    parts.push(`**Risks:**\n${s.knownRisks.map((r) => `- ${r}`).join('\n')}`)
  if (s.compliance?.length) parts.push(`**Compliance:** ${s.compliance.join(', ')}`)
  return parts.join('\n\n')
}

function renderDesign(plan: ProjectPlan): string {
  const d = plan.design
  const parts: string[] = []
  if (d.designSystem) parts.push(`**Design System:** ${d.designSystem}`)
  if (d.keyUserFlows?.length)
    parts.push(`**Key Flows:**\n${d.keyUserFlows.map((f) => `- ${f}`).join('\n')}`)
  if (d.responsiveStrategy) parts.push(`**Responsive:** ${d.responsiveStrategy}`)
  if (d.accessibilityLevel) parts.push(`**Accessibility:** ${d.accessibilityLevel}`)
  return parts.join('\n\n')
}

function renderBudget(plan: ProjectPlan): string {
  const b = plan.budget
  const parts: string[] = []
  if (b.developmentEffort) parts.push(`**Dev Effort:** ${b.developmentEffort}`)
  if (b.infrastructureCosts) parts.push(`**Infrastructure:** ${b.infrastructureCosts}`)
  if (b.thirdPartyCosts?.length) {
    parts.push('**Third-Party Costs:**')
    for (const c of b.thirdPartyCosts) {
      parts.push(`- ${c.service}: ${c.cost}`)
    }
  }
  if (b.totalEstimate) parts.push(`**Total:** ${b.totalEstimate}`)
  return parts.join('\n\n')
}

function renderTimeline(plan: ProjectPlan): string {
  const t = plan.timeline
  const parts: string[] = []
  if (t.phases?.length) {
    for (const p of t.phases) {
      parts.push(`### ${p.name} (${p.duration})`)
      parts.push(p.description)
      parts.push(p.deliverables.map((d) => `- ${d}`).join('\n'))
    }
  }
  if (t.milestones?.length) {
    parts.push('### Milestones')
    for (const m of t.milestones) {
      parts.push(`- **${m.name}**${m.targetDate ? ` (${m.targetDate})` : ''}: ${m.description}`)
    }
  }
  return parts.join('\n\n')
}

function renderRisks(plan: ProjectPlan): string {
  if (!plan.risks.length) return ''
  const header = '| Category | Description | Impact | Likelihood | Mitigation |'
  const separator = '| --- | --- | --- | --- | --- |'
  const rows = plan.risks
    .map(
      (r) =>
        `| ${r.category} | ${r.description} | ${r.impact} | ${r.likelihood} | ${r.mitigation} |`,
    )
    .join('\n')
  return `${header}\n${separator}\n${rows}`
}

function renderCompetitors(plan: ProjectPlan): string {
  if (!plan.competitors.length) return ''
  return plan.competitors
    .map((c) => {
      const parts = [`### ${c.name}${c.url ? ` (${c.url})` : ''}`]
      parts.push(c.description)
      if (c.strengths.length) parts.push(`**Strengths:** ${c.strengths.join(', ')}`)
      if (c.weaknesses.length) parts.push(`**Weaknesses:** ${c.weaknesses.join(', ')}`)
      return parts.join('\n')
    })
    .join('\n\n')
}
