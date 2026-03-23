import { type ProjectPlan, isFoundationComplete } from '@/schema/project-plan'

type Lines = string[]

function section(lines: Lines, heading: string, body: () => void) {
  const before = lines.length
  body()
  if (lines.length > before) {
    lines.splice(before, 0, `## ${heading}`, '')
    lines.push('')
  }
}

function field(lines: Lines, label: string, value: string | undefined) {
  if (value) lines.push(`**${label}:** ${value}`)
}

function list(lines: Lines, items: string[] | undefined, prefix = '- ') {
  if (items?.length) {
    for (const item of items) lines.push(`${prefix}${item}`)
  }
}

/** One-page summary — the essentials for stakeholders or a pitch. */
export function generateOnePageSummary(plan: ProjectPlan): string {
  const lines: Lines = []
  lines.push(`# ${plan.overview.name || 'Untitled Project'} — One-Page Summary`, '')

  if (plan.overview.description) lines.push(`> ${plan.overview.description}`, '')

  const u = plan.foundation?.primaryUser
  section(lines, 'Who is this for?', () => {
    if (!u?.description) return
    lines.push(u.description)
    field(lines, '\n**First success', u.firstSuccessAction)
    field(lines, '\n**Design filter', plan.foundation?.designFilter)
  })

  section(lines, 'Problem', () => {
    if (plan.overview.problemStatement) lines.push(plan.overview.problemStatement)
  })

  section(lines, 'Goals', () => list(lines, plan.overview.goals))

  section(lines, 'How it works', () => {
    field(lines, 'Type', plan.architecture.systemType)
    field(lines, 'Pattern', plan.architecture.pattern)
  })

  section(lines, 'Budget', () => field(lines, 'Total estimate', plan.budget.totalEstimate))

  section(lines, 'Timeline', () => {
    for (const p of plan.timeline.phases ?? []) lines.push(`- **${p.name}** (${p.duration})`)
  })

  section(lines, 'Top Risks', () => {
    for (const r of plan.risks.slice(0, 3)) lines.push(`- **${r.impact} impact:** ${r.description}`)
  })

  return lines.join('\n')
}

/** Implementation handoff — everything an agent or developer needs to start. */
export function generateHandoff(plan: ProjectPlan): string {
  const lines: Lines = []
  lines.push(`# Implementation Handoff: ${plan.overview.name || 'Project'}`, '')

  if (plan.foundation?.designFilter) {
    lines.push('## Design Filter (apply to every decision)', '')
    lines.push(`> ${plan.foundation.designFilter}`, '')
  }

  const fc = isFoundationComplete(plan)
  if (!fc.complete) {
    lines.push('## ⚠ Foundation Incomplete', '', 'Resolve these before starting:')
    list(lines, fc.missing, '- [ ] ')
    lines.push('')
  }

  const u = plan.foundation?.primaryUser
  section(lines, 'Primary User', () => {
    if (!u?.description) return
    renderUserFields(lines, u)
  })

  section(lines, 'Tech Stack', () => renderTechStack(lines, plan))

  section(lines, 'Components', () => {
    for (const c of plan.architecture.components ?? []) {
      const conn = c.connections?.length ? ` → ${c.connections.join(', ')}` : ''
      lines.push(`- **${c.name}:** ${c.description}${conn}`)
    }
  })

  if (plan.timeline.phases?.length) {
    const p = plan.timeline.phases[0]
    lines.push(`## First Phase: ${p.name} (${p.duration})`, '', p.description, '')
    lines.push('**Deliverables:**')
    list(lines, p.deliverables, '- [ ] ')
    lines.push('')
  }

  section(lines, 'Out of Scope (do NOT build)', () => list(lines, plan.overview.nonGoals))

  const notes = (plan.overview as Record<string, unknown>).implementationNotes as
    | string[]
    | undefined
  section(lines, 'Implementation Notes', () => list(lines, notes))

  return lines.join('\n')
}

function renderUserFields(lines: Lines, u: NonNullable<ProjectPlan['foundation']>['primaryUser']) {
  if (!u) return
  field(lines, 'Who', u.description)
  field(lines, 'Device', u.device)
  field(lines, 'Context', u.context)
  field(lines, 'Comfort level', u.technicalComfortAnchor)
  field(lines, 'Must achieve', u.firstSuccessAction)
  field(lines, 'Within', u.firstSuccessTimeframe)
}

function renderTechStack(lines: Lines, plan: ProjectPlan) {
  const t = plan.techStack
  if (!t.frontend?.framework && !t.backend?.language) return
  field(lines, 'Frontend', t.frontend?.framework)
  if (t.backend) {
    const val = [t.backend.language, t.backend.framework].filter(Boolean).join(' / ')
    if (val) lines.push(`**Backend:** ${val}`)
  }
  field(lines, 'Database', t.database?.product)
  field(lines, 'Rationale', t.rationale)
}
