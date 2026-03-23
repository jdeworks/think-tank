import { describe, it, expect } from 'vitest'
import {
  ProjectPlanSchema,
  createEmptyPlan,
  PLAN_SECTIONS,
  SECTION_LABELS,
  isFoundationComplete,
} from '@/schema/project-plan'
import { createMessage, MessageSchema } from '@/schema/conversation'
import { ProviderConfigSchema } from '@/schema/settings'

describe('ProjectPlanSchema', () => {
  it('validates an empty plan', () => {
    const plan = createEmptyPlan()
    const result = ProjectPlanSchema.safeParse(plan)
    expect(result.success).toBe(true)
  })

  it('validates a fully populated plan', () => {
    const plan = createEmptyPlan()
    plan.overview = {
      name: 'Test Project',
      description: 'A test project',
      problemStatement: 'Testing is hard',
      goals: ['Make testing easy'],
      nonGoals: ['World domination'],
      targetUsers: 'Developers',
      successMetrics: ['100% test coverage'],
    }
    plan.requirements = {
      functional: [{ description: 'Must run tests', priority: 'must' }],
      nonFunctional: ['Fast'],
      constraints: ['Budget limited'],
      assumptions: ['Users have Node.js'],
    }
    plan.architecture = {
      systemType: 'Web app',
      pattern: 'SPA',
      components: [
        { name: 'Frontend', description: 'React UI', connections: ['Backend'] },
        { name: 'Backend', description: 'API server' },
      ],
      dataModel: [{ entity: 'User', fields: ['id', 'name', 'email'], relationships: ['Project'] }],
      apiDesign: 'REST',
    }
    plan.risks = [
      {
        description: 'Scope creep',
        category: 'timeline',
        impact: 'high',
        likelihood: 'medium',
        mitigation: 'Strict prioritization',
      },
    ]
    plan.competitors = [
      {
        name: 'Competitor A',
        description: 'Similar tool',
        strengths: ['Good UI'],
        weaknesses: ['Expensive'],
      },
    ]

    const result = ProjectPlanSchema.safeParse(plan)
    expect(result.success).toBe(true)
  })

  it('rejects invalid risk category', () => {
    const plan = createEmptyPlan()
    plan.risks = [
      {
        description: 'Bad',
        category: 'invalid' as 'technical',
        impact: 'high',
        likelihood: 'low',
        mitigation: 'Fix it',
      },
    ]
    const result = ProjectPlanSchema.safeParse(plan)
    expect(result.success).toBe(false)
  })

  it('has all sections labeled', () => {
    for (const section of PLAN_SECTIONS) {
      expect(SECTION_LABELS[section]).toBeDefined()
      expect(typeof SECTION_LABELS[section]).toBe('string')
    }
  })

  it('creates plan with valid timestamps', () => {
    const plan = createEmptyPlan()
    expect(new Date(plan.meta.createdAt).getTime()).not.toBeNaN()
    expect(new Date(plan.meta.lastModified).getTime()).not.toBeNaN()
  })
})

describe('isFoundationComplete', () => {
  it('reports incomplete for empty foundation', () => {
    const plan = createEmptyPlan()
    const result = isFoundationComplete(plan)
    expect(result.complete).toBe(false)
    expect(result.missing.length).toBeGreaterThan(0)
  })

  it('reports complete for a fully filled foundation', () => {
    const plan = createEmptyPlan()
    plan.foundation = {
      primaryUser: {
        description: 'A store manager at a hardware shop in Lagos',
        device: 'phone',
        technicalComfortAnchor: 'WhatsApp and Facebook',
        currentSolution: 'Paper ledger',
        firstSuccessAction: 'Add 3 products and get a shareable link',
      },
      designFilter:
        'If the store manager cannot list products on his phone without help, the UX has failed.',
    }
    expect(isFoundationComplete(plan).complete).toBe(true)
  })

  it('reports specific missing fields', () => {
    const plan = createEmptyPlan()
    plan.foundation = {
      primaryUser: {
        description: 'A developer',
        device: 'laptop',
      },
    }
    const result = isFoundationComplete(plan)
    expect(result.complete).toBe(false)
    expect(result.missing).toContain('primaryUser.technicalComfortAnchor')
    expect(result.missing).toContain('primaryUser.firstSuccessAction')
    expect(result.missing).toContain('designFilter')
    expect(result.missing).not.toContain('primaryUser.description')
  })
})

describe('MessageSchema', () => {
  it('creates a valid user message', () => {
    const msg = createMessage('user', 'Hello')
    const result = MessageSchema.safeParse(msg)
    expect(result.success).toBe(true)
    expect(msg.role).toBe('user')
    expect(msg.content).toBe('Hello')
    expect(msg.id).toBeTruthy()
  })

  it('creates a valid assistant message', () => {
    const msg = createMessage('assistant', 'Hi there')
    expect(msg.role).toBe('assistant')
    expect(msg.content).toBe('Hi there')
  })

  it('creates a valid system message', () => {
    const msg = createMessage('system', 'System prompt')
    expect(msg.role).toBe('system')
  })

  it('generates unique IDs', () => {
    const msg1 = createMessage('user', 'First')
    const msg2 = createMessage('user', 'Second')
    expect(msg1.id).not.toBe(msg2.id)
  })
})

describe('ProviderConfigSchema', () => {
  it('validates a valid OpenAI config', () => {
    const config = {
      id: 'openai',
      type: 'openai',
      name: 'OpenAI',
      apiKey: 'sk-test123',
      model: 'gpt-4o',
      baseUrl: 'https://api.openai.com/v1',
    }
    const result = ProviderConfigSchema.safeParse(config)
    expect(result.success).toBe(true)
  })

  it('validates config without baseUrl', () => {
    const config = {
      id: 'anthropic',
      type: 'anthropic',
      name: 'Claude',
      apiKey: 'sk-ant-test',
      model: 'claude-sonnet-4-20250514',
    }
    const result = ProviderConfigSchema.safeParse(config)
    expect(result.success).toBe(true)
  })

  it('rejects invalid provider type', () => {
    const config = {
      id: 'invalid',
      type: 'invalid',
      name: 'Invalid',
      apiKey: 'key',
      model: 'model',
    }
    const result = ProviderConfigSchema.safeParse(config)
    expect(result.success).toBe(false)
  })
})
