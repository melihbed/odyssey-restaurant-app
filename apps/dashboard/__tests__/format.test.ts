import { describe, it, expect } from 'vitest'
import { formatCurrency, formatCompactNumber, truncate, initials } from '@repo/shared'

describe('formatCurrency', () => {
  it('formats cents as dollars', () => {
    expect(formatCurrency(1000)).toBe('$10.00')
    expect(formatCurrency(4500)).toBe('$45.00')
    expect(formatCurrency(895)).toBe('$8.95')
  })

  it('handles zero', () => {
    expect(formatCurrency(0)).toBe('$0.00')
  })

  it('handles large values', () => {
    expect(formatCurrency(100000)).toBe('$1,000.00')
  })
})

describe('formatCompactNumber', () => {
  it('formats numbers below 1000 as-is', () => {
    expect(formatCompactNumber(42)).toBe('42')
    expect(formatCompactNumber(999)).toBe('999')
  })

  it('abbreviates thousands', () => {
    expect(formatCompactNumber(1500)).toBe('1.5K')
    expect(formatCompactNumber(10000)).toBe('10K')
  })
})

describe('truncate', () => {
  it('returns short strings unchanged', () => {
    expect(truncate('hello', 10)).toBe('hello')
  })

  it('truncates long strings with ellipsis', () => {
    const result = truncate('hello world long text', 10)
    expect(result.length).toBeLessThanOrEqual(13) // 10 + '...'
    expect(result.endsWith('...')).toBe(true)
  })
})

describe('initials', () => {
  it('extracts initials from a full name', () => {
    expect(initials('Alice Johnson')).toBe('AJ')
  })

  it('handles single name', () => {
    expect(initials('Alice')).toBe('A')
  })

  it('handles empty string', () => {
    expect(initials('')).toBe('')
  })
})
