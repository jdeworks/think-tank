import {
  type ProjectPlan,
  type PlanSectionKey,
  PLAN_SECTIONS,
  isFoundationComplete,
} from '@/schema/project-plan'

const SECTION_ORDER: Record<PlanSectionKey, number> = {
  foundation: 0,
  overview: 1,
  competitors: 2,
  requirements: 3,
  architecture: 4,
  techStack: 5,
  hosting: 6,
  security: 7,
  design: 8,
  budget: 9,
  timeline: 10,
  risks: 11,
}

export function getSectionCompleteness(plan: ProjectPlan, key: PlanSectionKey): number {
  // Foundation uses deep validation — all required sub-fields must be present
  if (key === 'foundation') {
    const result = isFoundationComplete(plan)
    return result.complete ? 100 : Math.round(((5 - result.missing.length) / 5) * 100)
  }

  const section = plan[key]

  if (Array.isArray(section)) {
    return section.length > 0 ? 100 : 0
  }

  if (typeof section !== 'object' || section === null) return 0

  const entries = Object.entries(section)
  if (entries.length === 0) return 0

  const filled = entries.filter(([, v]) => {
    if (v === undefined || v === null || v === '') return false
    if (Array.isArray(v) && v.length === 0) return false
    if (typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0) return false
    return true
  })

  return Math.round((filled.length / entries.length) * 100)
}

export function getOverallCompleteness(plan: ProjectPlan): number {
  const scores = PLAN_SECTIONS.map((key) => getSectionCompleteness(plan, key))
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
}

export function getIncompleteSections(plan: ProjectPlan): PlanSectionKey[] {
  return PLAN_SECTIONS.filter((key) => getSectionCompleteness(plan, key) < 80).sort(
    (a, b) => (SECTION_ORDER[a] ?? 99) - (SECTION_ORDER[b] ?? 99),
  )
}

export function getNextSection(plan: ProjectPlan): PlanSectionKey | null {
  const incomplete = getIncompleteSections(plan)
  return incomplete.length > 0 ? incomplete[0] : null
}
