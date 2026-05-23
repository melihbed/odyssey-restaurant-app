import { describe, it, expect } from 'vitest'
import { applyAction, getValidActions } from '../lib/order-state-machine'

describe('Order State Machine', () => {
  describe('valid transitions', () => {
    it('pending → accepted via accept', () => {
      expect(applyAction('pending', 'accept')).toBe('accepted')
    })
    it('pending → rejected via reject', () => {
      expect(applyAction('pending', 'reject')).toBe('rejected')
    })
    it('accepted → preparing via start_preparing', () => {
      expect(applyAction('accepted', 'start_preparing')).toBe('preparing')
    })
    it('accepted → cancelled via cancel', () => {
      expect(applyAction('accepted', 'cancel')).toBe('cancelled')
    })
    it('preparing → ready via mark_ready', () => {
      expect(applyAction('preparing', 'mark_ready')).toBe('ready')
    })
    it('ready → completed via complete', () => {
      expect(applyAction('ready', 'complete')).toBe('completed')
    })
  })

  describe('invalid transitions throw 422', () => {
    it('cannot complete a pending order', () => {
      expect(() => applyAction('pending', 'complete')).toThrow()
    })
    it('cannot accept a completed order', () => {
      expect(() => applyAction('completed', 'accept')).toThrow()
    })
    it('cannot do anything with a rejected order', () => {
      expect(() => applyAction('rejected', 'accept')).toThrow()
      expect(() => applyAction('rejected', 'cancel')).toThrow()
    })
    it('cannot cancel a completed order', () => {
      expect(() => applyAction('completed', 'cancel')).toThrow()
    })
    it('cannot skip from pending to preparing', () => {
      expect(() => applyAction('pending', 'start_preparing')).toThrow()
    })
  })

  describe('getValidActions', () => {
    it('returns correct actions for pending', () => {
      const actions = getValidActions('pending')
      expect(actions).toContain('accept')
      expect(actions).toContain('reject')
      expect(actions).toHaveLength(2)
    })
    it('returns empty for terminal statuses', () => {
      expect(getValidActions('completed')).toHaveLength(0)
      expect(getValidActions('rejected')).toHaveLength(0)
      expect(getValidActions('cancelled')).toHaveLength(0)
    })
  })
})
