import { describe, it, expect, vi } from 'vitest'
import app from '../index'

const mockDbInstance = {
  select: vi.fn().mockReturnThis(),
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  orderBy: vi.fn().mockResolvedValue([]),
  insert: vi.fn().mockReturnThis(),
  values: vi.fn().mockReturnThis(),
  returning: vi.fn().mockResolvedValue([]),
  update: vi.fn().mockReturnThis(),
  set: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
}

vi.mock('../db', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../db')>()
  return { ...actual, createDb: vi.fn(() => mockDbInstance) }
})

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

const fakeEnv = { DATABASE_URL: 'postgresql://x:x@localhost/x' }

describe('Menu availability query params', () => {
  it('accepts valid available filter', async () => {
    const res = await app.request('/menu/items?available=true', {}, fakeEnv)
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual([])
  })

  it('rejects invalid available value', async () => {
    const res = await app.request('/menu/items?available=maybe', {}, fakeEnv)
    expect(res.status).toBe(400)
  })
})
