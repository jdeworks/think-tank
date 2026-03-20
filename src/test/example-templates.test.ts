import { describe, it, expect } from 'vitest'
import { EXAMPLE_TEMPLATES } from '@/data/example-templates'

describe('EXAMPLE_TEMPLATES', () => {
  it('has at least 3 templates', () => {
    expect(EXAMPLE_TEMPLATES.length).toBeGreaterThanOrEqual(3)
  })

  it('each template has required fields', () => {
    for (const template of EXAMPLE_TEMPLATES) {
      expect(template.id).toBeTruthy()
      expect(template.title).toBeTruthy()
      expect(template.description).toBeTruthy()
      expect(template.idea).toBeTruthy()
      expect(template.idea.length).toBeGreaterThan(20)
    }
  })

  it('has unique IDs', () => {
    const ids = EXAMPLE_TEMPLATES.map((t) => t.id)
    const unique = new Set(ids)
    expect(unique.size).toBe(ids.length)
  })

  it('has unique titles', () => {
    const titles = EXAMPLE_TEMPLATES.map((t) => t.title)
    const unique = new Set(titles)
    expect(unique.size).toBe(titles.length)
  })
})
