import { describe, it, expect, beforeEach } from 'vitest'
import { createShareUrl, loadFromShareUrl } from '@/utils/export'
import { createEmptyPlan } from '@/schema/project-plan'
import { generateOnePageSummary, generateHandoff } from '@/utils/export-extras'

// Mock window.location
const mockLocation = {
  href: 'https://example.com/think-tank/',
  hash: '',
  pathname: '/think-tank/',
}

beforeEach(() => {
  Object.defineProperty(window, 'location', {
    value: mockLocation,
    writable: true,
  })
  mockLocation.hash = ''
  mockLocation.href = 'https://example.com/think-tank/'
})

describe('createShareUrl', () => {
  it('creates a URL with compressed plan data', () => {
    const plan = createEmptyPlan()
    plan.overview.name = 'Test Project'

    const url = createShareUrl(plan)

    expect(url).toContain('https://example.com/think-tank/')
    expect(url).toContain('#plan=')
    expect(url.length).toBeGreaterThan(50)
  })

  it('creates different URLs for different plans', () => {
    const plan1 = createEmptyPlan()
    plan1.overview.name = 'Project A'

    const plan2 = createEmptyPlan()
    plan2.overview.name = 'Project B'

    const url1 = createShareUrl(plan1)
    const url2 = createShareUrl(plan2)

    expect(url1).not.toBe(url2)
  })
})

describe('loadFromShareUrl', () => {
  it('returns null when no hash', () => {
    mockLocation.hash = ''
    expect(loadFromShareUrl()).toBeNull()
  })

  it('returns null for non-plan hash', () => {
    mockLocation.hash = '#other=data'
    expect(loadFromShareUrl()).toBeNull()
  })

  it('returns null for invalid compressed data', () => {
    mockLocation.hash = '#plan=invaliddata'
    expect(loadFromShareUrl()).toBeNull()
  })

  it('roundtrips correctly', () => {
    const plan = createEmptyPlan()
    plan.overview.name = 'Roundtrip Test'
    plan.overview.goals = ['Goal 1', 'Goal 2']

    const url = createShareUrl(plan)
    const hashPart = url.split('#')[1]
    mockLocation.hash = `#${hashPart}`

    const loaded = loadFromShareUrl()

    expect(loaded).not.toBeNull()
    expect(loaded!.overview.name).toBe('Roundtrip Test')
    expect(loaded!.overview.goals).toEqual(['Goal 1', 'Goal 2'])
  })
})

describe('importFromJSON', () => {
  it('is a function', async () => {
    const { importFromJSON } = await import('@/utils/export')
    expect(typeof importFromJSON).toBe('function')
  })
})

describe('generateOnePageSummary', () => {
  it('includes project name and description', () => {
    const plan = createEmptyPlan()
    plan.overview.name = 'My Bakery'
    plan.overview.description = 'A gluten-free bakery'
    const md = generateOnePageSummary(plan)
    expect(md).toContain('My Bakery')
    expect(md).toContain('gluten-free bakery')
  })

  it('includes foundation data', () => {
    const plan = createEmptyPlan()
    plan.overview.name = 'Test'
    plan.foundation = {
      primaryUser: {
        description: 'A retired couple in their 60s',
        firstSuccessAction: 'Find gluten-free bread and buy it',
      },
      designFilter: 'If they cannot find it in 10 minutes, the layout failed.',
    }
    const md = generateOnePageSummary(plan)
    expect(md).toContain('retired couple')
    expect(md).toContain('Design filter')
  })

  it('includes top risks', () => {
    const plan = createEmptyPlan()
    plan.overview.name = 'Test'
    plan.risks = [
      {
        description: 'No customers',
        category: 'market',
        impact: 'high',
        likelihood: 'medium',
        mitigation: 'Marketing',
      },
    ]
    const md = generateOnePageSummary(plan)
    expect(md).toContain('No customers')
  })
})

describe('generateHandoff', () => {
  it('includes design filter prominently', () => {
    const plan = createEmptyPlan()
    plan.overview.name = 'Test'
    plan.foundation = { designFilter: 'If Maria cannot do X, the UX failed.' }
    const md = generateHandoff(plan)
    expect(md).toContain('Design Filter')
    expect(md).toContain('Maria cannot do X')
  })

  it('flags incomplete foundation', () => {
    const plan = createEmptyPlan()
    const md = generateHandoff(plan)
    expect(md).toContain('Foundation Incomplete')
  })

  it('includes phase 1 deliverables as checklist', () => {
    const plan = createEmptyPlan()
    plan.overview.name = 'Test'
    plan.timeline = {
      phases: [
        {
          name: 'MVP',
          description: 'Build core',
          duration: '4 weeks',
          deliverables: ['Auth', 'Dashboard'],
        },
      ],
    }
    const md = generateHandoff(plan)
    expect(md).toContain('- [ ] Auth')
    expect(md).toContain('- [ ] Dashboard')
  })

  it('includes non-goals as out-of-scope', () => {
    const plan = createEmptyPlan()
    plan.overview.name = 'Test'
    plan.overview.nonGoals = ['Mobile app', 'Multi-language']
    const md = generateHandoff(plan)
    expect(md).toContain('Out of Scope')
    expect(md).toContain('Mobile app')
  })
})
