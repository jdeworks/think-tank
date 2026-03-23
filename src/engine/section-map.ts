import type { ProjectPlan, PlanSectionKey } from '@/schema/project-plan'

interface SectionConfig {
  key: PlanSectionKey
  requiredFields: string[]
  order: number
}

const SECTION_CONFIGS: SectionConfig[] = [
  { key: 'foundation', requiredFields: ['primaryUser', 'designFilter'], order: 0 },
  { key: 'overview', requiredFields: ['name', 'description', 'goals'], order: 1 },
  { key: 'competitors', requiredFields: [], order: 2 },
  { key: 'requirements', requiredFields: ['functional'], order: 3 },
  { key: 'architecture', requiredFields: ['systemType', 'pattern', 'components'], order: 4 },
  { key: 'techStack', requiredFields: ['frontend', 'backend'], order: 5 },
  { key: 'hosting', requiredFields: ['platform', 'estimatedMonthlyCost'], order: 6 },
  { key: 'security', requiredFields: ['authentication'], order: 7 },
  { key: 'design', requiredFields: ['keyUserFlows'], order: 8 },
  { key: 'budget', requiredFields: ['totalEstimate'], order: 9 },
  { key: 'timeline', requiredFields: ['phases'], order: 10 },
  { key: 'risks', requiredFields: [], order: 11 },
]

export function getSectionCompleteness(plan: ProjectPlan, key: PlanSectionKey): number {
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
  const scores = SECTION_CONFIGS.map((c) => getSectionCompleteness(plan, c.key))
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
}

export function getIncompleteSections(plan: ProjectPlan): PlanSectionKey[] {
  return SECTION_CONFIGS.filter((c) => getSectionCompleteness(plan, c.key) < 80)
    .sort((a, b) => a.order - b.order)
    .map((c) => c.key)
}

export function getNextSection(plan: ProjectPlan): PlanSectionKey | null {
  const incomplete = getIncompleteSections(plan)
  return incomplete.length > 0 ? incomplete[0] : null
}
