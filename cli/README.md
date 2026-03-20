# Think Tank — Local CLI Instructions

## Quick Start

### Option 1: Interactive CLI (recommended)

```bash
# Set your API key
export ANTHROPIC_API_KEY=sk-ant-...

# Run the interactive planner
npx tsx cli/think-tank.ts

# Or start with an idea directly
npx tsx cli/think-tank.ts --idea "I want to build a recipe sharing app"

# Choose a personality
npx tsx cli/think-tank.ts --personality critical

# Resume from a previous plan
npx tsx cli/think-tank.ts --load think-tank-output/plan.json
```

**Available personalities:** `friendly` (default), `researcher`, `critical`, `architect`, `budget`

**In-session commands:**
| Command | What it does |
|---------|-------------|
| `/progress` | Show completion % for each plan section |
| `/save` | Save plan as JSON to `think-tank-output/plan.json` |
| `/export` | Export plan as Markdown to `think-tank-output/plan.md` |
| `/diagrams` | Generate Mermaid `.mmd` files (architecture, data model, timeline) |
| `/plan` | Print raw plan JSON |
| `/quit` | Save and exit |

**Output files go to `think-tank-output/`:**
- `plan.json` — Structured plan (importable into the web UI)
- `plan.md` — Human-readable Markdown
- `architecture.mmd` — System architecture flowchart
- `data-model.mmd` — Entity relationship diagram
- `timeline.mmd` — Gantt chart

### Option 2: Use with Claude Code directly

If you have Claude Code (this CLI), you can use it as the planner itself. Just tell Claude Code:

> "Read CLAUDE.md and help me plan a project. My idea is: ..."

Claude Code will then:
1. Read the plan schema from `src/schema/project-plan.ts`
2. Ask you questions iteratively
3. Build the plan JSON progressively
4. Save it to `think-tank-output/plan.json`
5. Generate diagrams and exports when ready

### Option 3: Web UI

```bash
npm run dev
# Open http://localhost:5173/think-tank/
```

## Rendering Mermaid Diagrams

The CLI generates `.mmd` files. To convert them to images:

```bash
# Install the Mermaid CLI (one-time)
npm install -g @mermaid-js/mermaid-cli

# Render to SVG
mmdc -i think-tank-output/architecture.mmd -o think-tank-output/architecture.svg

# Render to PNG
mmdc -i think-tank-output/architecture.mmd -o think-tank-output/architecture.png

# Render all diagrams
for f in think-tank-output/*.mmd; do
  mmdc -i "$f" -o "${f%.mmd}.svg"
done
```

Or paste the `.mmd` content into https://mermaid.live for instant preview.

## Plan Schema

The structured plan covers these sections:

| Section | Key Fields |
|---------|-----------|
| **Overview** | name, description, problem statement, goals, target users, success metrics |
| **Requirements** | functional (with priority), non-functional, constraints, assumptions |
| **Architecture** | system type, pattern, components (with connections), data model, API design |
| **Tech Stack** | frontend, backend, database, infrastructure, key dependencies, rationale |
| **Hosting** | platform, CI/CD, environments, domain, estimated monthly cost |
| **Security** | authentication, authorization, encryption, API key management, compliance |
| **Design** | design system, key user flows, responsive strategy, accessibility |
| **Budget** | development effort, infrastructure costs, third-party costs, total estimate |
| **Timeline** | phases (with deliverables), milestones |
| **Risks** | description, category, impact, likelihood, mitigation |
| **Competitors** | name, URL, description, strengths, weaknesses |

## Tips

- The JSON output is compatible with the web UI — export from CLI, import in browser (or vice versa)
- Use `--personality researcher` for more competitor/market analysis focus
- Use `--personality critical` for stress-testing your idea
- Use `--personality budget` for cost-focused planning
- Set `THINK_TANK_MODEL=claude-haiku-4-5-20251001` for cheaper (but less detailed) planning
