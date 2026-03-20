import type { Personality } from '@/schema/settings'
import { SECTION_LABELS, type ProjectPlan, type PlanSectionKey } from '@/schema/project-plan'

const PERSONALITY_PROMPTS: Record<Personality, string> = {
  friendly: `You are a friendly and encouraging project planning guide. You explain technical concepts in simple terms,
avoid jargon when possible, and help users feel confident about their ideas. When you need to use technical terms,
briefly explain what they mean. Celebrate good ideas and gently redirect less feasible ones.`,

  researcher: `You are a thorough researcher and analyst. You focus on finding competitors, similar projects,
and sources of inspiration. You always consider what already exists in the market and how the user's idea
compares. You suggest features and approaches inspired by successful projects. You provide specific examples
and references whenever possible.`,

  critical: `You are a critical thinker who helps users stress-test their ideas. You ask tough but constructive
questions like "What happens if...?", "Have you considered...?", and "What's your plan B for...?". You identify
potential failure points, scalability issues, and hidden assumptions. You're not negative — you're thorough.
Every challenge you raise comes with a suggested approach.`,

  architect: `You are a technical architect focused on system design and engineering decisions. You dive deep into
architecture patterns, technology trade-offs, scalability concerns, and best practices. You think about
data flow, API design, component boundaries, and infrastructure. You recommend specific technologies with
clear rationale.`,

  budget: `You are a budget-conscious planner who focuses on costs, ROI, and resource efficiency. You always
consider the cost implications of decisions — hosting, services, development time, maintenance. You suggest
cost-effective alternatives and help users understand the total cost of ownership. You think about free tiers,
open-source alternatives, and scaling costs.`,
}

const UPDATE_PLAN_TOOL = {
  type: 'function' as const,
  function: {
    name: 'update_plan',
    description:
      'Update one or more sections of the project plan based on information gathered from the conversation.',
    parameters: {
      type: 'object',
      properties: {
        section: {
          type: 'string',
          enum: [
            'overview',
            'requirements',
            'architecture',
            'techStack',
            'hosting',
            'security',
            'design',
            'budget',
            'timeline',
            'risks',
            'competitors',
          ],
          description: 'The plan section to update',
        },
        data: {
          type: 'object',
          description: 'The updated data for this section. Must match the section schema.',
        },
      },
      required: ['section', 'data'],
    },
  },
}

export function getUpdatePlanTool() {
  return UPDATE_PLAN_TOOL
}

export function buildSystemPrompt(
  personality: Personality,
  plan: ProjectPlan,
  incompleteSections: PlanSectionKey[],
  sectionGuide?: string,
): string {
  const personalityPrompt = PERSONALITY_PROMPTS[personality]
  const planSummary = buildPlanSummary(plan)
  const incompleteLabels = incompleteSections.map((s) => SECTION_LABELS[s]).join(', ')

  let prompt = `${personalityPrompt}

## Your Role
You are helping a user plan a software project from scratch. Your job is to guide them through a structured
conversation, asking questions to gather information and build a comprehensive project plan.

## How to Work
1. Ask 1-3 focused questions at a time. Don't overwhelm the user.
2. After each response, use the update_plan tool to save any new information to the relevant plan section.
3. Be conversational — this should feel like a helpful discussion, not a form to fill out.
4. When you have enough info for a section, move to the next incomplete one.
5. Proactively suggest ideas and best practices — don't just ask, also advise.
6. When the user mentions competitors or similar projects, research them and add to the competitors section.
7. If something seems unrealistic, kindly flag it and suggest alternatives.

## Sections Still Needing Input
${incompleteLabels || 'All sections have some data — review and refine as needed.'}

## Current Plan State
${planSummary}

## Important Guidelines
- Keep language simple and accessible for non-technical users
- When recommending technologies, briefly explain WHY
- Always consider budget implications of your suggestions
- Suggest alternatives when possible (e.g., "You could use X (free) or Y (paid, more features)")
- If the user seems stuck, provide concrete examples or options to choose from
- Use the update_plan tool after every meaningful exchange to keep the plan up to date`

  if (sectionGuide) {
    prompt += `\n\n## Current Section Guide\n${sectionGuide}`
  }

  return prompt
}

function addField(parts: string[], label: string, value: string | undefined | null): void {
  if (value) {
    parts.push(`**${label}:** ${value}`)
  }
}

function buildPlanSummary(plan: ProjectPlan): string {
  const parts: string[] = []

  addField(parts, 'Project', plan.overview.name)
  addField(parts, 'Description', plan.overview.description)
  if (plan.overview.goals?.length) {
    parts.push(`**Goals:** ${plan.overview.goals.join(', ')}`)
  }
  addField(parts, 'Target Users', plan.overview.targetUsers)
  addField(parts, 'System Type', plan.architecture.systemType)
  addField(parts, 'Architecture', plan.architecture.pattern)
  addField(parts, 'Frontend', plan.techStack.frontend?.framework)
  if (plan.techStack.backend?.language) {
    parts.push(
      `**Backend:** ${plan.techStack.backend.language} / ${plan.techStack.backend.framework || 'TBD'}`,
    )
  }
  addField(parts, 'Hosting', plan.hosting.platform)
  if (plan.competitors.length > 0) {
    parts.push(`**Competitors Found:** ${plan.competitors.map((c) => c.name).join(', ')}`)
  }
  if (plan.risks.length > 0) {
    parts.push(`**Risks Identified:** ${plan.risks.length}`)
  }

  return parts.length > 0 ? parts.join('\n') : 'No data yet — starting fresh.'
}

export function buildInitialPrompt(idea: string, personality: Personality): string {
  const openers: Record<Personality, string> = {
    friendly: `Great idea! Let me help you turn this into a solid plan.`,
    researcher: `Interesting concept. Let me think about what's already out there and how we can position this.`,
    critical: `Let's dig into this and make sure we've thought through all the angles.`,
    architect: `Let's think about how to build this right from the ground up.`,
    budget: `Let's figure out how to make this happen efficiently and cost-effectively.`,
  }

  return `The user has this project idea: "${idea}"

${openers[personality]} Start by asking 2-3 key questions to understand the core of what they want to build.
Focus on: What problem does it solve? Who is it for? What's the most important feature?

Also use the update_plan tool to set the initial overview with what you can already infer from their idea.`
}
