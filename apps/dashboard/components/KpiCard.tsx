import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Card, colors, fontSizes, fontWeights, spacing } from '@repo/ui'

interface KpiCardProps {
  label: string
  value: string
  subvalue?: string
  icon?: string
  trend?: { value: string; positive: boolean }
  color?: string
}

export function KpiCard({ label, value, subvalue, icon, trend, color }: KpiCardProps) {
  return (
    <Card style={styles.card}>
      <View style={styles.top}>
        <Text style={styles.label}>{label}</Text>
        {icon ? (
          <View style={[styles.iconWrap, { backgroundColor: color ? color + '20' : colors.brandLight }]}>
            <Text style={styles.icon}>{icon}</Text>
          </View>
        ) : null}
      </View>
      <Text style={[styles.value, color ? { color } : {}]}>{value}</Text>
      {subvalue ? <Text style={styles.subvalue}>{subvalue}</Text> : null}
      {trend ? (
        <View style={styles.trend}>
          <Text style={[styles.trendText, { color: trend.positive ? '#16a34a' : '#dc2626' }]}>
            {trend.positive ? '↑' : '↓'} {trend.value}
          </Text>
        </View>
      ) : null}
    </Card>
  )
}

const styles = StyleSheet.create({
  card: { flex: 1, minWidth: 160 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing[2] },
  label: { fontSize: fontSizes.sm, color: colors.textSecondary, fontWeight: '500', flex: 1 },
  iconWrap: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 16 },
  value: { fontSize: fontSizes['3xl'], fontWeight: fontWeights.bold as any, color: colors.textPrimary },
  subvalue: { fontSize: fontSizes.xs, color: colors.textTertiary, marginTop: 2 },
  trend: { marginTop: spacing[1] },
  trendText: { fontSize: fontSizes.sm, fontWeight: '500' },
})
