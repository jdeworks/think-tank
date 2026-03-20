import { describe, it, expect, beforeEach } from 'vitest'
import { createShareUrl, loadFromShareUrl } from '@/utils/export'
import { createEmptyPlan } from '@/schema/project-plan'

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
