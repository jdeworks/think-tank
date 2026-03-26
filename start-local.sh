#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
#  Think Tank — Local Planning Session
#
#  Usage:
#    ./start-local.sh                              # Interactive setup menu
#    ./start-local.sh --idea "My app idea"         # Start with an idea
#    ./start-local.sh --personality critical        # Choose personality
#    ./start-local.sh --agent claude               # Use Claude Code
#    ./start-local.sh --agent cursor               # Use Cursor agent
#    ./start-local.sh --mode api                   # Use Anthropic API directly
#    ./start-local.sh --load plan.json             # Resume a previous plan
#    ./start-local.sh --no-menu                    # Skip menu, use .env defaults
#
#  Agents: claude, cursor, codex, aider, custom
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
MODE="${THINK_TANK_MODE:-agent}"
AGENT="${THINK_TANK_AGENT:-claude}"
AGENT_CMD="${THINK_TANK_AGENT_CMD:-}"
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
    --agent)       MODE="agent"; AGENT="$2"; shift 2 ;;
    --agent-cmd)   MODE="agent"; AGENT="custom"; AGENT_CMD="$2"; shift 2 ;;
    --personality) PERSONALITY="$2"; shift 2 ;;
    --idea)        IDEA="$2"; shift 2 ;;
    --load)        LOAD_FILE="$2"; shift 2 ;;
    --model)       MODEL="$2"; shift 2 ;;
    --no-menu)     SHOW_MENU=false; shift ;;
    -h|--help)
      sed -n '2,16p' "$0" | sed 's/^# *//'
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

# ── Known agents and their commands ──────────────────────────
# Each entry: display name, binary name, command template
# The placeholder {PROMPT} is replaced with the actual prompt.

agent_display_name() {
  case "$1" in
    claude) echo "Claude Code" ;;
    cursor) echo "Cursor (agent mode)" ;;
    codex)  echo "OpenAI Codex CLI" ;;
    aider)  echo "Aider" ;;
    custom) echo "Custom ($AGENT_CMD)" ;;
    *)      echo "$1" ;;
  esac
}

agent_binary() {
  case "$1" in
    claude) echo "claude" ;;
    cursor) echo "cursor" ;;
    codex)  echo "codex" ;;
    aider)  echo "aider" ;;
    custom) echo "${AGENT_CMD%% *}" ;;  # first word of custom command
    *)      echo "$1" ;;
  esac
}

# Build the exec command for a given agent + prompt
agent_exec() {
  local agent="$1"
  local prompt="$2"

  case "$agent" in
    claude)
      exec claude -p "$prompt"
      ;;
    cursor)
      exec cursor --agent "$prompt"
      ;;
    codex)
      exec codex "$prompt"
      ;;
    aider)
      exec aider --message "$prompt"
      ;;
    custom)
      if [ -z "$AGENT_CMD" ]; then
        echo "❌ Custom agent requires THINK_TANK_AGENT_CMD in .env or --agent-cmd flag."
        echo "   Example: THINK_TANK_AGENT_CMD='my-agent --prompt'"
        exit 1
      fi
      # shellcheck disable=SC2086
      exec $AGENT_CMD "$prompt"
      ;;
    *)
      echo "❌ Unknown agent: $agent"
      echo "   Supported: claude, cursor, codex, aider, custom"
      exit 1
      ;;
  esac
}

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
  echo "    1) agent  — Via a coding agent CLI (default)"
  echo "    2) api    — Anthropic API directly (requires ANTHROPIC_API_KEY)"
  echo ""
  local current="$MODE"
  read -rp "  Choose [1/2] (current: $current): " choice
  case "$choice" in
    1) MODE="agent" ;;
    2) MODE="api" ;;
    "") ;; # keep default
    *) echo "  Using default: $current" ;;
  esac
}

select_agent() {
  if [ "$MODE" != "agent" ]; then return; fi
  echo ""
  echo "  Which coding agent do you want to use?"
  echo ""
  echo "    1) claude  — Claude Code  (claude -p)"
  echo "    2) cursor  — Cursor       (cursor --agent)"
  echo "    3) codex   — Codex CLI    (codex)"
  echo "    4) aider   — Aider        (aider --message)"
  echo "    5) custom  — Custom command (set in .env or enter below)"
  echo ""
  local current="$AGENT"
  read -rp "  Choose [1-5] (current: $current): " choice
  case "$choice" in
    1) AGENT="claude" ;;
    2) AGENT="cursor" ;;
    3) AGENT="codex" ;;
    4) AGENT="aider" ;;
    5)
      AGENT="custom"
      if [ -z "$AGENT_CMD" ]; then
        read -rp "  Enter command (e.g. 'my-agent --prompt'): " AGENT_CMD
      else
        echo "  Using: $AGENT_CMD"
      fi
      ;;
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

select_model() {
  if [ "$MODE" != "api" ]; then return; fi
  echo ""
  echo "  Choose a model (API mode):"
  echo ""
  echo "    1) claude-sonnet-4-6            — Fast, great balance (default)"
  echo "    2) claude-haiku-4-5-20251001    — Cheapest, good for iteration"
  echo "    3) claude-opus-4-6              — Most capable, slower + expensive"
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
}

get_idea() {
  if [ -z "$IDEA" ] && [ -z "$LOAD_FILE" ]; then
    echo ""
    read -rp "  💡 Describe your project idea (or press Enter to skip): " IDEA
  fi
}

confirm_settings() {
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  if [ "$MODE" = "agent" ]; then
    echo "  Agent:       $(agent_display_name "$AGENT")"
  else
    echo "  Mode:        api"
    echo "  Model:       $MODEL"
  fi
  echo "  Personality: $PERSONALITY"
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
  select_agent
  select_personality
  select_model
  get_idea
  confirm_settings
fi

# ── Validate requirements ────────────────────────────────────

if [ "$MODE" = "api" ]; then
  if [ -z "${ANTHROPIC_API_KEY:-}" ]; then
    echo ""
    echo "❌ API mode requires ANTHROPIC_API_KEY."
    echo "   Set it in .env or: export ANTHROPIC_API_KEY=sk-ant-..."
    echo "   Or use agent mode instead (no API key needed)."
    exit 1
  fi
fi

if [ "$MODE" = "agent" ]; then
  local_bin=$(agent_binary "$AGENT")
  if ! command -v "$local_bin" &>/dev/null; then
    echo ""
    echo "❌ $(agent_display_name "$AGENT") not found (looked for: $local_bin)"
    case "$AGENT" in
      claude) echo "   Install: npm install -g @anthropic-ai/claude-code" ;;
      cursor) echo "   Install Cursor and enable the CLI: https://cursor.com" ;;
      codex)  echo "   Install: npm install -g @openai/codex" ;;
      aider)  echo "   Install: pip install aider-chat" ;;
    esac
    exit 1
  fi
fi

# ── Build the planning prompt ────────────────────────────────

build_prompt() {
  local prompt="Read the CLAUDE.md file in this project directory and follow its planning instructions."
  prompt+=" Use the '$PERSONALITY' personality from prompts/personalities/$PERSONALITY.md."

  if [ -n "$LOAD_FILE" ]; then
    prompt+=" Resume from the existing plan at '$LOAD_FILE'."
  elif [ -n "$IDEA" ]; then
    prompt+=" The user's project idea is: \"$IDEA\"."
    prompt+=" Start with the foundation section (who is this for?) and work through all sections interactively."
  else
    prompt+=" Ask the user for their project idea, then start with the foundation section."
  fi

  prompt+=" Save all outputs (plan.json, plan.md, diagrams) to the $OUTPUT_DIR/ directory."
  echo "$prompt"
}

# ── Launch: Agent mode ───────────────────────────────────────

if [ "$MODE" = "agent" ]; then
  PROMPT=$(build_prompt)

  echo ""
  echo "🧠 Launching Think Tank via $(agent_display_name "$AGENT")..."
  echo ""

  agent_exec "$AGENT" "$PROMPT"
fi

# ── Launch: API mode (Node CLI) ──────────────────────────────

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
