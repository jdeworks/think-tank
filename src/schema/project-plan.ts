import { z } from 'zod/v4'

const CompetitorSchema = z.object({
  name: z.string(),
  url: z.optional(z.string()),
  description: z.string(),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
})

const RiskSchema = z.object({
  description: z.string(),
  category: z.enum(['technical', 'resource', 'timeline', 'budget', 'security', 'other']),
  impact: z.enum(['low', 'medium', 'high']),
  likelihood: z.enum(['low', 'medium', 'high']),
  mitigation: z.string(),
})

const PrimaryUserSchema = z.object({
  description: z.optional(z.string()),
  device: z.optional(z.string()),
  context: z.optional(z.string()),
  technicalComfortAnchor: z.optional(z.string()),
  currentSolution: z.optional(z.string()),
  firstSuccessAction: z.optional(z.string()),
  firstSuccessTimeframe: z.optional(z.string()),
})

const FoundationSection = z.object({
  primaryUser: z.optional(PrimaryUserSchema),
  designFilter: z.optional(z.string()),
})

const OverviewSection = z.object({
  name: z.optional(z.string()),
  description: z.optional(z.string()),
  problemStatement: z.optional(z.string()),
  goals: z.optional(z.array(z.string())),
  nonGoals: z.optional(z.array(z.string())),
  targetUsers: z.optional(z.string()),
  successMetrics: z.optional(z.array(z.string())),
})

const RequirementsSection = z.object({
  functional: z.optional(
    z.array(
      z.object({
        description: z.string(),
        priority: z.enum(['must', 'should', 'nice']),
      }),
    ),
  ),
  nonFunctional: z.optional(z.array(z.string())),
  constraints: z.optional(z.array(z.string())),
  assumptions: z.optional(z.array(z.string())),
})

const ArchitectureSection = z.object({
  systemType: z.optional(z.string()),
  pattern: z.optional(z.string()),
  components: z.optional(
    z.array(
      z.object({
        name: z.string(),
        description: z.string(),
        connections: z.optional(z.array(z.string())),
      }),
    ),
  ),
  dataModel: z.optional(
    z.array(
      z.object({
        entity: z.string(),
        fields: z.array(z.string()),
        relationships: z.optional(z.array(z.string())),
      }),
    ),
  ),
  apiDesign: z.optional(z.string()),
})

const TechStackSection = z.object({
  frontend: z.optional(
    z.object({
      framework: z.optional(z.string()),
      uiLibrary: z.optional(z.string()),
      stateManagement: z.optional(z.string()),
    }),
  ),
  backend: z.optional(
    z.object({
      language: z.optional(z.string()),
      framework: z.optional(z.string()),
      runtime: z.optional(z.string()),
    }),
  ),
  database: z.optional(
    z.object({
      type: z.optional(z.string()),
      product: z.optional(z.string()),
    }),
  ),
  infrastructure: z.optional(z.string()),
  keyDependencies: z.optional(z.array(z.string())),
  rationale: z.optional(z.string()),
})

const HostingSection = z.object({
  platform: z.optional(z.string()),
  cicd: z.optional(z.string()),
  environments: z.optional(z.array(z.string())),
  domain: z.optional(z.string()),
  estimatedMonthlyCost: z.optional(z.string()),
})

const SecuritySection = z.object({
  authentication: z.optional(z.string()),
  authorization: z.optional(z.string()),
  dataEncryption: z.optional(z.string()),
  apiKeyManagement: z.optional(z.string()),
  knownRisks: z.optional(z.array(z.string())),
  compliance: z.optional(z.array(z.string())),
})

const DesignSection = z.object({
  designSystem: z.optional(z.string()),
  keyUserFlows: z.optional(z.array(z.string())),
  responsiveStrategy: z.optional(z.string()),
  accessibilityLevel: z.optional(z.string()),
  brandGuidelines: z.optional(z.string()),
})

const BudgetSection = z.object({
  developmentEffort: z.optional(z.string()),
  infrastructureCosts: z.optional(z.string()),
  thirdPartyCosts: z.optional(
    z.array(
      z.object({
        service: z.string(),
        cost: z.string(),
      }),
    ),
  ),
  totalEstimate: z.optional(z.string()),
})

const TimelineSection = z.object({
  phases: z.optional(
    z.array(
      z.object({
        name: z.string(),
        description: z.string(),
        duration: z.string(),
        deliverables: z.array(z.string()),
      }),
    ),
  ),
  milestones: z.optional(
    z.array(
      z.object({
        name: z.string(),
        targetDate: z.optional(z.string()),
        description: z.string(),
      }),
    ),
  ),
})

export const ProjectPlanSchema = z.object({
  meta: z.object({
    version: z.literal('1.0'),
    createdAt: z.string(),
    lastModified: z.string(),
  }),
  foundation: FoundationSection,
  overview: OverviewSection,
  requirements: RequirementsSection,
  architecture: ArchitectureSection,
  techStack: TechStackSection,
  hosting: HostingSection,
  security: SecuritySection,
  design: DesignSection,
  budget: BudgetSection,
  timeline: TimelineSection,
  risks: z.array(RiskSchema),
  competitors: z.array(CompetitorSchema),
})

export type ProjectPlan = z.infer<typeof ProjectPlanSchema>

export const PLAN_SECTIONS = [
  'foundation',
  'overview',
  'requirements',
  'architecture',
  'techStack',
  'hosting',
  'security',
  'design',
  'budget',
  'timeline',
  'risks',
  'competitors',
] as const

export type PlanSectionKey = (typeof PLAN_SECTIONS)[number]

export const SECTION_LABELS: Record<PlanSectionKey, string> = {
  foundation: 'Foundation',
  overview: 'Project Overview',
  requirements: 'Requirements',
  architecture: 'Architecture',
  techStack: 'Tech Stack',
  hosting: 'Hosting & Deployment',
  security: 'Security',
  design: 'Design & UX',
  budget: 'Budget & Resources',
  timeline: 'Timeline & Milestones',
  risks: 'Risks & Mitigations',
  competitors: 'Competitors & Inspiration',
}

export function createEmptyPlan(): ProjectPlan {
  const now = new Date().toISOString()
  return {
    meta: { version: '1.0', createdAt: now, lastModified: now },
    foundation: {},
    overview: {},
    requirements: {},
    architecture: {},
    techStack: {},
    hosting: {},
    security: {},
    design: {},
    budget: {},
    timeline: {},
    risks: [],
    competitors: [],
  }
}

export function isFoundationComplete(plan: ProjectPlan): {
  complete: boolean
  missing: string[]
} {
  const missing: string[] = []
  const user = plan.foundation?.primaryUser

  if (!user?.description) missing.push('primaryUser.description')
  if (!user?.device) missing.push('primaryUser.device')
  if (!user?.technicalComfortAnchor) missing.push('primaryUser.technicalComfortAnchor')
  if (!user?.firstSuccessAction) missing.push('primaryUser.firstSuccessAction')
  if (!plan.foundation?.designFilter) missing.push('designFilter')

  return { complete: missing.length === 0, missing }
}
