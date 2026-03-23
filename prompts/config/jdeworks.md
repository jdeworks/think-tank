# jdeworks Workspace Configuration

## About this workspace

jdeworks builds tools and products for builders — developers, designers, and
small business owners who want to make things. Products range from general-purpose
developer tools (think-tank, agent-sandbox) to emerging-market consumer products.

## Existing repos and their roles

Read before suggesting a new implementation — these may already solve part of the problem.

| Repo | Role | When to use |
|------|------|-------------|
| `make-a-website` | Static site generator — takes content JSON + template to HTML | Any project that outputs HTML sites |
| `make-it-look-good` | CSS design system — tokens, typography, palettes, components | All new UIs — don't duplicate styling work |
| `get-me-started` | Zero-knowledge onboarding guide | Read before writing copy for non-technical users |
| `agent-sandbox` | AI agent orchestration — conversation loop, tool use, state | Any project with a multi-step AI conversation |
| `think-tank` | Project planning tool (this repo) | Used at the start of every new project |
| `elemental-surprise` | Python tooling — image processing, scripts | Image manipulation, background removal |

### Integration pattern

All repos live side-by-side in the same workspace directory.
Cross-repo paths are configured in `.env` so layout changes don't require code changes:

```env
REPO_MAKE_A_WEBSITE=../make-a-website
REPO_MAKE_IT_LOOK_GOOD=../make-it-look-good
REPO_GET_ME_STARTED=../get-me-started
REPO_AGENT_SANDBOX=../agent-sandbox
REPO_ELEMENTAL_SURPRISE=../elemental-surprise
```

## Preferred tech stack

**Runtime:** Node.js 20 LTS. TypeScript preferred, JavaScript acceptable.

**Frontend:** Vanilla JS for simple tools; React 19 for complex UIs.

**Styling:** `make-it-look-good` design system always. Never introduce a new
CSS approach when the design system already handles it.

**Testing:** Vitest. All projects should have a `make test` target.

**Quality pipeline:** Every project should have `make check` running:
Prettier, ESLint, TypeScript, Knip (dead code), Vitest, code health.

**State (frontend):** Zustand for complex UI state. LocalStorage/IndexedDB for persistence.

**Validation:** Zod 4 for schema validation. Derive types from Zod, don't duplicate.

**Database:** SQLite via `better-sqlite3` for local/POC. Postgres/Supabase for production.

## Emerging market context

Some jdeworks products target the Philippines and Southeast Asia.
If the project being planned targets this market, apply the following:

### Mobile-first is non-negotiable
Most users are phone-only. Every architecture decision must pass:
"does this work on a low-end Android phone on mobile data?"

### Local payments
GCash and Maya are the payment methods, not PayPal or Stripe.
Use HitPay — it handles GCash, Maya, and QR Ph with no monthly fee.

### Language
- **Filipino/Taglish:** Workable with current LLMs. Needs a native reviewer
  to check template strings before launch. Design AI flows to accept Taglish.
- **Cebuano:** NOT launch-ready. Cebuano Wikipedia is heavily bot-generated,
  corrupting LLM training data. Requires native reviewer and golden set first.
- **English:** Always available alongside Filipino.

### Pricing
Show prices in PHP prominently. USD secondary.

### AI cost model for Philippine-market products
Revenue at PHP 299/month Pro tier is roughly $5.20 USD.
40% AI budget is roughly PHP 119 / $2.08 per user per month.
Use claude-haiku-4-5 for ongoing updates, claude-sonnet-4-6 for initial generation.
Prompt caching is mandatory.

## Common mistakes to avoid

1. **Assuming desktop** — test on a real Android phone on mobile data before declaring UX acceptable
2. **Skipping the repo audit** — always read actual source of existing repos before integrating
3. **Building new when existing suffices** — check make-it-look-good, get-me-started, agent-sandbox first
4. **Underestimating language complexity** — Taglish is not translated English, get a native reviewer
