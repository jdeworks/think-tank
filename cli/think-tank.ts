#!/usr/bin/env npx tsx
/**
 * Think Tank CLI — Interactive project planning from your terminal.
 *
 * Usage:
 *   npx tsx cli/think-tank.ts                    # Interactive mode
 *   npx tsx cli/think-tank.ts --idea "..."       # Start with an idea
 *   npx tsx cli/think-tank.ts --load plan.json   # Resume from exported plan
 *   npx tsx cli/think-tank.ts --personality critical
 *
 * Environment:
 *   ANTHROPIC_API_KEY   — Your Anthropic API key (required)
 *   THINK_TANK_MODEL    — Model to use (default: claude-sonnet-4-6)
 */

import Anthropic from '@anthropic-ai/sdk'
import * as fs from 'fs'
import * as path from 'path'
import * as readline from 'readline'

// ── Schema (inline to avoid import alias issues) ──────────────────────

interface ProjectPlan {
  meta: { version: '1.0'; createdAt: string; lastModified: string }
  foundation: Record<string, unknown>
  overview: Record<string, unknown>
  requirements: Record<string, unknown>
  architecture: Record<string, unknown>
  techStack: Record<string, unknown>
  hosting: Record<string, unknown>
  security: Record<string, unknown>
  design: Record<string, unknown>
  budget: Record<string, unknown>
  timeline: Record<string, unknown>
  risks: Array<Record<string, unknown>>
  competitors: Array<Record<string, unknown>>
}

const SECTION_LABELS: Record<string, string> = {
  foundation: 'Foundation',
  overview: 'Project Overview',
  requirements: 'Requirements',
  architecture: 'Architecture',
  techStack: 'Tech Stack',
  hosting: 'Hosting & Deployment',
  security: 'Security',
  design: 'Design & UX',
  budget: 'Budget & Resources',
  timeline: 'Timeline & Milestones',
  risks: 'Risks & Mitigations',
  competitors: 'Competitors & Inspiration',
}

const PLAN_SECTIONS = Object.keys(SECTION_LABELS)

function createEmptyPlan(): ProjectPlan {
  const now = new Date().toISOString()
  return {
    meta: { version: '1.0', createdAt: now, lastModified: now },
    foundation: {},
    overview: {},
    requirements: {},
    architecture: {},
    techStack: {},
    hosting: {},
    security: {},
    design: {},
    budget: {},
    timeline: {},
    risks: [],
    competitors: [],
  }
}

// ── Completeness tracking ─────────────────────────────────────────────

function getSectionCompleteness(plan: ProjectPlan, key: string): number {
  // Foundation uses deep validation — all 5 required sub-fields must be present
  if (key === 'foundation') {
    const f = plan.foundation as Record<string, unknown>
    const u = (f?.primaryUser as Record<string, unknown>) || {}
    let filled = 0
    if (u.description) filled++
    if (u.device) filled++
    if (u.technicalComfortAnchor) filled++
    if (u.firstSuccessAction) filled++
    if (f?.designFilter) filled++
    return Math.round((filled / 5) * 100)
  }
  const section = (plan as Record<string, unknown>)[key]
  if (Array.isArray(section)) return section.length > 0 ? 100 : 0
  if (typeof section !== 'object' || section === null) return 0
  const entries = Object.entries(section)
  if (entries.length === 0) return 0
  const filled = entries.filter(([, v]) => {
    if (v === undefined || v === null || v === '') return false
    if (Array.isArray(v) && v.length === 0) return false
    return true
  })
  return Math.round((filled.length / entries.length) * 100)
}

function getOverallCompleteness(plan: ProjectPlan): number {
  const scores = PLAN_SECTIONS.map((k) => getSectionCompleteness(plan, k))
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
}

// ── Personality prompts ───────────────────────────────────────────────

const PERSONALITIES: Record<string, string> = {
  friendly: `You are a friendly and encouraging project planning guide. You explain technical concepts in simple terms, avoid jargon when possible, and help users feel confident about their ideas.`,
  researcher: `You are a thorough researcher and analyst. You focus on finding competitors, similar projects, and sources of inspiration. You provide specific examples and references whenever possible.`,
  critical: `You are a critical thinker who helps users stress-test their ideas. You ask tough but constructive questions. You identify potential failure points, scalability issues, and hidden assumptions. Every challenge comes with a suggested approach.`,
  architect: `You are a technical architect focused on system design and engineering decisions. You dive deep into architecture patterns, technology trade-offs, scalability concerns, and best practices.`,
  budget: `You are a budget-conscious planner who focuses on costs, ROI, and resource efficiency. You suggest cost-effective alternatives and help users understand the total cost of ownership.`,
}

// ── Tool definition ───────────────────────────────────────────────────

const UPDATE_PLAN_TOOL: Anthropic.Tool = {
  name: 'update_plan',
  description:
    'Update one or more sections of the project plan based on information gathered from the conversation.',
  input_schema: {
    type: 'object' as const,
    properties: {
      section: {
        type: 'string',
        enum: PLAN_SECTIONS,
        description: 'The plan section to update',
      },
      data: {
        type: 'object' as const,
        description: 'The updated data for this section.',
      },
    },
    required: ['section', 'data'],
  },
}

// ── Mermaid diagram generation ────────────────────────────────────────

function buildArchitectureMmd(
  components: Array<{ name: string; description: string; connections?: string[] }>,
): string {
  const sanitize = (s: string) => s.replace(/[^a-zA-Z0-9]/g, '_')
  const lines = ['graph TD']
  for (const c of components) {
    lines.push(`  ${sanitize(c.name)}["${c.name}"]`)
  }
  const allNames = new Set(components.map((c) => c.name))
  for (const c of components) {
    for (const t of c.connections ?? []) {
      if (allNames.has(t)) lines.push(`  ${sanitize(c.name)} --> ${sanitize(t)}`)
    }
  }
  return lines.join('\n')
}

function buildErDiagramMmd(
  entities: Array<{ entity: string; fields: string[]; relationships?: string[] }>,
): string {
  const lines = ['erDiagram']
  const allEntities = new Set(entities.map((e) => e.entity))
  for (const e of entities) {
    lines.push(`  ${e.entity} {`)
    for (const f of e.fields) lines.push(`    string ${f.replace(/[^a-zA-Z0-9_]/g, '_')}`)
    lines.push('  }')
  }
  for (const e of entities) {
    for (const rel of e.relationships ?? []) {
      if (allEntities.has(rel)) lines.push(`  ${e.entity} ||--o{ ${rel} : "has"`)
    }
  }
  return lines.join('\n')
}

async function renderMermaidToSvg(mmdContent: string, outputPath: string): Promise<boolean> {
  // Try mermaid.ink API (free, no deps)
  try {
    const encoded = Buffer.from(mmdContent, 'utf-8').toString('base64url')
    const url = `https://mermaid.ink/svg/${encoded}`
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) })
    if (res.ok) {
      const svg = await res.text()
      fs.writeFileSync(outputPath, svg)
      return true
    }
  } catch {
    // Fall through to .mmd file
  }
  return false
}

async function writeDiagram(mmdContent: string, basePath: string): Promise<string> {
  const svgPath = basePath + '.svg'
  const rendered = await renderMermaidToSvg(mmdContent, svgPath)
  if (rendered) return svgPath
  // Fallback: save as .mmd text
  const mmdPath = basePath + '.mmd'
  fs.writeFileSync(mmdPath, mmdContent)
  return mmdPath
}

async function generateDiagrams(plan: ProjectPlan, outputDir: string): Promise<string[]> {
  const files: string[] = []

  const components = plan.architecture.components as
    | Array<{ name: string; description: string; connections?: string[] }>
    | undefined
  if (components?.length) {
    const f = await writeDiagram(
      buildArchitectureMmd(components),
      path.join(outputDir, 'architecture'),
    )
    files.push(f)
  }

  const dataModel = plan.architecture.dataModel as
    | Array<{ entity: string; fields: string[]; relationships?: string[] }>
    | undefined
  if (dataModel?.length) {
    const f = await writeDiagram(buildErDiagramMmd(dataModel), path.join(outputDir, 'data-model'))
    files.push(f)
  }

  const phases = plan.timeline.phases as
    | Array<{ name: string; duration: string; deliverables: string[] }>
    | undefined
  if (phases?.length) {
    const lines = ['gantt', '  dateFormat YYYY-MM-DD', '  title Project Timeline']
    for (const p of phases) {
      lines.push(`  section ${p.name}`)
      for (const d of p.deliverables) lines.push(`    ${d} : ${p.duration}`)
    }
    const f = await writeDiagram(lines.join('\n'), path.join(outputDir, 'timeline'))
    files.push(f)
  }

  return files
}

// ── Markdown export ───────────────────────────────────────────────────

function planToMarkdown(plan: ProjectPlan): string {
  const lines: string[] = []
  const ov = plan.overview as Record<string, unknown>

  lines.push(`# ${ov.name || 'Project Plan'}`)
  lines.push('')
  if (ov.description) {
    lines.push(`> ${ov.description}`)
    lines.push('')
  }

  for (const key of PLAN_SECTIONS) {
    const section = (plan as Record<string, unknown>)[key]
    const completeness = getSectionCompleteness(plan, key)
    if (completeness === 0) continue

    lines.push(`## ${SECTION_LABELS[key]}`)
    lines.push('')

    if (Array.isArray(section)) {
      for (const item of section) {
        if (typeof item === 'object') {
          lines.push(formatObject(item as Record<string, unknown>, 0))
          lines.push('')
        } else {
          lines.push(`- ${item}`)
        }
      }
    } else if (typeof section === 'object' && section !== null) {
      lines.push(formatObject(section as Record<string, unknown>, 0))
    }
    lines.push('')
  }

  return lines.join('\n')
}

function formatObject(obj: Record<string, unknown>, depth: number): string {
  const indent = '  '.repeat(depth)
  return Object.entries(obj)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => {
      const label = k.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())
      if (typeof v === 'string') return `${indent}**${label}:** ${v}`
      if (Array.isArray(v)) {
        if (v.length === 0) return null
        const items = v
          .map((item) =>
            typeof item === 'object'
              ? `${indent}  - ${JSON.stringify(item)}`
              : `${indent}  - ${item}`,
          )
          .join('\n')
        return `${indent}**${label}:**\n${items}`
      }
      if (typeof v === 'object' && v !== null) {
        return `${indent}**${label}:**\n${formatObject(v as Record<string, unknown>, depth + 1)}`
      }
      return `${indent}**${label}:** ${v}`
    })
    .filter(Boolean)
    .join('\n')
}

// ── System prompt builder ─────────────────────────────────────────────

function buildSystemPrompt(personality: string, plan: ProjectPlan): string {
  const incompleteSections = PLAN_SECTIONS.filter((k) => getSectionCompleteness(plan, k) < 80).map(
    (k) => SECTION_LABELS[k],
  )

  const fn = plan.foundation as Record<string, unknown>
  const pu = (fn?.primaryUser as Record<string, unknown>) || {}
  const ov = plan.overview as Record<string, unknown>
  const summaryParts: string[] = []
  if (pu.description) summaryParts.push(`**Primary User:** ${pu.description}`)
  if (fn?.designFilter) summaryParts.push(`**Design Filter:** ${fn.designFilter}`)
  if (ov.name) summaryParts.push(`**Project:** ${ov.name}`)
  if (ov.description) summaryParts.push(`**Description:** ${ov.description}`)
  if (ov.goals) summaryParts.push(`**Goals:** ${(ov.goals as string[]).join(', ')}`)
  const planSummary = summaryParts.length ? summaryParts.join('\n') : 'No data yet.'

  return `${PERSONALITIES[personality] || PERSONALITIES.friendly}

## Your Role
You are helping a user plan a project through a terminal conversation.
Guide them through structured questions to build a comprehensive project plan.
Start with the foundation: who is the first specific person who will use this?

## How to Work
1. Ask 1-3 focused questions at a time. Don't overwhelm the user.
2. After each response, use the update_plan tool to save information to the relevant plan section.
3. Be conversational — this should feel like a helpful discussion, not a form.
4. When you have enough info for a section, move to the next incomplete one.
5. Proactively suggest ideas and best practices.
6. If something seems unrealistic, kindly flag it and suggest alternatives.

## Sections Still Needing Input
${incompleteSections.join(', ') || 'All sections have some data — review and refine.'}

## Current Plan State
${planSummary}

## Guidelines
- Keep language simple and accessible
- When recommending technologies, explain WHY
- Always consider budget implications
- Suggest alternatives when possible
- Use the update_plan tool after every meaningful exchange`
}

// ── Progress display ──────────────────────────────────────────────────

function printProgress(plan: ProjectPlan) {
  console.log('\n┌─────────────────────────────────────────┐')
  console.log('│          📋 Plan Progress                │')
  console.log('├─────────────────────────────────────────┤')
  for (const key of PLAN_SECTIONS) {
    const pct = getSectionCompleteness(plan, key)
    const bar = '█'.repeat(Math.round(pct / 10)) + '░'.repeat(10 - Math.round(pct / 10))
    const status = pct === 0 ? '  ' : pct === 100 ? '✓ ' : '◦ '
    console.log(`│ ${status}${SECTION_LABELS[key].padEnd(22)} ${bar} ${String(pct).padStart(3)}% │`)
  }
  console.log('├─────────────────────────────────────────┤')
  const overall = getOverallCompleteness(plan)
  console.log(`│   Overall: ${String(overall).padStart(3)}%                         │`)
  console.log('└─────────────────────────────────────────┘')
}

// ── CLI readline helper ───────────────────────────────────────────────

function ask(rl: readline.Interface, prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => resolve(answer))
  })
}

// ── CLI command handler ───────────────────────────────────────────────

function handleCommand(
  cmd: string,
  plan: ProjectPlan,
  outputDir: string,
  rl: readline.Interface,
): boolean {
  if (cmd === '/quit' || cmd === '/exit') {
    savePlan(plan, outputDir)
    console.log('\n👋 Plan saved. Goodbye!')
    rl.close()
    process.exit(0)
  }
  if (cmd === '/progress') {
    printProgress(plan)
    return true
  }
  if (cmd === '/save') {
    savePlan(plan, outputDir)
    return true
  }
  if (cmd === '/export') {
    const md = planToMarkdown(plan)
    const filePath = path.join(outputDir, 'plan.md')
    fs.writeFileSync(filePath, md)
    console.log(`\n📄 Exported to ${filePath}`)
    return true
  }
  if (cmd === '/diagrams') {
    generateDiagrams(plan, outputDir).then((files) => {
      if (files.length === 0) {
        console.log(
          '\n⚠️  No diagram data yet. Keep planning to fill in architecture and timeline.',
        )
      } else {
        console.log(`\n📊 Generated ${files.length} diagram(s):`)
        for (const f of files) {
          const isSvg = f.endsWith('.svg')
          console.log(`   ${f}${isSvg ? '' : ' (open in https://mermaid.live)'}`)
        }
      }
    })
    return true
  }
  if (cmd === '/plan') {
    console.log('\n' + JSON.stringify(plan, null, 2))
    return true
  }
  console.log('Unknown command. Available: /progress /save /export /diagrams /plan /quit')
  return true
}

function parseArgs() {
  const args = process.argv.slice(2)
  const getArg = (flag: string) => {
    const idx = args.indexOf(flag)
    return idx !== -1 && args[idx + 1] ? args[idx + 1] : null
  }
  return {
    personality: getArg('--personality') || 'friendly',
    loadFile: getArg('--load'),
    ideaArg: getArg('--idea'),
  }
}

function printBanner(model: string, personality: string, outputDir: string) {
  console.log('')
  console.log('🧠 Think Tank CLI')
  console.log('─'.repeat(42))
  console.log(`   Model: ${model}`)
  console.log(`   Personality: ${personality}`)
  console.log(`   Output: ${outputDir}/`)
  console.log('')
  console.log('   Commands:')
  console.log('     /progress  — Show plan completion')
  console.log('     /save      — Save plan to JSON')
  console.log('     /export    — Export as Markdown')
  console.log('     /diagrams  — Generate Mermaid diagrams')
  console.log('     /plan      — Print current plan JSON')
  console.log('     /quit      — Save and exit')
  console.log('─'.repeat(42))
  console.log('')
}

// ── Get initial idea ──────────────────────────────────────────────────

async function getIdea(
  rl: readline.Interface,
  ideaArg: string | null,
  loadFile: string | null,
): Promise<string> {
  if (ideaArg) {
    console.log(`💡 Idea: ${ideaArg}\n`)
    return ideaArg
  }
  if (!loadFile) {
    const idea = await ask(rl, '💡 Describe your project idea:\n> ')
    console.log('')
    return idea
  }
  return ''
}

// ── Send initial idea to Claude ───────────────────────────────────────

async function sendInitialIdea(
  client: Anthropic,
  model: string,
  personality: string,
  plan: ProjectPlan,
  messages: Anthropic.MessageParam[],
  idea: string,
): Promise<number> {
  messages.push({
    role: 'user',
    content: `The user has this project idea: "${idea}"\n\nStart with the foundation: who is the first specific person who will use this? Ask 2-3 questions about the primary user — a real person, not a demographic category.\nAlso use the update_plan tool to set the initial overview with what you can already infer.`,
  })
  const response = await callClaude(client, model, personality, plan, messages)
  await processResponse(response, plan, messages, { client, model, personality })
  return (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0)
}

// ── Conversation loop ─────────────────────────────────────────────────

async function conversationLoop(
  client: Anthropic,
  model: string,
  personality: string,
  plan: ProjectPlan,
  messages: Anthropic.MessageParam[],
  rl: readline.Interface,
  outputDir: string,
  initialTokens: number,
) {
  let totalTokens = initialTokens
  while (true) {
    const input = await ask(rl, '\n📝 You:\n> ')
    if (!input.trim()) continue

    if (input.startsWith('/')) {
      handleCommand(input.trim().toLowerCase(), plan, outputDir, rl)
      continue
    }

    messages.push({ role: 'user', content: input })
    try {
      const response = await callClaude(client, model, personality, plan, messages)
      totalTokens += (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0)
      await processResponse(response, plan, messages, { client, model, personality })
      const cost = (totalTokens / 1_000_000) * 6
      console.log(`\n   [tokens: ${totalTokens.toLocaleString()} | est. cost: $${cost.toFixed(3)}]`)
    } catch (err) {
      console.error(`\n❌ Error: ${err instanceof Error ? err.message : err}`)
    }
  }
}

// ── Main ──────────────────────────────────────────────────────────────

async function main() {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    console.error('❌ Set ANTHROPIC_API_KEY environment variable.')
    console.error('   export ANTHROPIC_API_KEY=sk-ant-...')
    process.exit(1)
  }

  const model = process.env.THINK_TANK_MODEL || 'claude-sonnet-4-6'
  const { personality, loadFile, ideaArg } = parseArgs()
  const client = new Anthropic({ apiKey })

  const plan: ProjectPlan = loadFile
    ? JSON.parse(fs.readFileSync(loadFile, 'utf-8'))
    : createEmptyPlan()
  if (loadFile) console.log(`📂 Loaded plan from ${loadFile}`)

  // Session-based output: each run gets its own folder
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  const sessionName = ideaArg
    ? ideaArg
        .slice(0, 30)
        .replace(/[^a-zA-Z0-9]+/g, '-')
        .replace(/-+$/, '')
        .toLowerCase()
    : 'session'
  const outputDir = path.resolve('think-tank-output', `${sessionName}-${timestamp}`)
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true })

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  printBanner(model, personality, outputDir)

  const idea = await getIdea(rl, ideaArg, loadFile)
  const messages: Anthropic.MessageParam[] = []
  let tokens = 0

  if (idea) {
    tokens = await sendInitialIdea(client, model, personality, plan, messages, idea)
  } else {
    console.log('Resuming from loaded plan. Type your message or a command.\n')
  }

  await conversationLoop(client, model, personality, plan, messages, rl, outputDir, tokens)
}

// ── Claude API call ───────────────────────────────────────────────────

async function callClaude(
  client: Anthropic,
  model: string,
  personality: string,
  plan: ProjectPlan,
  messages: Anthropic.MessageParam[],
): Promise<Anthropic.Message> {
  const systemPrompt = buildSystemPrompt(personality, plan)

  return client.messages.create({
    model,
    max_tokens: 4096,
    system: systemPrompt,
    messages,
    tools: [UPDATE_PLAN_TOOL],
  })
}

// ── Process Claude response ───────────────────────────────────────────

interface ProcessContext {
  client: Anthropic
  model: string
  personality: string
}

async function processResponse(
  response: Anthropic.Message,
  plan: ProjectPlan,
  messages: Anthropic.MessageParam[],
  ctx: ProcessContext,
) {
  const assistantContent: Anthropic.ContentBlockParam[] = []
  const toolResults: Array<{ type: 'tool_result'; tool_use_id: string; content: string }> = []

  for (const block of response.content) {
    if (block.type === 'text') {
      console.log(`\n🤖 Think Tank:\n${block.text}`)
      assistantContent.push({ type: 'text', text: block.text })
    } else if (block.type === 'tool_use') {
      assistantContent.push({
        type: 'tool_use',
        id: block.id,
        name: block.name,
        input: block.input as Record<string, unknown>,
      })

      if (block.name === 'update_plan') {
        const input = block.input as { section: string; data: Record<string, unknown> }
        applyPlanUpdate(plan, input.section, input.data)
        console.log(`   📝 Updated: ${SECTION_LABELS[input.section] || input.section}`)

        toolResults.push({
          type: 'tool_result',
          tool_use_id: block.id,
          content: 'Plan updated successfully.',
        })
      }
    }
  }

  // Add assistant message to history
  messages.push({ role: 'assistant', content: assistantContent })

  // If there were tool uses, send tool results and make a follow-up API call
  if (toolResults.length > 0) {
    messages.push({ role: 'user', content: toolResults })
    const continuation = await callClaude(ctx.client, ctx.model, ctx.personality, plan, messages)
    await processResponse(continuation, plan, messages, ctx)
  }

  // Update lastModified
  plan.meta.lastModified = new Date().toISOString()
}

function applyPlanUpdate(plan: ProjectPlan, section: string, data: Record<string, unknown>) {
  const current = (plan as Record<string, unknown>)[section]
  if (Array.isArray(current)) {
    if (Array.isArray(data)) {
      ;(plan as Record<string, unknown>)[section] = [...current, ...data]
    } else if (Array.isArray(data.items)) {
      ;(plan as Record<string, unknown>)[section] = [...current, ...data.items]
    } else {
      // Single item for array section — wrap and append
      ;(plan as Record<string, unknown>)[section] = [...current, data]
    }
  } else if (typeof current === 'object' && current !== null) {
    ;(plan as Record<string, unknown>)[section] = { ...current, ...data }
  } else {
    ;(plan as Record<string, unknown>)[section] = data
  }
}

// ── Save helper ───────────────────────────────────────────────────────

function savePlan(plan: ProjectPlan, outputDir: string) {
  const filePath = path.join(outputDir, 'plan.json')
  fs.writeFileSync(filePath, JSON.stringify(plan, null, 2))
  console.log(`\n💾 Saved to ${filePath}`)
}

// ── Run ───────────────────────────────────────────────────────────────

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
