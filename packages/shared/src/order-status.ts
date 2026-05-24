export type { OrderStatus, OrderAction } from '@repo/types'

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  rejected: 'Rejected',
  preparing: 'Preparing',
  ready: 'Ready',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export const ORDER_STATUS_COLORS: Record<string, string> = {
  pending: '#F59E0B',
  accepted: '#3B82F6',
  rejected: '#EF4444',
  preparing: '#8B5CF6',
  ready: '#10B981',
  completed: '#6B7280',
  cancelled: '#9CA3AF',
}

export const ORDER_ACTION_LABELS: Record<string, string> = {
  accept: 'Accept Order',
  reject: 'Reject',
  start_preparing: 'Start Preparing',
  mark_ready: 'Mark Ready',
  complete: 'Complete',
  cancel: 'Cancel Order',
}
