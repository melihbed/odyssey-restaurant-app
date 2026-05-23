import { describe, it, expect, vi, beforeEach } from 'vitest'
import app from '../index'

// Integration-style tests against the Hono app using in-memory mock
const mockDb = {
  menuItems: new Map<string, { id: string; name: string; priceCents: number; isAvailable: boolean }>(),
  customers: new Map<string, { id: string; name: string }>(),
  orders: new Map<string, { id: string; status: string; totalCents: number }>(),
}

// Unit tests for order validation logic (without DB)
describe('Order validation', () => {
  it('rejects empty items array', async () => {
    const res = await app.request('/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: [] }),
    })
    // Zod validation should reject this (min 1 items)
    expect(res.status).toBe(400)
  })

  it('rejects invalid UUID for menuItemId', async () => {
    const res = await app.request('/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: [{ menuItemId: 'not-a-uuid', quantity: 1 }] }),
    })
    expect(res.status).toBe(400)
  })

  it('rejects quantity of 0', async () => {
    const res = await app.request('/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{ menuItemId: '00000000-0000-0000-0000-000000000001', quantity: 0 }],
      }),
    })
    expect(res.status).toBe(400)
  })
})

describe('Order actions validation', () => {
  it('rejects unknown action', async () => {
    const res = await app.request('/orders/00000000-0000-0000-0000-000000000001/actions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'fly_to_moon' }),
    })
    expect(res.status).toBe(400)
  })
})

describe('Menu availability query params', () => {
  it('accepts valid available filter', async () => {
    // Without DB it'll fail at query time but schema validation passes
    const res = await app.request('/menu/items?available=true')
    // Should not be 400 (schema validation passes)
    expect(res.status).not.toBe(400)
  })

  it('rejects invalid available value', async () => {
    const res = await app.request('/menu/items?available=maybe')
    expect(res.status).toBe(400)
  })
})
