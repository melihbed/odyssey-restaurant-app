import React from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { formatCurrency, formatDateTime, ORDER_ACTION_LABELS } from '@repo/shared'
import {
  Button, Card, colors, ErrorState, fontSizes, fontWeights,
  Skeleton, spacing, StatusBadge, Avatar,
} from '@repo/ui'
import { useGetOrdersId } from '@repo/api-client'
import { useOrderAction } from '../../../hooks/useOrders'

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { data: order, isLoading, isError, refetch } = useGetOrdersId(id)
  const { mutate: doAction, isPending } = useOrderAction(id)

  if (isError) {
    return (
      <View style={styles.screen}>
        <View style={styles.navBar}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </Pressable>
        </View>
        <ErrorState onRetry={refetch} />
      </View>
    )
  }

  return (
    <View style={styles.screen}>
      <View style={styles.navBar}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Orders</Text>
        </Pressable>
        {order && <StatusBadge status={order.status} />}
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {isLoading ? (
          <View style={{ gap: spacing[4] }}>
            <Skeleton height={80} />
            <Skeleton height={160} />
            <Skeleton height={120} />
          </View>
        ) : order ? (
          <>
            {/* Order Header */}
            <Card>
              <View style={styles.headerRow}>
                <View>
                  <Text style={styles.orderId}>Order #{order.id.slice(-6).toUpperCase()}</Text>
                  <Text style={styles.orderTime}>{formatDateTime(order.createdAt)}</Text>
                </View>
                <View style={styles.totalWrap}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.total}>{formatCurrency(order.totalCents)}</Text>
                </View>
              </View>
              {order.notes ? (
                <View style={styles.notesWrap}>
                  <Text style={styles.notesLabel}>Note</Text>
                  <Text style={styles.notes}>{order.notes}</Text>
                </View>
              ) : null}
            </Card>

            {/* Customer */}
            <Card>
              <Text style={styles.sectionTitle}>Customer</Text>
              {order.customer ? (
                <View style={styles.customerRow}>
                  <Avatar name={order.customer.name} size="md" />
                  <View>
                    <Text style={styles.customerName}>{order.customer.name}</Text>
                    {order.customer.email ? <Text style={styles.customerMeta}>{order.customer.email}</Text> : null}
                    {order.customer.phone ? <Text style={styles.customerMeta}>{order.customer.phone}</Text> : null}
                  </View>
                </View>
              ) : (
                <Text style={styles.customerMeta}>Walk-in guest</Text>
              )}
            </Card>

            {/* Order Items */}
            <Card padding="none">
              <View style={styles.itemsHeader}>
                <Text style={styles.sectionTitle}>Items</Text>
                <Text style={styles.itemCount}>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</Text>
              </View>
              {order.items.map((item: any, i: number) => (
                <View key={item.id} style={[styles.itemRow, i > 0 ? styles.itemBorder : null]}>
                  <View style={styles.itemQtyWrap}>
                    <Text style={styles.itemQty}>{item.quantity}×</Text>
                  </View>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemSubtotal}>{formatCurrency(item.subtotalCents)}</Text>
                </View>
              ))}
              <View style={[styles.itemRow, styles.itemBorder, styles.totalRow]}>
                <Text style={styles.totalRowLabel}>Total</Text>
                <Text style={styles.totalRowValue}>{formatCurrency(order.totalCents)}</Text>
              </View>
            </Card>

            {/* Actions */}
            {(order.validActions as string[]).length > 0 ? (
              <Card>
                <Text style={styles.sectionTitle}>Actions</Text>
                <View style={styles.actionsRow}>
                  {(order.validActions as string[]).map((action) => {
                    const isDestructive = action === 'reject' || action === 'cancel'
                    return (
                      <Button
                        key={action}
                        variant={isDestructive ? 'destructive' : action === 'complete' ? 'primary' : 'secondary'}
                        size="sm"
                        loading={isPending}
                        onPress={() => doAction({ data: { action: action as any } })}
                        
                      >
                        {ORDER_ACTION_LABELS[action] ?? action}
                      </Button>
                    )
                  })}
                </View>
              </Card>
            ) : null}
          </>
        ) : null}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bgDefault },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[3],
    paddingTop: spacing[8],
    backgroundColor: colors.bgSurface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },
  backBtn: { paddingVertical: spacing[1] },
  backText: { fontSize: fontSizes.md, color: colors.brand, fontWeight: '500' },
  scroll: { flex: 1 },
  content: { padding: spacing[5], gap: spacing[4] },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  orderId: { fontSize: fontSizes.xl, fontWeight: fontWeights.bold as any, color: colors.textPrimary, fontFamily: 'monospace' },
  orderTime: { fontSize: fontSizes.sm, color: colors.textSecondary, marginTop: 2 },
  totalWrap: { alignItems: 'flex-end' },
  totalLabel: { fontSize: fontSizes.xs, color: colors.textSecondary },
  total: { fontSize: fontSizes['2xl'], fontWeight: fontWeights.bold as any, color: colors.textPrimary },
  notesWrap: { marginTop: spacing[3], paddingTop: spacing[3], borderTopWidth: 1, borderTopColor: colors.borderDefault },
  notesLabel: { fontSize: fontSizes.xs, color: colors.textSecondary, marginBottom: 4 },
  notes: { fontSize: fontSizes.md, color: colors.textPrimary },
  sectionTitle: { fontSize: fontSizes.sm, fontWeight: fontWeights.semibold as any, color: colors.textSecondary, marginBottom: spacing[3] },
  customerRow: { flexDirection: 'row', gap: spacing[3], alignItems: 'center' },
  customerName: { fontSize: fontSizes.md, fontWeight: '600', color: colors.textPrimary },
  customerMeta: { fontSize: fontSizes.sm, color: colors.textSecondary },
  itemsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing[4], paddingBottom: spacing[3] },
  itemCount: { fontSize: fontSizes.sm, color: colors.textSecondary },
  itemRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing[4], paddingVertical: spacing[3] },
  itemBorder: { borderTopWidth: 1, borderTopColor: colors.borderDefault },
  itemQtyWrap: { width: 28 },
  itemQty: { fontSize: fontSizes.sm, color: colors.textSecondary, fontWeight: '600' },
  itemName: { flex: 1, fontSize: fontSizes.md, color: colors.textPrimary },
  itemSubtotal: { fontSize: fontSizes.md, fontWeight: '600', color: colors.textPrimary },
  totalRow: { backgroundColor: colors.bgSubtle },
  totalRowLabel: { flex: 1, fontSize: fontSizes.md, fontWeight: fontWeights.semibold as any, color: colors.textPrimary },
  totalRowValue: { fontSize: fontSizes.md, fontWeight: fontWeights.bold as any, color: colors.textPrimary },
  actionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
})
