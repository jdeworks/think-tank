import { describe, it, expect } from 'vitest'
import { estimateCost, formatTokens } from '@/utils/tokens'

describe('estimateCost', () => {
  it('returns N/A for unknown models', () => {
    expect(estimateCost('unknown-model', 1000)).toBe('N/A')
  })

  it('returns < $0.01 for small usage', () => {
    expect(estimateCost('gpt-4o-mini', 100)).toBe('< $0.01')
  })

  it('returns formatted cost for significant usage', () => {
    const cost = estimateCost('gpt-4o', 1_000_000)
    expect(cost).toBe('~$5.00')
  })

  it('calculates costs for different models', () => {
    expect(estimateCost('gpt-4.1-nano', 10_000_000)).toBe('~$2.00')
    expect(estimateCost('claude-sonnet-4-6', 1_000_000)).toBe('~$6.00')
  })
})

describe('formatTokens', () => {
  it('shows raw number for < 1000', () => {
    expect(formatTokens(500)).toBe('500')
    expect(formatTokens(0)).toBe('0')
    expect(formatTokens(999)).toBe('999')
  })

  it('formats as k for >= 1000', () => {
    expect(formatTokens(1000)).toBe('1.0k')
    expect(formatTokens(1500)).toBe('1.5k')
    expect(formatTokens(10000)).toBe('10.0k')
    expect(formatTokens(150000)).toBe('150.0k')
  })
})
