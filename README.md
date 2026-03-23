## 🤖 Using this repo with AI assistants

This repo is designed to work with AI tools whether you are in an online chat or using a local agent.

**If you are using an online chatbox** (Claude.ai, ChatGPT, Gemini, Perplexity, etc.):

Fetch the pre-built context bundle directly — no GitHub API calls, no rate limits:
```xml
https://raw.githubusercontent.com/jdeworks/think-tank/dev/bundle.xml
```

Paste that URL in your chat and say: *"Use this as the full context for think-tank. I want to [your goal]."*

**If you are using a local AI agent** (Claude Code, Cursor, Windsurf, Codex, etc.):

Clone the repo so your agent has the full file structure to work with:
```bash
git clone -b dev https://github.com/jdeworks/think-tank.git
```

Then point your agent at the cloned folder and work directly with the files.

---

# Think Tank

Turn your project idea into a structured, comprehensive plan through AI-guided conversation.

## What It Does

1. **Describe your idea** in plain language — software, physical business, service, anything
2. **Answer questions** as the AI guides you through who it's for, architecture, tech stack, budget, and more
3. **Get a plan** with interactive diagrams, structured JSON, and exportable Markdown

## Features

### Core
- **Multi-provider LLM support** — OpenAI, Anthropic (Claude), or any OpenAI-compatible API (Ollama, LM Studio, Groq, etc.)
- **BYOK (Bring Your Own Key)** — API keys stay in your browser, never sent anywhere except your chosen provider
- **5 AI Personalities** — Friendly Guide, Researcher, Critical Thinker, Technical Architect, Budget Hawk
- **Structured plan schema** — 12 sections covering the full scope of any project (software, physical, service)
- **Tool-calling loop** — The LLM updates the plan progressively via tool calls with automatic continuation

### Visualization
- **Interactive architecture diagrams** — React Flow with auto-layout (dagre)
- **Mermaid diagrams** — Flowcharts, ER data model diagrams, Gantt timeline charts
- **Toggle between views** — Switch between interactive and flowchart diagram modes

### Voice Mode
- **Speech-to-text** — Speak your answers via browser `SpeechRecognition` (Chrome/Edge)
- **Text-to-speech** — Listen to AI responses with markdown-aware text cleaning
- **Free** — Uses browser-native APIs, no additional API key needed

### Data & Export
- **Local storage** — All data in IndexedDB (via localForage), nothing leaves your browser
- **JSON export/import** — Full plan as structured JSON, importable back into the app
- **Markdown export** — Human-readable project document
- **Share links** — lz-string compressed plan data in URL (no server needed)
- **Token tracking** — Real-time token count and estimated cost per model

### Developer Experience
- **100% client-side** — No backend, no accounts, deployable to GitHub Pages
- **CLI companion** — Interactive terminal planner using Anthropic SDK
- **Cloneable** — Run locally with any model including Ollama
- **6 example templates** — Website, SaaS, Mobile App, E-Commerce, API Service, Community Platform

---

## Quick Start

### Web UI (hosted)

Visit [jdeworks.github.io/think-tank](https://jdeworks.github.io/think-tank)

### Web UI (local)

```bash
git clone https://github.com/jdeworks/think-tank.git
cd think-tank
npm install
npm run dev
# Open http://localhost:5173/think-tank/
```

### CLI (with Claude subscription)

```bash
export ANTHROPIC_API_KEY=sk-ant-...
make plan                    # Interactive planner
make plan-critical           # Stress-test personality
make plan-researcher         # Market research focus
make plan-architect          # Architecture deep-dive
```

### Local with Ollama (free, no API key)

```bash
ollama pull llama3
npm run dev
# In Settings: Provider = "OpenAI Compatible", Endpoint = http://localhost:11434/v1, Model = llama3
```

---

## Project Structure

```
think-tank/
├── src/
│   ├── schema/              # Zod schemas (project plan, conversation, settings)
│   ├── engine/              # Conversation engine, prompts, section tracking
│   ├── providers/           # LLM adapters (OpenAI, Anthropic, OpenAI-compatible)
│   ├── stores/              # Zustand state (project, settings, UI)
│   ├── storage/             # IndexedDB persistence (localForage)
│   ├── hooks/               # React hooks (voice, conversation start)
│   ├── utils/               # Export, tokens, Mermaid helpers
│   ├── data/                # Example templates
│   ├── components/
│   │   ├── chat/            # ChatPanel, ChatInput (with mic), MessageBubble (with speaker)
│   │   ├── plan/            # PlanSidebar, PlanView, ArchitectureDiagram, MermaidDiagram
│   │   ├── settings/        # SettingsModal (provider, personality, voice toggle)
│   │   ├── project/         # HomePage, ProjectList
│   │   ├── export/          # ImportButton
│   │   └── common/          # Button, Modal, Badge
│   └── test/                # Test files
├── cli/                     # CLI planner (Anthropic SDK)
├── .github/workflows/       # CI + GitHub Pages deploy
└── Makefile                 # Unified development commands
```

**Stats:** ~40 source files, ~300 tests, ~4,100 source LOC

---

## Plan Schema

The structured output covers 12 sections:

| Section | Key Fields |
|---------|-----------|
| **Foundation** | Primary user (description, device, context, comfort anchor, current solution, first success), design filter |
| **Overview** | Name, description, problem statement, goals, non-goals, success metrics |
| **Requirements** | Functional (with priority: must/should/nice), non-functional, constraints, assumptions |
| **Architecture** | System type, pattern, components (with connections), data model (entities/fields/relationships), API design |
| **Tech Stack** | Frontend (framework/UI/state), backend (language/framework/runtime), database, infrastructure, rationale |
| **Hosting** | Platform, CI/CD, environments, domain, estimated monthly cost |
| **Security** | Authentication, authorization, encryption, API key management, compliance |
| **Design** | Design system, key user flows, responsive strategy, accessibility level |
| **Budget** | Development effort, infrastructure costs, third-party costs, total estimate |
| **Timeline** | Phases (with deliverables), milestones (with target dates) |
| **Risks** | Description, category, impact, likelihood, mitigation strategy |
| **Competitors** | Name, URL, description, strengths, weaknesses |

---

## Development

### Commands (via Makefile)

```
make help           # Show all commands
make dev            # Start dev server
make check          # Full quality pipeline (format + lint + types + deadcode + tests)
make ci             # Full CI (check + build)
make health         # Code health tests only
make deadcode       # Knip dead code detection only
make lint           # ESLint only (includes complexity)
make format         # Auto-format with Prettier
make clean          # Remove build artifacts
```

### Quality Pipeline (`make check`)

Runs 6 stages in order:

| Stage | Tool | What It Checks |
|-------|------|----------------|
| 1. Format | Prettier | Code style consistency |
| 2. Lint | ESLint | Complexity (max 15), nesting (max 4), function length (max 120), params (max 5), type imports, equality |
| 3. Types | TypeScript | Strict type checking |
| 4. Dead code | Knip | Unused exports, dependencies, files |
| 5. Unit tests | Vitest | ~300 tests across schemas, engine, providers, stores, utils, hooks |
| 6. Code health | Custom | File size (350 LOC), function size (80/150 LOC), no console.log, total LOC budget (< 5000) |

### CI Pipelines

- **`ci.yml`** — Runs on push to `dev`/`main` and PRs: full quality pipeline + build
- **`deploy.yml`** — Runs on push to `main`: quality pipeline + build + deploy to GitHub Pages

---

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | React 19 + Vite 8 | Fast builds, static output for GitHub Pages |
| Language | TypeScript (strict) | Type safety, Zod integration |
| Styling | Tailwind CSS 4 | Utility-first, dark mode ready, make-it-look-good design system |
| State | Zustand | Minimal boilerplate, persist middleware |
| Validation | Zod 4 | Single source of truth for plan schema + runtime validation |
| Diagrams | React Flow + Mermaid | Interactive + static diagram options |
| Storage | localForage (IndexedDB) | Handles large project data client-side |
| Sharing | lz-string | URL-safe compression for shareable plan links |
| Voice | Web Speech API | Browser-native STT/TTS, zero dependencies |
| CLI | Anthropic SDK + tsx | Direct Claude API access for terminal planning |
| Testing | Vitest | Fast, Vite-native, ~300 tests |
| Dead code | Knip | Catches unused exports, deps, files |
| Formatting | Prettier | Consistent style |
| Linting | ESLint | Complexity + quality rules |

---

## Security

- **API keys** stored in localStorage with clear user notice — never sent anywhere except the chosen LLM provider
- **Mermaid** uses `securityLevel: 'strict'` to prevent SVG/HTML injection
- **Import validation** — all imported JSON is validated against the Zod schema before use
- **No raw HTML rendering** — react-markdown does not execute HTML by default
- **CSP-friendly** — no inline scripts or eval
- **Conversation history** — truncated to 40 messages to prevent context overflow

---

## License

MIT
