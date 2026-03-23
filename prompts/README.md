# Think Tank Prompts

This folder contains all the planning prompts, personality definitions, section guides, and tips used by Think Tank.

These files are the **single source of truth** for planning guidance. They are used by:
- The **web UI** (bundled at build time via Vite's import.meta.glob)
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
│   ├── 00-foundation.md   # Mandatory: who is this for?
│   ├── 01-overview.md ... 11-risks.md
│   └── 12-implementation-review.md
├── config/                # Optional workspace-specific context
│   ├── README.md
│   └── workspace.example.md
└── tips/                  # General advice
    ├── quality-checklist.md
    ├── common-mistakes.md
    └── best-practices.md
```

## How the Web UI Uses These

Prompts are bundled into the app at build time — no runtime fetches needed.
Edit the markdown files, rebuild, and the changes are live.
