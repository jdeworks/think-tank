# Workspace Configuration

This directory holds optional workspace-specific context files that are loaded
at the start of every planning session.

## How it works

- The core prompts in `prompts/system.md` and `prompts/sections/` are universal
- Files in this directory add workspace context on top — preferred tech stack,
  existing repos, target markets, cost constraints, etc.
- If this directory is empty, the planner works the same — it just asks more questions

## How to use

1. Copy `workspace.example.md` to `workspace.md`
2. Fill in the sections that apply to your workspace
3. Delete sections that don't apply
4. The planner will read this file at session start

## Rules

- Core prompts must never reference workspace-specific content
- Workspace config is additive context, not overrides
- Keep files focused — one file per workspace or team context
