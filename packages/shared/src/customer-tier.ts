export type CustomerTier = 'vip' | 'regular' | 'new' | 'at-risk'

export function getCustomerTier(c: {
  orderCount: number
  totalSpentCents: number
  lastOrderAt: string | null
  createdAt: string
}): CustomerTier {
  if (c.orderCount >= 8 || c.totalSpentCents >= 50000) return 'vip'
  const daysSinceLast = c.lastOrderAt
    ? (Date.now() - new Date(c.lastOrderAt).getTime()) / 86_400_000
    : null
  if (daysSinceLast !== null && daysSinceLast > 30) return 'at-risk'
  if (c.orderCount <= 2) return 'new'
  return 'regular'
}

export const TIER_META: Record<CustomerTier, { label: string; color: string }> = {
  vip:       { label: 'VIP',     color: '#7c3aed' },
  regular:   { label: 'Regular', color: '#2563eb' },
  new:       { label: 'New',     color: '#16a34a' },
  'at-risk': { label: 'At Risk', color: '#dc2626' },
}
