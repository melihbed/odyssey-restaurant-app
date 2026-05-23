import { describe, it, expect } from 'vitest'
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  ORDER_ACTION_LABELS,
} from '@repo/shared'

describe('ORDER_STATUS_LABELS', () => {
  it('has a label for every status', () => {
    const statuses = ['pending', 'accepted', 'rejected', 'preparing', 'ready', 'completed', 'cancelled'] as const
    for (const s of statuses) {
      expect(ORDER_STATUS_LABELS[s]).toBeTruthy()
    }
  })

  it('maps statuses to human-readable strings', () => {
    expect(ORDER_STATUS_LABELS.pending).toBe('Pending')
    expect(ORDER_STATUS_LABELS.accepted).toBe('Accepted')
    expect(ORDER_STATUS_LABELS.preparing).toBe('Preparing')
    expect(ORDER_STATUS_LABELS.ready).toBe('Ready')
    expect(ORDER_STATUS_LABELS.completed).toBe('Completed')
    expect(ORDER_STATUS_LABELS.rejected).toBe('Rejected')
    expect(ORDER_STATUS_LABELS.cancelled).toBe('Cancelled')
  })
})

describe('ORDER_STATUS_COLORS', () => {
  it('has a color for every status', () => {
    const statuses = ['pending', 'accepted', 'rejected', 'preparing', 'ready', 'completed', 'cancelled'] as const
    for (const s of statuses) {
      expect(ORDER_STATUS_COLORS[s]).toMatch(/^#[0-9a-fA-F]{6}$/)
    }
  })

  it('uses distinct colors for terminal vs active statuses', () => {
    // Active statuses should have distinct colors from neutral terminal ones
    expect(ORDER_STATUS_COLORS.pending).not.toBe(ORDER_STATUS_COLORS.completed)
    expect(ORDER_STATUS_COLORS.preparing).not.toBe(ORDER_STATUS_COLORS.cancelled)
  })
})

describe('ORDER_ACTION_LABELS', () => {
  it('has a label for every action', () => {
    const actions = ['accept', 'reject', 'start_preparing', 'mark_ready', 'complete', 'cancel'] as const
    for (const a of actions) {
      expect(ORDER_ACTION_LABELS[a]).toBeTruthy()
    }
  })
})
