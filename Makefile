.PHONY: help install dev build test lint format check clean plan ci deadcode health

# ── Help ───────────────────────────────────────────────────────────────

help: ## Show this help
	@echo ""
	@echo "  Think Tank — Development Commands"
	@echo "  ──────────────────────────────────"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-16s\033[0m %s\n", $$1, $$2}'
	@echo ""

# ── Setup ──────────────────────────────────────────────────────────────

install: ## Install dependencies
	npm install

# ── Development ────────────────────────────────────────────────────────

dev: ## Start dev server
	npm run dev

build: ## Production build
	npm run build

preview: ## Preview production build
	npm run preview

# ── Quality ────────────────────────────────────────────────────────────

test: ## Run tests
	npm test

test-watch: ## Run tests in watch mode
	npm run test:watch

lint: ## Run ESLint (includes complexity checks)
	npx eslint .

lint-fix: ## Run ESLint with auto-fix
	npx eslint . --fix

format: ## Format code with Prettier
	npx prettier --write "src/**/*.{ts,tsx}" "cli/**/*.ts"

format-check: ## Check formatting without writing
	npx prettier --check "src/**/*.{ts,tsx}" "cli/**/*.ts"

typecheck: ## TypeScript type checking
	npx tsc -b

deadcode: ## Find unused exports, deps, and files (Knip)
	npx knip

health: ## Run code health tests (file/function size, complexity)
	npx vitest run src/test/code-health.test.ts

# ── Full Pipeline ──────────────────────────────────────────────────────

check: format-check lint typecheck deadcode test ## Full quality pipeline
	@echo ""
	@echo "  ✅ All checks passed"
	@echo ""

ci: check build ## Full CI pipeline (check + build)
	@echo ""
	@echo "  ✅ CI pipeline complete"
	@echo ""

# ── CLI Planner ────────────────────────────────────────────────────────

plan: ## Start interactive CLI planner
	npx tsx cli/think-tank.ts

plan-critical: ## Start planner with critical thinker personality
	npx tsx cli/think-tank.ts --personality critical

plan-researcher: ## Start planner with researcher personality
	npx tsx cli/think-tank.ts --personality researcher

plan-architect: ## Start planner with architect personality
	npx tsx cli/think-tank.ts --personality architect

# ── Cleanup ────────────────────────────────────────────────────────────

clean: ## Remove build artifacts
	rm -rf docs dist node_modules/.tmp

clean-output: ## Remove generated plan output
	rm -rf think-tank-output

clean-all: clean clean-output ## Remove all generated files
	rm -rf node_modules
