import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { colors, fontSizes, fontWeights, radius, spacing } from '@repo/ui'

interface KpiCardProps {
  label: string
  value: string
  subvalue?: string
  icon?: string
  trend?: { value: string; positive: boolean }
  color?: string
}

export function KpiCard({ label, value, subvalue, icon, trend, color }: KpiCardProps) {
  const accent = color ?? colors.brand

  return (
    <View style={styles.card}>
      <View style={[styles.stripe, { backgroundColor: accent }]} />
      <View style={styles.body}>
        <View style={styles.top}>
          <Text style={styles.label}>{label}</Text>
          {icon ? (
            <View style={[styles.iconWrap, { backgroundColor: accent + '18' }]}>
              <Text style={styles.icon}>{icon}</Text>
            </View>
          ) : null}
        </View>
        <Text style={[styles.value, { color: accent }]}>{value}</Text>
        {subvalue ? <Text style={styles.subvalue}>{subvalue}</Text> : null}
        {trend ? (
          <Text style={[styles.trend, { color: trend.positive ? '#16a34a' : '#dc2626' }]}>
            {trend.positive ? '↑' : '↓'} {trend.value}
          </Text>
        ) : null}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 160,
    backgroundColor: colors.bgSurface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    overflow: 'hidden',
  },
  stripe: { height: 3 },
  body: { padding: spacing[4] },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing[2],
  },
  label: { fontSize: fontSizes.sm, color: colors.textSecondary, fontWeight: '500', flex: 1 },
  iconWrap: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 15 },
  value: { fontSize: fontSizes['3xl'], fontWeight: fontWeights.bold as any },
  subvalue: { fontSize: fontSizes.xs, color: colors.textTertiary, marginTop: 2 },
  trend: { fontSize: fontSizes.sm, fontWeight: '500', marginTop: spacing[1] },
})
