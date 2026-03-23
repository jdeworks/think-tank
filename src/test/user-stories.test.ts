import { describe, it, expect } from 'vitest'
import {
  ProjectPlanSchema,
  createEmptyPlan,
  isFoundationComplete,
  PLAN_SECTIONS,
  SECTION_LABELS,
} from '@/schema/project-plan'
import { getSectionCompleteness, getNextSection, getIncompleteSections } from '@/engine/section-map'
import { buildSystemPrompt, buildInitialPrompt, getUpdatePlanTool } from '@/engine/prompts'

// ── User Stories ──────────────────────────────────────────────────────
// Each story tests: schema validity, foundation gate, section ordering,
// prompt content, and export readiness for a realistic project type.

// Story 1: Physical bakery (non-digital)
const bakeryFoundation = {
  primaryUser: {
    description:
      'A retired couple in their 60s looking for a neighbourhood bakery with gluten-free options. They drive, use Google Maps, and read Facebook reviews.',
    device: 'in-person',
    context: 'Walking into the store on a Saturday morning',
    technicalComfortAnchor: 'Google Maps and Facebook',
    currentSolution: 'Drive 20 minutes to the nearest gluten-free bakery',
    firstSuccessAction: 'Walk in, find the gluten-free section, and leave with a purchase',
    firstSuccessTimeframe: 'within 10 minutes',
  },
  designFilter:
    'If a first-time walk-in customer cannot find gluten-free products and check out within 10 minutes, the store layout has failed.',
}

// Story 2: SaaS developer tool (software)
const devToolFoundation = {
  primaryUser: {
    description:
      'A junior backend developer, 1-2 years experience, comfortable with the terminal but never set up CI/CD. Probably on macOS.',
    device: 'laptop',
    context: 'At a desk with fast WiFi, working on a side project',
    technicalComfortAnchor: 'VS Code and GitHub',
    currentSolution: 'Manually deploys by SSH-ing into a VPS',
    firstSuccessAction: 'Deploy their app to a live URL using only the README',
    firstSuccessTimeframe: 'within 15 minutes of cloning the repo',
  },
  designFilter:
    'If a junior developer unfamiliar with CI/CD cannot deploy to staging using the README alone, the setup is too complex.',
}

// Story 3: Food truck (mobile physical business)
const foodTruckFoundation = {
  primaryUser: {
    description:
      'Office workers aged 25-40 in a business district, looking for lunch between 12-1pm. Mostly on foot, checking Instagram for location updates.',
    device: 'phone',
    context: 'Standing on the street during lunch break, mobile data, sunny or rainy',
    technicalComfortAnchor: 'Instagram and Google Maps',
    currentSolution: 'Walk to the same 3 restaurants every day',
    firstSuccessAction:
      'Find the truck location on Instagram, walk there, order, and eat in under 20 minutes',
    firstSuccessTimeframe: 'within 20 minutes including travel',
  },
  designFilter:
    'If a lunch-break office worker cannot find the truck and get food within 20 minutes, the location strategy has failed.',
}

// Story 4: Mobile app for elderly medication tracking
const medAppFoundation = {
  primaryUser: {
    description:
      'A 72-year-old grandmother who takes 5 medications daily. Lives alone, has an Android phone her son set up. Reads WhatsApp messages from family.',
    device: 'phone',
    context: 'At home, standard WiFi, often forgets which pills she took',
    technicalComfortAnchor: 'WhatsApp — can open it, read messages, send voice notes',
    currentSolution: 'A paper list on the fridge that she sometimes forgets to check',
    firstSuccessAction: 'Get a reminder, tap one button to confirm she took her pills',
    firstSuccessTimeframe: 'within 30 seconds of the reminder',
  },
  designFilter:
    'If grandma cannot confirm her medication with a single tap after a reminder, the app is too complex for her.',
}

// Story 5: Community coding meetup (event)
const meetupFoundation = {
  primaryUser: {
    description:
      'A self-taught developer in their mid-20s who has been coding for 6 months, mostly alone. Wants to meet other developers but feels intimidated by tech meetups.',
    device: 'laptop',
    context: 'Attending in person at a co-working space on a weekday evening after work',
    technicalComfortAnchor: 'freeCodeCamp and YouTube tutorials',
    currentSolution: 'Codes alone at home, asks questions on Discord',
    firstSuccessAction: 'Pair-program with someone on a small challenge and exchange contact info',
    firstSuccessTimeframe: 'within the first hour of the event',
  },
  designFilter:
    'If a nervous beginner cannot find a partner and start coding together within the first hour, the event format has failed.',
}

// Story 6: E-commerce for Filipino micro-business
const ecomFoundation = {
  primaryUser: {
    description:
      'Maria, a 28-year-old perfume reseller in Davao City. Runs her business entirely through Facebook and WhatsApp. Uses a Samsung Galaxy phone on mobile data.',
    device: 'phone',
    context: 'At home or commuting, mobile data, manages business between household tasks',
    technicalComfortAnchor: 'Facebook Marketplace and WhatsApp',
    currentSolution:
      'Posts products on Facebook, takes orders via WhatsApp, uses a notebook for accounting',
    firstSuccessAction:
      'List 3 products with photos and prices, get a shareable link to post on Facebook',
    firstSuccessTimeframe: 'within 10 minutes of first use',
  },
  designFilter:
    'If Maria on her phone on mobile data cannot list products and share a link within 10 minutes without help, the UX is not acceptable.',
}

// Story 7: Local gym / fitness studio
const gymFoundation = {
  primaryUser: {
    description:
      'A 35-year-old office worker who wants to get fit but has never been to a gym. Intimidated by equipment and gym culture. Drives to work, passes the gym daily.',
    device: 'in-person',
    context: 'Walking into the gym for the first time, after work around 6pm',
    technicalComfortAnchor: 'YouTube fitness videos and a step counter app',
    currentSolution: 'Watches YouTube workout videos at home, inconsistent',
    firstSuccessAction: 'Complete a guided introductory session and book their next visit',
    firstSuccessTimeframe: 'within the first visit (1 hour)',
  },
  designFilter:
    'If a gym-nervous first-timer cannot complete an intro session and book their next visit in one hour, the onboarding has failed.',
}

// Story 8: API service for developers (B2B software)
const apiServiceFoundation = {
  primaryUser: {
    description:
      'A senior full-stack developer at a 10-person startup, evaluating third-party APIs for their product. Needs to integrate an API for email verification.',
    device: 'laptop',
    context: 'At a desk, fast connection, comparing 3 competitor APIs side by side',
    technicalComfortAnchor: 'Postman, curl, reading API docs daily',
    currentSolution: 'Using a competitor API that has poor documentation and slow support',
    firstSuccessAction:
      'Make a successful API call from the docs page and see a response in under 2 minutes',
    firstSuccessTimeframe: 'within 2 minutes of landing on the docs',
  },
  designFilter:
    'If a senior developer cannot make a successful API call from the docs within 2 minutes, the developer experience has failed.',
}

// ── Schema Validation Tests ──────────────────────────────────────────

describe('User Story: Schema Validation', () => {
  const stories = [
    { name: 'Bakery', foundation: bakeryFoundation },
    { name: 'DevTool', foundation: devToolFoundation },
    { name: 'FoodTruck', foundation: foodTruckFoundation },
    { name: 'MedApp', foundation: medAppFoundation },
    { name: 'Meetup', foundation: meetupFoundation },
    { name: 'E-commerce', foundation: ecomFoundation },
    { name: 'Gym', foundation: gymFoundation },
    { name: 'API Service', foundation: apiServiceFoundation },
  ]

  for (const story of stories) {
    it(`validates ${story.name} foundation against schema`, () => {
      const plan = createEmptyPlan()
      plan.foundation = story.foundation
      const result = ProjectPlanSchema.safeParse(plan)
      expect(result.success).toBe(true)
    })

    it(`reports ${story.name} foundation as complete`, () => {
      const plan = createEmptyPlan()
      plan.foundation = story.foundation
      const result = isFoundationComplete(plan)
      expect(result.complete).toBe(true)
      expect(result.missing).toHaveLength(0)
    })
  }
})

// ── Foundation Gate Tests ─────────────────────────────────────────────

describe('User Story: Foundation Gate', () => {
  it('foundation is the first section for any new plan', () => {
    const plan = createEmptyPlan()
    expect(getNextSection(plan)).toBe('foundation')
  })

  it('overview is next after foundation is complete', () => {
    const plan = createEmptyPlan()
    plan.foundation = bakeryFoundation
    expect(getNextSection(plan)).toBe('overview')
  })

  it('foundation appears in incomplete list for empty plan', () => {
    const plan = createEmptyPlan()
    const incomplete = getIncompleteSections(plan)
    expect(incomplete[0]).toBe('foundation')
  })

  it('foundation does not appear in incomplete list when filled', () => {
    const plan = createEmptyPlan()
    plan.foundation = devToolFoundation
    const incomplete = getIncompleteSections(plan)
    expect(incomplete).not.toContain('foundation')
  })

  it('rejects foundation with only description (missing other fields)', () => {
    const plan = createEmptyPlan()
    plan.foundation = {
      primaryUser: { description: 'A developer' },
    }
    const result = isFoundationComplete(plan)
    expect(result.complete).toBe(false)
    expect(result.missing).toContain('primaryUser.device')
    expect(result.missing).toContain('primaryUser.technicalComfortAnchor')
    expect(result.missing).toContain('primaryUser.firstSuccessAction')
    expect(result.missing).toContain('designFilter')
  })

  it('rejects foundation with empty strings', () => {
    const plan = createEmptyPlan()
    plan.foundation = {
      primaryUser: {
        description: '',
        device: '',
        technicalComfortAnchor: '',
        firstSuccessAction: '',
      },
      designFilter: '',
    }
    const result = isFoundationComplete(plan)
    expect(result.complete).toBe(false)
    expect(result.missing.length).toBe(5)
  })

  it('accepts non-digital device values', () => {
    const plan = createEmptyPlan()
    plan.foundation = bakeryFoundation
    expect(plan.foundation.primaryUser?.device).toBe('in-person')
    expect(isFoundationComplete(plan).complete).toBe(true)
  })
})

// ── Prompt Content Tests ─────────────────────────────────────────────

describe('User Story: Prompt Content', () => {
  it('system prompt mentions foundation for empty plan', () => {
    const plan = createEmptyPlan()
    const prompt = buildSystemPrompt('friendly', plan, ['foundation', 'overview'])
    expect(prompt).toContain('Foundation')
  })

  it('system prompt includes design filter when foundation is filled', () => {
    const plan = createEmptyPlan()
    plan.foundation = ecomFoundation
    const prompt = buildSystemPrompt('friendly', plan, ['overview'])
    expect(prompt).toContain('Design Filter')
    expect(prompt).toContain('Maria')
  })

  it('system prompt includes primary user when foundation is filled', () => {
    const plan = createEmptyPlan()
    plan.foundation = medAppFoundation
    const prompt = buildSystemPrompt('friendly', plan, ['overview'])
    expect(prompt).toContain('Primary User')
    expect(prompt).toContain('72-year-old grandmother')
  })

  it('initial prompt asks about primary user, not features', () => {
    const prompt = buildInitialPrompt('I want to open a bakery', 'friendly')
    expect(prompt).toContain('foundation')
    expect(prompt).toContain('primary user')
  })

  it('update_plan tool accepts foundation as a section', () => {
    const tool = getUpdatePlanTool()
    const sectionEnum = (tool.function.parameters.properties as Record<string, { enum?: string[] }>)
      .section.enum
    expect(sectionEnum).toContain('foundation')
  })

  it('all personalities produce valid initial prompts', () => {
    const personalities = ['friendly', 'researcher', 'critical', 'architect', 'budget'] as const
    for (const p of personalities) {
      const prompt = buildInitialPrompt('Open a coffee shop', p)
      expect(prompt).toContain('foundation')
      expect(prompt).toContain('coffee shop')
    }
  })

  it('system prompt does not contain "software project"', () => {
    const plan = createEmptyPlan()
    const prompt = buildSystemPrompt('friendly', plan, ['foundation'])
    expect(prompt).not.toContain('software project')
  })
})

// ── Section Labels and Ordering ──────────────────────────────────────

describe('User Story: Section Structure', () => {
  it('has 12 plan sections', () => {
    expect(PLAN_SECTIONS).toHaveLength(12)
  })

  it('foundation is the first section', () => {
    expect(PLAN_SECTIONS[0]).toBe('foundation')
  })

  it('every section has a label', () => {
    for (const section of PLAN_SECTIONS) {
      expect(SECTION_LABELS[section]).toBeDefined()
      expect(SECTION_LABELS[section].length).toBeGreaterThan(0)
    }
  })

  it('foundation completeness is 0 for empty, 100 for filled', () => {
    const empty = createEmptyPlan()
    expect(getSectionCompleteness(empty, 'foundation')).toBe(0)

    const filled = createEmptyPlan()
    filled.foundation = bakeryFoundation
    expect(getSectionCompleteness(filled, 'foundation')).toBe(100)
  })

  it('partial foundation is complete by key count but not by isFoundationComplete', () => {
    const plan = createEmptyPlan()
    plan.foundation = {
      primaryUser: {
        description: 'A developer',
        device: 'laptop',
      },
    }
    // getSectionCompleteness counts filled keys — primaryUser is filled
    expect(getSectionCompleteness(plan, 'foundation')).toBeGreaterThan(0)
    // But isFoundationComplete checks required subfields
    expect(isFoundationComplete(plan).complete).toBe(false)
  })
})

// ── Cross-Story Consistency ──────────────────────────────────────────

describe('User Story: Cross-Story Consistency', () => {
  it('all stories have a designFilter that follows the pattern', () => {
    const stories = [
      bakeryFoundation,
      devToolFoundation,
      foodTruckFoundation,
      medAppFoundation,
      meetupFoundation,
      ecomFoundation,
      gymFoundation,
      apiServiceFoundation,
    ]
    for (const story of stories) {
      expect(story.designFilter).toContain('cannot')
      expect(story.designFilter.length).toBeGreaterThan(20)
    }
  })

  it('all stories have firstSuccessAction that is observable', () => {
    const stories = [
      bakeryFoundation,
      devToolFoundation,
      foodTruckFoundation,
      medAppFoundation,
      meetupFoundation,
      ecomFoundation,
      gymFoundation,
      apiServiceFoundation,
    ]
    const feelings = ['feel', 'understand', 'get the value', 'appreciate', 'enjoy']
    for (const story of stories) {
      const action = story.primaryUser.firstSuccessAction.toLowerCase()
      for (const feeling of feelings) {
        expect(action).not.toContain(feeling)
      }
    }
  })

  it('non-digital stories use non-digital device values', () => {
    expect(bakeryFoundation.primaryUser.device).toBe('in-person')
    expect(gymFoundation.primaryUser.device).toBe('in-person')
  })

  it('digital stories use digital device values', () => {
    expect(devToolFoundation.primaryUser.device).toBe('laptop')
    expect(medAppFoundation.primaryUser.device).toBe('phone')
    expect(ecomFoundation.primaryUser.device).toBe('phone')
    expect(apiServiceFoundation.primaryUser.device).toBe('laptop')
  })
})
