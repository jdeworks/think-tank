import { describe, it, expect } from 'vitest'
import {
  getSectionCompleteness,
  getOverallCompleteness,
  getIncompleteSections,
  getNextSection,
} from '@/engine/section-map'
import { createEmptyPlan } from '@/schema/project-plan'

describe('getSectionCompleteness', () => {
  it('returns 0 for empty object sections', () => {
    const plan = createEmptyPlan()
    expect(getSectionCompleteness(plan, 'overview')).toBe(0)
    expect(getSectionCompleteness(plan, 'architecture')).toBe(0)
  })

  it('returns 0 for empty array sections', () => {
    const plan = createEmptyPlan()
    expect(getSectionCompleteness(plan, 'risks')).toBe(0)
    expect(getSectionCompleteness(plan, 'competitors')).toBe(0)
  })

  it('returns 100 for non-empty array sections', () => {
    const plan = createEmptyPlan()
    plan.risks = [
      {
        description: 'Risk',
        category: 'technical',
        impact: 'high',
        likelihood: 'high',
        mitigation: 'Fix',
      },
    ]
    expect(getSectionCompleteness(plan, 'risks')).toBe(100)
  })

  it('returns partial completion for object sections with some empty fields', () => {
    const plan = createEmptyPlan()
    // Mix of filled and empty fields — completeness is based on filled/total entries present
    plan.overview = { name: 'Test', description: '', goals: [], targetUsers: 'Devs' }
    const completeness = getSectionCompleteness(plan, 'overview')
    // name and targetUsers are filled (2), description is empty string, goals is empty array (2 not filled)
    expect(completeness).toBe(50)
  })

  it('returns 100 for fully filled object sections', () => {
    const plan = createEmptyPlan()
    plan.overview = {
      name: 'Test',
      description: 'Desc',
      problemStatement: 'Problem',
      goals: ['Goal 1'],
      nonGoals: ['Non-goal'],
      targetUsers: 'Devs',
      successMetrics: ['Metric'],
    }
    expect(getSectionCompleteness(plan, 'overview')).toBe(100)
  })

  it('ignores empty arrays in object fields', () => {
    const plan = createEmptyPlan()
    plan.overview = { name: 'Test', goals: [] }
    // goals is [] so not counted as filled, name is filled
    const completeness = getSectionCompleteness(plan, 'overview')
    expect(completeness).toBeGreaterThan(0)
  })

  it('ignores empty strings in object fields', () => {
    const plan = createEmptyPlan()
    plan.overview = { name: '' }
    expect(getSectionCompleteness(plan, 'overview')).toBe(0)
  })
})

describe('getOverallCompleteness', () => {
  it('returns 0 for an empty plan', () => {
    const plan = createEmptyPlan()
    expect(getOverallCompleteness(plan)).toBe(0)
  })

  it('returns > 0 when some sections have data', () => {
    const plan = createEmptyPlan()
    plan.overview = { name: 'Test', description: 'Desc' }
    plan.risks = [
      {
        description: 'Risk',
        category: 'technical',
        impact: 'high',
        likelihood: 'high',
        mitigation: 'Fix',
      },
    ]
    expect(getOverallCompleteness(plan)).toBeGreaterThan(0)
  })
})

describe('getIncompleteSections', () => {
  it('returns all sections for an empty plan', () => {
    const plan = createEmptyPlan()
    const incomplete = getIncompleteSections(plan)
    expect(incomplete.length).toBe(12)
  })

  it('returns sections sorted by order', () => {
    const plan = createEmptyPlan()
    const incomplete = getIncompleteSections(plan)
    expect(incomplete[0]).toBe('foundation')
    expect(incomplete[1]).toBe('overview')
    expect(incomplete[2]).toBe('competitors')
  })

  it('excludes complete sections', () => {
    const plan = createEmptyPlan()
    plan.overview = {
      name: 'T',
      description: 'D',
      problemStatement: 'P',
      goals: ['G'],
      nonGoals: ['N'],
      targetUsers: 'U',
      successMetrics: ['M'],
    }
    const incomplete = getIncompleteSections(plan)
    expect(incomplete).not.toContain('overview')
  })
})

describe('getNextSection', () => {
  it('returns foundation first for empty plan', () => {
    const plan = createEmptyPlan()
    expect(getNextSection(plan)).toBe('foundation')
  })

  it('returns null when all sections are complete', () => {
    const plan = createEmptyPlan()
    plan.foundation = {
      primaryUser: {
        description: 'A freelance designer in Manila',
        device: 'phone',
        context: 'on the go, mobile data',
        technicalComfortAnchor: 'WhatsApp and Facebook',
        currentSolution: 'Spreadsheet',
        firstSuccessAction: 'Create and share an invoice',
        firstSuccessTimeframe: '5 minutes',
      },
      designFilter:
        'If Maria cannot create an invoice on her phone without help, the UX has failed.',
    }
    plan.overview = {
      name: 'T',
      description: 'D',
      problemStatement: 'P',
      goals: ['G'],
      nonGoals: ['N'],
      targetUsers: 'U',
      successMetrics: ['M'],
    }
    plan.requirements = {
      functional: [{ description: 'F', priority: 'must' }],
      nonFunctional: ['NF'],
      constraints: ['C'],
      assumptions: ['A'],
    }
    plan.architecture = {
      systemType: 'Web',
      pattern: 'SPA',
      components: [{ name: 'UI', description: 'Frontend' }],
      dataModel: [{ entity: 'User', fields: ['id'] }],
      apiDesign: 'REST',
    }
    plan.techStack = {
      frontend: { framework: 'React' },
      backend: { language: 'Node' },
      database: { type: 'SQL' },
      infrastructure: 'AWS',
      keyDependencies: ['Express'],
      rationale: 'Popular',
    }
    plan.hosting = {
      platform: 'Vercel',
      cicd: 'GitHub Actions',
      environments: ['prod'],
      domain: 'test.com',
      estimatedMonthlyCost: '$0',
    }
    plan.security = {
      authentication: 'OAuth',
      authorization: 'RBAC',
      dataEncryption: 'AES',
      apiKeyManagement: 'Vault',
      knownRisks: ['XSS'],
      compliance: ['GDPR'],
    }
    plan.design = {
      designSystem: 'Custom',
      keyUserFlows: ['Login'],
      responsiveStrategy: 'Mobile first',
      accessibilityLevel: 'WCAG AA',
      brandGuidelines: 'Simple',
    }
    plan.budget = {
      developmentEffort: '2 months',
      infrastructureCosts: '$50/mo',
      thirdPartyCosts: [{ service: 'Auth0', cost: '$23/mo' }],
      totalEstimate: '$5000',
    }
    plan.timeline = {
      phases: [
        { name: 'MVP', description: 'Build MVP', duration: '4 weeks', deliverables: ['App'] },
      ],
      milestones: [{ name: 'Launch', description: 'Go live' }],
    }
    plan.risks = [
      {
        description: 'R',
        category: 'technical',
        impact: 'low',
        likelihood: 'low',
        mitigation: 'M',
      },
    ]
    plan.competitors = [{ name: 'C', description: 'D', strengths: ['S'], weaknesses: ['W'] }]

    expect(getNextSection(plan)).toBeNull()
  })
})
