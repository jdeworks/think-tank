#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
#  Think Tank — Local Planning Session
#
#  Usage:
#    ./start-local.sh                              # Interactive setup menu
#    ./start-local.sh --idea "My app idea"         # Start with an idea
#    ./start-local.sh --personality critical        # Choose personality
#    ./start-local.sh --mode claude                # Use Claude Code (subscription)
#    ./start-local.sh --mode api                   # Use Anthropic API directly
#    ./start-local.sh --load plan.json             # Resume a previous plan
#    ./start-local.sh --no-menu                    # Skip menu, use .env defaults
#
#  Modes:
#    claude  — Runs via Claude Code CLI (uses your subscription, no API key)
#    api     — Calls Anthropic API directly (requires ANTHROPIC_API_KEY)
#
#  Personalities: friendly, researcher, critical, architect, budget
# ─────────────────────────────────────────────────────────────
set -euo pipefail
cd "$(dirname "$0")"

# ── Load .env defaults ───────────────────────────────────────

if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

# Defaults (env / .env can override)
MODE="${THINK_TANK_MODE:-claude}"
PERSONALITY="${THINK_TANK_PERSONALITY:-friendly}"
OUTPUT_DIR="${THINK_TANK_OUTPUT:-think-tank-output}"
MODEL="${THINK_TANK_MODEL:-claude-sonnet-4-6}"
IDEA=""
LOAD_FILE=""
SHOW_MENU=true

# ── Parse CLI args (override env) ────────────────────────────

while [[ $# -gt 0 ]]; do
  case "$1" in
    --mode)        MODE="$2"; shift 2 ;;
    --personality) PERSONALITY="$2"; shift 2 ;;
    --idea)        IDEA="$2"; shift 2 ;;
    --load)        LOAD_FILE="$2"; shift 2 ;;
    --model)       MODEL="$2"; shift 2 ;;
    --no-menu)     SHOW_MENU=false; shift ;;
    -h|--help)
      head -17 "$0" | tail -15
      exit 0 ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
done

# ── Preflight checks ────────────────────────────────────────

if ! command -v node &>/dev/null; then
  echo "❌ Node.js is required but not installed."
  echo "   Install it from https://nodejs.org/ (v18+)"
  exit 1
fi

NODE_MAJOR=$(node -p 'process.versions.node.split(".")[0]')
if [ "$NODE_MAJOR" -lt 18 ]; then
  echo "❌ Node.js 18+ is required (you have v$(node -v))"
  exit 1
fi

if [ ! -d node_modules ]; then
  echo "📦 Installing dependencies..."
  npm install
fi

# ── Interactive setup menu ───────────────────────────────────

print_header() {
  echo ""
  echo "🧠 Think Tank — Local Planning Session"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

select_mode() {
  echo ""
  echo "  How do you want to run Think Tank?"
  echo ""
  echo "    1) claude  — Claude Code CLI (uses your subscription, no API key)"
  echo "    2) api     — Anthropic API (requires ANTHROPIC_API_KEY)"
  echo ""
  local current="$MODE"
  read -rp "  Choose [1/2] (current: $current): " choice
  case "$choice" in
    1) MODE="claude" ;;
    2) MODE="api" ;;
    "") ;; # keep default
    *) echo "  Using default: $current" ;;
  esac
}

select_personality() {
  echo ""
  echo "  Choose a planning personality:"
  echo ""
  echo "    1) friendly    — Encouraging, explains jargon (default)"
  echo "    2) researcher  — Competitor/market analysis focus"
  echo "    3) critical    — Stress-tests assumptions"
  echo "    4) architect   — System design deep-dives"
  echo "    5) budget      — Cost/ROI optimization"
  echo ""
  local current="$PERSONALITY"
  read -rp "  Choose [1-5] (current: $current): " choice
  case "$choice" in
    1) PERSONALITY="friendly" ;;
    2) PERSONALITY="researcher" ;;
    3) PERSONALITY="critical" ;;
    4) PERSONALITY="architect" ;;
    5) PERSONALITY="budget" ;;
    "") ;; # keep default
    *) echo "  Using default: $current" ;;
  esac
}

get_idea() {
  if [ -z "$IDEA" ] && [ -z "$LOAD_FILE" ]; then
    echo ""
    read -rp "  💡 Describe your project idea (or press Enter to skip): " IDEA
  fi
}

select_model() {
  if [ "$MODE" = "api" ]; then
    echo ""
    echo "  Choose a model:"
    echo ""
    echo "    1) claude-sonnet-4-6   — Fast, great balance (default)"
    echo "    2) claude-haiku-4-5-20251001    — Cheapest, good for iteration"
    echo "    3) claude-opus-4-6     — Most capable, slower + expensive"
    echo ""
    local current="$MODEL"
    read -rp "  Choose [1-3] (current: $current): " choice
    case "$choice" in
      1) MODEL="claude-sonnet-4-6" ;;
      2) MODEL="claude-haiku-4-5-20251001" ;;
      3) MODEL="claude-opus-4-6" ;;
      "") ;; # keep default
      *) echo "  Using default: $current" ;;
    esac
  fi
}

confirm_settings() {
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "  Mode:        $MODE"
  echo "  Personality: $PERSONALITY"
  [ "$MODE" = "api" ] && echo "  Model:       $MODEL"
  [ -n "$IDEA" ] && echo "  Idea:        ${IDEA:0:50}..."
  [ -n "$LOAD_FILE" ] && echo "  Resume from: $LOAD_FILE"
  echo "  Output:      $OUTPUT_DIR/"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  read -rp "  Start planning? [Y/n]: " confirm
  if [[ "$confirm" =~ ^[Nn] ]]; then
    echo "  Aborted."
    exit 0
  fi
}

if [ "$SHOW_MENU" = true ]; then
  print_header
  select_mode
  select_personality
  select_model
  get_idea
  confirm_settings
fi

# ── Validate API mode requirements ───────────────────────────

if [ "$MODE" = "api" ]; then
  if [ -z "${ANTHROPIC_API_KEY:-}" ]; then
    echo ""
    echo "❌ API mode requires ANTHROPIC_API_KEY."
    echo "   Set it in .env or: export ANTHROPIC_API_KEY=sk-ant-..."
    echo "   Or switch to 'claude' mode to use your subscription."
    exit 1
  fi
fi

if [ "$MODE" = "claude" ]; then
  if ! command -v claude &>/dev/null; then
    echo ""
    echo "❌ Claude Code CLI not found."
    echo "   Install it: npm install -g @anthropic-ai/claude-code"
    echo "   Or switch to 'api' mode."
    exit 1
  fi
fi

# ── Launch: Claude Code headless mode ────────────────────────

if [ "$MODE" = "claude" ]; then
  # Build the prompt for Claude Code
  PROMPT="Read the CLAUDE.md file in this project directory and follow its planning instructions."
  PROMPT+=" Use the '$PERSONALITY' personality from prompts/personalities/$PERSONALITY.md."

  if [ -n "$LOAD_FILE" ]; then
    PROMPT+=" Resume from the existing plan at '$LOAD_FILE'."
  elif [ -n "$IDEA" ]; then
    PROMPT+=" The user's project idea is: \"$IDEA\"."
    PROMPT+=" Start with the foundation section (who is this for?) and work through all sections interactively."
  else
    PROMPT+=" Ask the user for their project idea, then start with the foundation section."
  fi

  PROMPT+=" Save all outputs (plan.json, plan.md, diagrams) to the $OUTPUT_DIR/ directory."

  echo ""
  echo "🧠 Launching Think Tank via Claude Code..."
  echo ""

  exec claude -p "$PROMPT"
fi

# ── Launch: API mode (existing CLI) ──────────────────────────

export ANTHROPIC_API_KEY
export THINK_TANK_MODEL="$MODEL"

CLI_ARGS=()
CLI_ARGS+=(--personality "$PERSONALITY")
[ -n "$IDEA" ] && CLI_ARGS+=(--idea "$IDEA")
[ -n "$LOAD_FILE" ] && CLI_ARGS+=(--load "$LOAD_FILE")

echo ""
echo "🧠 Launching Think Tank via API..."
echo "   Model: $MODEL"
echo ""

exec npx tsx cli/think-tank.ts "${CLI_ARGS[@]}"
