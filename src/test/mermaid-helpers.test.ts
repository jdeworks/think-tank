import { describe, it, expect } from 'vitest'
import { componentsToMermaid, dataModelToMermaid, timelineToMermaid } from '@/utils/mermaid-helpers'

describe('componentsToMermaid', () => {
  it('returns empty string for no components', () => {
    expect(componentsToMermaid([])).toBe('')
  })

  it('generates flowchart for single component', () => {
    const result = componentsToMermaid([{ name: 'Frontend', description: 'React UI' }])
    expect(result).toContain('graph TD')
    expect(result).toContain('Frontend')
  })

  it('generates connections between components', () => {
    const result = componentsToMermaid([
      { name: 'Frontend', description: 'UI', connections: ['Backend'] },
      { name: 'Backend', description: 'API' },
    ])
    expect(result).toContain('Frontend --> Backend')
  })

  it('skips connections to non-existent components', () => {
    const result = componentsToMermaid([
      { name: 'Frontend', description: 'UI', connections: ['NonExistent'] },
    ])
    expect(result).not.toContain('-->')
  })

  it('sanitizes names with special characters', () => {
    const result = componentsToMermaid([{ name: 'My Component', description: 'Test' }])
    expect(result).toContain('My_Component')
  })
})

describe('dataModelToMermaid', () => {
  it('returns empty string for no entities', () => {
    expect(dataModelToMermaid([])).toBe('')
  })

  it('generates erDiagram with entities', () => {
    const result = dataModelToMermaid([{ entity: 'User', fields: ['id', 'name', 'email'] }])
    expect(result).toContain('erDiagram')
    expect(result).toContain('User')
    expect(result).toContain('string id')
    expect(result).toContain('string name')
  })

  it('generates relationships', () => {
    const result = dataModelToMermaid([
      { entity: 'User', fields: ['id'], relationships: ['Post'] },
      { entity: 'Post', fields: ['id'] },
    ])
    expect(result).toContain('User')
    expect(result).toContain('Post')
    expect(result).toContain('has')
  })
})

describe('timelineToMermaid', () => {
  it('returns empty string for no phases', () => {
    expect(timelineToMermaid([])).toBe('')
  })

  it('generates gantt chart', () => {
    const result = timelineToMermaid([
      { name: 'MVP', duration: '4w', deliverables: ['Core app', 'Auth system'] },
    ])
    expect(result).toContain('gantt')
    expect(result).toContain('section MVP')
    expect(result).toContain('Core app')
    expect(result).toContain('Auth system')
  })

  it('handles multiple phases', () => {
    const result = timelineToMermaid([
      { name: 'Phase 1', duration: '2w', deliverables: ['Setup'] },
      { name: 'Phase 2', duration: '4w', deliverables: ['Build'] },
    ])
    expect(result).toContain('section Phase 1')
    expect(result).toContain('section Phase 2')
  })
})
