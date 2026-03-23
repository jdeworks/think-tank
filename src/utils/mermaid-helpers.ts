// Helper: generate Mermaid flowchart from architecture components
export function componentsToMermaid(
  components: Array<{ name: string; description: string; connections?: string[] }>,
): string {
  if (components.length === 0) return ''

  const lines = ['graph TD']
  const sanitizeId = (s: string) => s.replace(/[^a-zA-Z0-9]/g, '_')

  for (const comp of components) {
    const id = sanitizeId(comp.name)
    lines.push(`  ${id}["${comp.name}"]`)
  }

  for (const comp of components) {
    if (comp.connections) {
      for (const target of comp.connections) {
        if (components.some((c) => c.name === target)) {
          lines.push(`  ${sanitizeId(comp.name)} --> ${sanitizeId(target)}`)
        }
      }
    }
  }

  return lines.join('\n')
}

// Helper: generate Mermaid ER diagram from data model
export function dataModelToMermaid(
  entities: Array<{ entity: string; fields: string[]; relationships?: string[] }>,
): string {
  if (entities.length === 0) return ''

  const lines = ['erDiagram']

  for (const e of entities) {
    lines.push(`  ${e.entity} {`)
    for (const field of e.fields) {
      lines.push(`    string ${field.replace(/[^a-zA-Z0-9_]/g, '_')}`)
    }
    lines.push('  }')
  }

  for (const e of entities) {
    if (e.relationships) {
      for (const rel of e.relationships) {
        const match = rel.match(/(\w+)\s*([|}{o]+--[|}{o]+)\s*(\w+)/)
        if (match) {
          lines.push(`  ${match[1]} ${match[2]} ${match[3]} : ""`)
        } else if (entities.some((other) => other.entity === rel)) {
          lines.push(`  ${e.entity} ||--o{ ${rel} : "has"`)
        }
      }
    }
  }

  return lines.join('\n')
}

// Helper: generate user journey diagram from foundation + design
export function userJourneyToMermaid(
  primaryUser: string,
  flows: string[],
  firstSuccess: string,
): string {
  if (!primaryUser || flows.length === 0) return ''
  const label = primaryUser.length > 40 ? primaryUser.slice(0, 40) + '...' : primaryUser
  const lines = ['journey', `  title ${label}`]
  lines.push('  section Discovery & Start')
  lines.push('    Find the product: 3: User')
  for (const flow of flows.slice(0, 5)) {
    const clean = flow.replace(/[:"]/g, '')
    lines.push(`  section ${clean}`)
    lines.push(`    ${clean}: 5: User`)
  }
  if (firstSuccess) {
    const clean = firstSuccess.replace(/[:"]/g, '')
    lines.push('  section First Success')
    lines.push(`    ${clean}: 5: User`)
  }
  return lines.join('\n')
}

// Helper: generate risk matrix as quadrant chart
export function risksToMermaid(
  risks: Array<{ description: string; impact: string; likelihood: string }>,
): string {
  if (risks.length === 0) return ''
  const val = (level: string) => {
    if (level === 'high') return 0.8
    if (level === 'medium') return 0.5
    return 0.2
  }
  const lines = [
    'quadrantChart',
    '  title Risk Matrix',
    '  x-axis Low Likelihood --> High Likelihood',
    '  y-axis Low Impact --> High Impact',
  ]
  for (const r of risks.slice(0, 10)) {
    const label = r.description.length > 30 ? r.description.slice(0, 30) + '...' : r.description
    const clean = label.replace(/[[\]:"]/g, '')
    lines.push(`  ${clean}: [${val(r.likelihood)}, ${val(r.impact)}]`)
  }
  return lines.join('\n')
}

// Helper: generate budget breakdown as pie chart
export function budgetToMermaid(costs: Array<{ label: string; amount: string }>): string {
  if (costs.length === 0) return ''
  const lines = ['pie title Budget Breakdown']
  for (const c of costs) {
    const num = parseFloat(c.amount.replace(/[^0-9.]/g, ''))
    if (num > 0) {
      const clean = c.label.replace(/"/g, '')
      lines.push(`  "${clean}" : ${num}`)
    }
  }
  return lines.length > 1 ? lines.join('\n') : ''
}

// Helper: generate timeline Mermaid from phases
export function timelineToMermaid(
  phases: Array<{ name: string; duration: string; deliverables: string[] }>,
): string {
  if (phases.length === 0) return ''

  const lines = ['gantt', '  dateFormat YYYY-MM-DD', '  title Project Timeline']

  for (const phase of phases) {
    lines.push(`  section ${phase.name}`)
    for (const d of phase.deliverables) {
      lines.push(`    ${d} : ${phase.duration}`)
    }
  }

  return lines.join('\n')
}
