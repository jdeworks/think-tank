import { describe, it, expect } from 'vitest'
import { buildSystemPrompt, buildInitialPrompt, getUpdatePlanTool } from '@/engine/prompts'
import { createEmptyPlan } from '@/schema/project-plan'

describe('buildSystemPrompt', () => {
  it('includes personality for friendly', () => {
    const plan = createEmptyPlan()
    const prompt = buildSystemPrompt('friendly', plan, ['overview'])
    expect(prompt).toContain('friendly')
    expect(prompt).toContain('encouraging')
  })

  it('includes personality for researcher', () => {
    const plan = createEmptyPlan()
    const prompt = buildSystemPrompt('researcher', plan, [])
    expect(prompt).toContain('researcher')
    expect(prompt).toContain('competitors')
  })

  it('includes personality for critical', () => {
    const plan = createEmptyPlan()
    const prompt = buildSystemPrompt('critical', plan, [])
    expect(prompt).toContain('critical thinker')
    expect(prompt).toContain('stress-test')
  })

  it('includes personality for architect', () => {
    const plan = createEmptyPlan()
    const prompt = buildSystemPrompt('architect', plan, [])
    expect(prompt).toContain('technical architect')
  })

  it('includes personality for budget', () => {
    const plan = createEmptyPlan()
    const prompt = buildSystemPrompt('budget', plan, [])
    expect(prompt).toContain('budget')
    expect(prompt).toContain('cost')
  })

  it('includes incomplete section labels', () => {
    const plan = createEmptyPlan()
    const prompt = buildSystemPrompt('friendly', plan, ['overview', 'architecture'])
    expect(prompt).toContain('Project Overview')
    expect(prompt).toContain('Architecture')
  })

  it('includes plan summary when data exists', () => {
    const plan = createEmptyPlan()
    plan.overview.name = 'My Project'
    plan.overview.description = 'A cool project'
    const prompt = buildSystemPrompt('friendly', plan, [])
    expect(prompt).toContain('My Project')
    expect(prompt).toContain('A cool project')
  })

  it('shows "No data yet" for empty plan', () => {
    const plan = createEmptyPlan()
    const prompt = buildSystemPrompt('friendly', plan, ['overview'])
    expect(prompt).toContain('No data yet')
  })

  it('includes plan summary for competitors', () => {
    const plan = createEmptyPlan()
    plan.competitors = [{ name: 'Rival', description: 'A rival', strengths: [], weaknesses: [] }]
    const prompt = buildSystemPrompt('friendly', plan, [])
    expect(prompt).toContain('Rival')
  })
})

describe('buildInitialPrompt', () => {
  it('includes the user idea', () => {
    const prompt = buildInitialPrompt('Build a todo app', 'friendly')
    expect(prompt).toContain('Build a todo app')
  })

  it('uses personality-specific opener', () => {
    expect(buildInitialPrompt('idea', 'friendly')).toContain('Great idea')
    expect(buildInitialPrompt('idea', 'researcher')).toContain('already out there')
    expect(buildInitialPrompt('idea', 'critical')).toContain('thought through')
    expect(buildInitialPrompt('idea', 'architect')).toContain('ground up')
    expect(buildInitialPrompt('idea', 'budget')).toContain('cost-effectively')
  })

  it('instructs to ask questions', () => {
    const prompt = buildInitialPrompt('idea', 'friendly')
    expect(prompt).toContain('questions')
  })

  it('instructs to use update_plan tool', () => {
    const prompt = buildInitialPrompt('idea', 'friendly')
    expect(prompt).toContain('update_plan')
  })
})

describe('getUpdatePlanTool', () => {
  it('returns a valid tool definition', () => {
    const tool = getUpdatePlanTool()
    expect(tool.type).toBe('function')
    expect(tool.function.name).toBe('update_plan')
    expect(tool.function.parameters.properties).toHaveProperty('section')
    expect(tool.function.parameters.properties).toHaveProperty('data')
    expect(tool.function.parameters.required).toContain('section')
    expect(tool.function.parameters.required).toContain('data')
  })

  it('includes all plan section names in enum', () => {
    const tool = getUpdatePlanTool()
    const sectionEnum = (tool.function.parameters.properties as Record<string, { enum?: string[] }>)
      .section.enum
    expect(sectionEnum).toContain('overview')
    expect(sectionEnum).toContain('architecture')
    expect(sectionEnum).toContain('competitors')
    expect(sectionEnum).toContain('risks')
    expect(sectionEnum?.length).toBe(11)
  })
})
