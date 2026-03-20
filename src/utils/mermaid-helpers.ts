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
