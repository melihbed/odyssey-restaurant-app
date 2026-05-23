import { useState } from 'react'
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { formatCurrency, formatDate, formatRelativeTime, getCustomerTier, TIER_META } from '@repo/shared'
import {
  Avatar, Button, Card, colors, ErrorState, fontSizes, fontWeights,
  AppModal, Input, Skeleton, spacing, StatusBadge,
} from '@repo/ui'
import { useGetCustomersId } from '@repo/api-client'
import { useUpdateCustomer } from '../../../hooks/useCustomers'

export default function CustomerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { data: customer, isLoading, isError, refetch } = useGetCustomersId(id)
  const { mutate: updateCustomer, isPending: saving } = useUpdateCustomer(id)

  const [showEdit, setShowEdit] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', notes: '' })

  const openEdit = () => {
    if (!customer) return
    setForm({ name: customer.name, email: customer.email ?? '', phone: customer.phone ?? '', notes: customer.notes ?? '' })
    setShowEdit(true)
  }

  const handleSave = () => {
    updateCustomer(
      { data: { name: form.name, email: form.email || undefined, phone: form.phone || undefined, notes: form.notes || undefined } },
      { onSuccess: () => setShowEdit(false) }
    )
  }

  const tier = customer ? getCustomerTier({
    orderCount: (customer as any).orderCount ?? 0,
    totalSpentCents: (customer as any).totalSpentCents ?? 0,
    lastOrderAt: (customer as any).lastOrderAt ?? null,
    createdAt: customer.createdAt,
  }) : null
  const tierMeta = tier ? TIER_META[tier] : null

  return (
    <View style={styles.screen}>
      <View style={styles.navBar}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← CRM</Text>
        </Pressable>
        {customer && <Button size="sm" variant="secondary" onPress={openEdit}>Edit</Button>}
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {isLoading ? (
          <View style={{ gap: spacing[4] }}>
            <Skeleton height={100} /><Skeleton height={80} /><Skeleton height={200} />
          </View>
        ) : isError ? (
          <ErrorState onRetry={refetch} />
        ) : customer ? (
          <>
            {/* Profile */}
            <Card style={styles.profile}>
              <View style={styles.profileRow}>
                <Avatar name={customer.name} size="lg" />
                <View style={styles.profileInfo}>
                  <View style={styles.nameRow}>
                    <Text style={styles.customerName}>{customer.name}</Text>
                    {tierMeta && (
                      <View style={[styles.tierPill, { backgroundColor: tierMeta.color + '18', borderColor: tierMeta.color + '40' }]}>
                        <Text style={[styles.tierPillText, { color: tierMeta.color }]}>{tierMeta.label}</Text>
                      </View>
                    )}
                  </View>
                  {customer.email ? <Text style={styles.meta}>{customer.email}</Text> : null}
                  {customer.phone ? <Text style={styles.meta}>{customer.phone}</Text> : null}
                  <Text style={styles.since}>Customer since {formatDate(customer.createdAt)}</Text>
                  {/* Quick contact actions */}
                  {(customer.email || customer.phone) && (
                    <View style={styles.contactActions}>
                      {customer.email && (
                        <Button size="sm" variant="secondary" onPress={() => Linking.openURL(`mailto:${customer.email}`)}>
                          Email
                        </Button>
                      )}
                      {customer.phone && (
                        <Button size="sm" variant="secondary" onPress={() => Linking.openURL(`tel:${customer.phone}`)}>
                          Call
                        </Button>
                      )}
                    </View>
                  )}
                </View>
              </View>
            </Card>

            {/* Stats */}
            <View style={styles.statsRow}>
              <Card style={styles.statCard}>
                <Text style={styles.statValue}>{(customer as any).orderCount ?? 0}</Text>
                <Text style={styles.statLabel}>Orders</Text>
              </Card>
              <Card style={styles.statCard}>
                <Text style={styles.statValue}>{formatCurrency((customer as any).totalSpentCents ?? 0)}</Text>
                <Text style={styles.statLabel}>Total Spent</Text>
              </Card>
              <Card style={styles.statCard}>
                <Text style={styles.statValue}>
                  {(customer as any).orderCount > 0
                    ? formatCurrency(Math.round((customer as any).totalSpentCents / (customer as any).orderCount))
                    : '—'}
                </Text>
                <Text style={styles.statLabel}>Avg Order</Text>
              </Card>
              <Card style={styles.statCard}>
                <Text style={styles.statValue}>
                  {(customer as any).lastOrderAt ? formatRelativeTime((customer as any).lastOrderAt) : 'Never'}
                </Text>
                <Text style={styles.statLabel}>Last Visit</Text>
              </Card>
            </View>

            {/* Notes */}
            {customer.notes ? (
              <Card>
                <Text style={styles.sectionTitle}>Notes</Text>
                <Text style={styles.notes}>{customer.notes}</Text>
              </Card>
            ) : null}

            {/* Order History */}
            <View>
              <Text style={styles.sectionTitle}>Order History</Text>
              {(customer as any).recentOrders?.length === 0 ? (
                <Card><Text style={styles.meta}>No orders yet</Text></Card>
              ) : (
                <Card padding="none">
                  {(customer as any).recentOrders?.map((order: any, i: number) => (
                    <View key={order.id} style={[styles.orderRow, i > 0 ? styles.orderBorder : null]}>
                      <View style={styles.orderLeft}>
                        <Text style={styles.orderId}>#{order.id.slice(-6).toUpperCase()}</Text>
                        <Text style={styles.orderTime}>{formatRelativeTime(order.createdAt)}</Text>
                      </View>
                      <View style={styles.orderRight}>
                        <StatusBadge status={order.status} />
                        <Text style={styles.orderTotal}>{formatCurrency(order.totalCents)}</Text>
                      </View>
                    </View>
                  ))}
                </Card>
              )}
            </View>
          </>
        ) : null}
      </ScrollView>

      <AppModal visible={showEdit} onClose={() => setShowEdit(false)} title="Edit Customer" scrollable
        footer={<Button onPress={handleSave} loading={saving} fullWidth>Save Changes</Button>}
      >
        <View style={{ gap: spacing[4] }}>
          <Input label="Name" value={form.name} onChangeText={(v) => setForm((f) => ({ ...f, name: v }))} />
          <Input label="Email" value={form.email} onChangeText={(v) => setForm((f) => ({ ...f, email: v }))} keyboardType="email-address" autoCapitalize="none" />
          <Input label="Phone" value={form.phone} onChangeText={(v) => setForm((f) => ({ ...f, phone: v }))} keyboardType="phone-pad" />
          <Input label="Notes" value={form.notes} onChangeText={(v) => setForm((f) => ({ ...f, notes: v }))} multiline />
        </View>
      </AppModal>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bgDefault },
  navBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing[5], paddingVertical: spacing[3], paddingTop: spacing[8], backgroundColor: colors.bgSurface, borderBottomWidth: 1, borderBottomColor: colors.borderDefault },
  backBtn: { paddingVertical: spacing[1] },
  backText: { fontSize: fontSizes.md, color: colors.brand, fontWeight: '500' },
  scroll: { flex: 1 },
  content: { padding: spacing[5], gap: spacing[4] },
  profile: {},
  profileRow: { flexDirection: 'row', gap: spacing[4], alignItems: 'flex-start' },
  profileInfo: { flex: 1, gap: spacing[1] },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[2], flexWrap: 'wrap' },
  customerName: { fontSize: fontSizes.xl, fontWeight: fontWeights.bold as any, color: colors.textPrimary },
  tierPill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, borderWidth: 1 },
  tierPillText: { fontSize: 11, fontWeight: '700' },
  meta: { fontSize: fontSizes.sm, color: colors.textSecondary },
  since: { fontSize: fontSizes.xs, color: colors.textTertiary, marginTop: spacing[1] },
  contactActions: { flexDirection: 'row', gap: spacing[2], marginTop: spacing[2] },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[3] },
  statCard: { flex: 1, minWidth: 80, alignItems: 'center' },
  statValue: { fontSize: fontSizes.lg, fontWeight: fontWeights.bold as any, color: colors.textPrimary, textAlign: 'center' },
  statLabel: { fontSize: fontSizes.xs, color: colors.textSecondary, marginTop: 2 },
  sectionTitle: { fontSize: fontSizes.sm, fontWeight: fontWeights.semibold as any, color: colors.textSecondary, marginBottom: spacing[3] },
  notes: { fontSize: fontSizes.md, color: colors.textPrimary, lineHeight: 22 },
  orderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing[4], paddingVertical: spacing[3] },
  orderBorder: { borderTopWidth: 1, borderTopColor: colors.borderDefault },
  orderLeft: { gap: spacing[0.5] },
  orderId: { fontSize: fontSizes.sm, fontWeight: '700', color: colors.textPrimary, fontFamily: 'monospace' },
  orderTime: { fontSize: fontSizes.xs, color: colors.textSecondary },
  orderRight: { alignItems: 'flex-end', gap: spacing[1] },
  orderTotal: { fontSize: fontSizes.sm, fontWeight: '600', color: colors.textPrimary },
})
