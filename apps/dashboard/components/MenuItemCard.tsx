import React from 'react'
import { StyleSheet, Switch, Text, View } from 'react-native'
import { Button, Card, colors, fontSizes, fontWeights, spacing } from '@repo/ui'
import { formatCurrency } from '@repo/shared'
import { useToggleAvailability } from '../hooks/useMenu'

interface MenuItemCardProps {
  item: {
    id: string
    name: string
    description: string | null
    priceCents: number
    isAvailable: boolean
    prepTimeMins: number
  }
  onEdit: (item: MenuItemCardProps['item']) => void
  onDeleteRequest: (id: string) => void
}

export function MenuItemCard({ item, onEdit, onDeleteRequest }: MenuItemCardProps) {
  const { mutate: toggleAvail } = useToggleAvailability(item.id)

  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          {item.description ? (
            <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>
          ) : null}
          <View style={styles.meta}>
            <Text style={styles.price}>{formatCurrency(item.priceCents)}</Text>
            <Text style={styles.prep}>⏱ {item.prepTimeMins}m</Text>
          </View>
        </View>
        <View style={styles.actions}>
          <Switch
            value={item.isAvailable}
            onValueChange={(v) => toggleAvail({ data: { isAvailable: v } })}
            trackColor={{ false: colors.borderStrong, true: colors.brand }}
            thumbColor="#fff"
          />
          <Button size="sm" variant="ghost" onPress={() => onEdit(item)}>✏️</Button>
          <Button size="sm" variant="ghost" onPress={() => onDeleteRequest(item.id)}>🗑</Button>
        </View>
      </View>
      {!item.isAvailable && (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>Currently unavailable</Text>
        </View>
      )}
    </Card>
  )
}

const styles = StyleSheet.create({
  card: { padding: spacing[4] },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing[3] },
  info: { flex: 1 },
  name: { fontSize: fontSizes.md, fontWeight: fontWeights.semibold as any, color: colors.textPrimary },
  desc: { fontSize: fontSizes.sm, color: colors.textSecondary, marginTop: 2, lineHeight: 18 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: spacing[3], marginTop: spacing[2] },
  price: { fontSize: fontSizes.md, fontWeight: fontWeights.bold as any, color: colors.brand },
  prep: { fontSize: fontSizes.sm, color: colors.textSecondary },
  actions: { alignItems: 'center', gap: spacing[1] },
  banner: { marginTop: spacing[2], paddingTop: spacing[2], borderTopWidth: 1, borderTopColor: colors.borderDefault },
  bannerText: { fontSize: fontSizes.xs, color: colors.warningFg, fontWeight: '500' },
})
