// Canonical domain types — no runtime dependencies, safe to import anywhere in the monorepo.
// Backend infers DB types from Drizzle; frontend gets API shapes from Orval.
// This package owns the shared semantic types that sit above both layers.

export type OrderStatus =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'preparing'
  | 'ready'
  | 'completed'
  | 'cancelled'

export type OrderAction =
  | 'accept'
  | 'reject'
  | 'start_preparing'
  | 'mark_ready'
  | 'complete'
  | 'cancel'

export type CustomerTier = 'vip' | 'regular' | 'new' | 'at-risk'

export type PaginatedResponse<T> = {
  data: T[]
  total: number
  page: number
  limit: number
}

export type ApiError = {
  message: string
}
