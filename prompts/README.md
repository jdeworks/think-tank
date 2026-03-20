# Think Tank Prompts

This folder contains all the planning prompts, personality definitions, section guides, and tips used by Think Tank.

These files are the **single source of truth** for planning guidance. They are used by:
- The **web UI** (fetched from the public GitHub repo at runtime)
- The **CLI** (read from the local filesystem)
- **AI coding agents** (Claude Code, Cursor, Copilot — via CLAUDE.md/.cursorrules)
- **Humans** (readable markdown for manual planning)

## Structure

```
prompts/
├── system.md              # Base system prompt (how to guide the conversation)
├── personalities/         # AI personality modifiers
│   ├── friendly.md        # Encouraging, explains jargon simply
│   ├── researcher.md      # Competitor/market focused
│   ├── critical.md        # Stress-tests ideas
│   ├── architect.md       # System design focused
│   └── budget.md          # Cost/ROI focused
├── sections/              # Per-section planning guides (questions, tips, mistakes)
│   ├── 01-overview.md
│   ├── 02-competitors.md
│   ├── 03-requirements.md
│   ├── 04-architecture.md
│   ├── 05-tech-stack.md
│   ├── 06-hosting.md
│   ├── 07-security.md
│   ├── 08-design.md
│   ├── 09-budget.md
│   ├── 10-timeline.md
│   └── 11-risks.md
└── tips/                  # General advice
    ├── quality-checklist.md
    ├── common-mistakes.md
    └── best-practices.md
```

## How the Web UI Uses These

The web UI fetches prompts from:
```
https://raw.githubusercontent.com/jdeworks/think-tank/main/prompts/<path>
```

This means prompt updates in the repo are immediately reflected in the live app — no rebuild needed.
