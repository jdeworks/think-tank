// Rough cost estimates per 1M tokens (input/output averaged)
const COST_PER_MILLION: Record<string, number> = {
  'gpt-4.1': 4,
  'gpt-4.1-mini': 0.8,
  'gpt-4.1-nano': 0.2,
  'gpt-4o': 5,
  'gpt-4o-mini': 0.3,
  'claude-sonnet-4-20250514': 6,
  'claude-haiku-4-5-20250514': 2,
  'claude-opus-4-20250514': 30,
}

export function estimateCost(model: string, totalTokens: number): string {
  const rate = COST_PER_MILLION[model]
  if (!rate) return 'N/A'
  const cost = (totalTokens / 1_000_000) * rate
  if (cost < 0.01) return '< $0.01'
  return `~$${cost.toFixed(2)}`
}

export function formatTokens(tokens: number): string {
  if (tokens < 1000) return `${tokens}`
  return `${(tokens / 1000).toFixed(1)}k`
}
