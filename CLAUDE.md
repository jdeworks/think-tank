# Think Tank — Agent Instructions

This file tells any AI coding agent (Claude Code, Cursor, Cody, Copilot, etc.) how to run a Think Tank planning session.

## Prompt Source

All planning prompts live in the `prompts/` folder. This is the single source of truth:

```
prompts/
├── system.md              # How to guide the conversation
├── personalities/         # 5 personality styles
├── sections/              # Per-section questions, tips, and common mistakes
│   ├── 00-foundation.md   # Mandatory: who is this for? (must complete before tech sections)
│   ├── 01-overview.md ... 11-risks.md
├── config/                # Optional workspace-specific context
│   ├── README.md
│   └── workspace.example.md
└── tips/                  # Quality checklist, best practices, common mistakes
```

**Read these before starting a planning session.** They contain the questions to ask, the quality tips to follow, and the mistakes to avoid.

## When to Activate

When a user says anything like:
- "help me plan a project"
- "I want to build..."
- "create a plan for..."
- "think tank: [idea]"

## The Process — GUIDED, Not Generated

**CRITICAL: This is an interactive, guided process. You MUST ask questions and wait for answers. Do NOT generate a full plan in one shot.**

### Step 0: Setup
1. Read `prompts/system.md` for the overall approach
2. Read the relevant personality from `prompts/personalities/`
3. If `prompts/config/` contains workspace files, read them for context
4. Create the session output directory:
   ```bash
   mkdir -p think-tank-output/<idea-slug>-$(date +%Y-%m-%dT%H-%M-%S)
   ```

### Step 1: Foundation — Who Is This For?
Read `prompts/sections/00-foundation.md`. Establish the primary user, their context, and the design filter sentence. **This must complete before any architecture/tech/design sections.** Wait for answers.

### Step 2: Walk Through Each Section
For each section (in order 01-11):
1. Read `prompts/sections/<section>.md` for questions and tips
2. Ask 2-3 focused questions
3. **Wait for answers**
4. Update the plan JSON
5. Move to the next section

### Step 3: Implementation Review
Read `prompts/sections/12-implementation-review.md`. Review the plan from the perspective of someone who has to BUILD it:
1. Identify any "X or Y" decisions that aren't resolved — ask the user to pick one
2. Check that integration methods are explicit (URL? npm install? copy?)
3. Verify exact versions, file structures, and deployment commands are specified
4. Ask: "Could an AI agent implement this with zero follow-up questions?"
5. Add resolved decisions as `implementationNotes` in the plan

**This step prevents the implementing agent from needing to stop and ask questions.**

### Step 4: Generate Outputs
After all sections are discussed AND reviewed, create files in the session directory:
- `plan.json` — Structured plan (validate against `src/schema/project-plan.ts`)
- `plan.md` — Human-readable Markdown
- `architecture.svg` — Via mermaid.ink or `.mmd` fallback
- `data-model.svg` — If data model exists
- `timeline.svg` — If timeline exists

### Step 5: Quality Review
Read `prompts/tips/quality-checklist.md` and verify the plan against it (including the new "Implementation Readiness" section). Report any gaps to the user.

### Step 6: Validate
```bash
npx tsx -e "
import{readFileSync}from'fs';
import{ProjectPlanSchema}from'./src/schema/project-plan.ts';
const r=ProjectPlanSchema.safeParse(JSON.parse(readFileSync('./think-tank-output/<session>/plan.json','utf-8')));
console.log(r.success?'VALID':'INVALID:'+JSON.stringify(r.error))
"
```

## Personalities

Default is "friendly." User can request others:
- Read `prompts/personalities/friendly.md` — Encouraging, explains jargon
- Read `prompts/personalities/researcher.md` — Competitor/market focus
- Read `prompts/personalities/critical.md` — Stress-tests assumptions
- Read `prompts/personalities/architect.md` — System design deep-dives
- Read `prompts/personalities/budget.md` — Cost/ROI optimization

## Quality Commands

```bash
make check          # Full quality pipeline
make ci             # Pipeline + build
make test           # Run tests
make deadcode       # Find unused code (Knip)
make health         # Code health metrics
```
