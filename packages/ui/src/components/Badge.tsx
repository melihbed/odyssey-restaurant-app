import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { colors } from '../tokens/colors'
import { fontSizes, fontWeights } from '../tokens/typography'
import { radius, spacing } from '../tokens/spacing'
import type { OrderStatus } from '@repo/shared'

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
}

interface StatusBadgeProps {
  status: OrderStatus | string
}

const STATUS_TO_VARIANT: Record<string, { bg: string; fg: string }> = {
  pending:   { bg: '#fef3c7', fg: '#b45309' },
  accepted:  { bg: '#dbeafe', fg: '#1d4ed8' },
  rejected:  { bg: '#fee2e2', fg: '#b91c1c' },
  preparing: { bg: '#ede9fe', fg: '#6d28d9' },
  ready:     { bg: '#dcfce7', fg: '#15803d' },
  completed: { bg: '#f1f5f9', fg: '#475569' },
  cancelled: { bg: '#f1f5f9', fg: '#94a3b8' },
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending', accepted: 'Accepted', rejected: 'Rejected',
  preparing: 'Preparing', ready: 'Ready', completed: 'Completed', cancelled: 'Cancelled',
}

const VARIANT_STYLES: Record<BadgeVariant, { bg: string; fg: string }> = {
  default: { bg: colors.bgSubtle, fg: colors.textSecondary },
  success: { bg: '#dcfce7', fg: '#15803d' },
  warning: { bg: '#fef3c7', fg: '#b45309' },
  error:   { bg: '#fee2e2', fg: '#b91c1c' },
  info:    { bg: '#dbeafe', fg: '#1d4ed8' },
}

export function Badge({ children, variant = 'default' }: BadgeProps) {
  const { bg, fg } = VARIANT_STYLES[variant]
  return (
    <View style={[styles.base, { backgroundColor: bg }]}>
      <Text style={[styles.label, { color: fg }]}>{children}</Text>
    </View>
  )
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const style = STATUS_TO_VARIANT[status] ?? { bg: colors.bgSubtle, fg: colors.textSecondary }
  const label = STATUS_LABELS[status] ?? status
  return (
    <View style={[styles.base, { backgroundColor: style.bg }]}>
      <View style={[styles.dot, { backgroundColor: style.fg }]} />
      <Text style={[styles.label, { color: style.fg }]}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[0.5],
    borderRadius: radius.full,
    gap: spacing[1],
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  label: { fontSize: fontSizes.xs, fontWeight: fontWeights.medium as any },
})
