import React, { useState } from 'react'
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import { Link } from 'expo-router'
import { formatCurrency, formatRelativeTime } from '@repo/shared'
import {
  Avatar, Button, colors, EmptyState, ErrorState, fontSizes, fontWeights,
  Input, AppModal, Skeleton, spacing,
} from '@repo/ui'
import { PageShell } from '../../../components/PageShell'
import { useGetCustomers } from '@repo/api-client'
import { useCreateCustomer } from '../../../hooks/useCustomers'

export default function CRMScreen() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [showCreate, setShowCreate] = useState(false)

  // Debounce search by passing it only when it has value
  const { data, isLoading, isError, refetch } = useGetCustomers({ search: search || undefined, page, limit: 20 })
  const { mutate: createCustomer, isPending: creating } = useCreateCustomer()

  const [form, setForm] = useState({ name: '', email: '', phone: '', notes: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleCreate = () => {
    const newErrors: Record<string, string> = {}
    if (!form.name.trim()) newErrors.name = 'Name is required'
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Invalid email'
    if (Object.keys(newErrors).length) { setErrors(newErrors); return }
    createCustomer(
      { data: { name: form.name, email: form.email || undefined, phone: form.phone || undefined, notes: form.notes || undefined } },
      { onSuccess: () => { setShowCreate(false); setForm({ name: '', email: '', phone: '', notes: '' }); setErrors({}) } }
    )
  }

  const customers = data?.data ?? []
  const total = data?.total ?? 0

  return (
    <PageShell
      title="CRM"
      subtitle={`${total} customers`}
      scrollable={false}
      headerRight={
        <Button size="sm" onPress={() => setShowCreate(true)}>+ Add Customer</Button>
      }
    >
      <View style={styles.searchBar}>
        <Input
          placeholder="Search by name…"
          value={search}
          onChangeText={(t) => { setSearch(t); setPage(1) }}
          containerStyle={styles.searchInput}
        />
      </View>

      {isError ? (
        <ErrorState onRetry={refetch} description="Could not load customers" />
      ) : isLoading ? (
        <View style={styles.loading}>
          {Array.from({ length: 6 }, (_, i) => <Skeleton key={i} height={64} style={{ marginBottom: spacing[2] }} />)}
        </View>
      ) : customers.length === 0 ? (
        <EmptyState icon="👥" title="No customers" description={search ? `No results for "${search}"` : 'Add your first customer'} actionLabel="Add Customer" onAction={() => setShowCreate(true)} />
      ) : (
        <FlatList
          data={customers}
          keyExtractor={(c) => c.id}
          style={styles.list}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item }) => (
            <Link href={`/(tabs)/crm/${item.id}`} asChild>
              <Pressable style={({ pressed }) => [styles.row, pressed ? styles.rowPressed : null]}>
                <Avatar name={item.name} size="md" />
                <View style={styles.rowContent}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.meta}>
                    {item.email ?? item.phone ?? 'No contact info'}
                  </Text>
                </View>
                <View style={styles.rowRight}>
                  <Text style={styles.spend}>{formatCurrency((item as any).totalSpentCents ?? 0)}</Text>
                  <Text style={styles.orders}>{(item as any).orderCount ?? 0} orders</Text>
                </View>
              </Pressable>
            </Link>
          )}
        />
      )}

      {/* Create Customer Modal */}
      <AppModal
        visible={showCreate}
        onClose={() => { setShowCreate(false); setErrors({}) }}
        title="Add Customer"
        scrollable
        footer={
          <Button onPress={handleCreate} loading={creating} fullWidth>Create Customer</Button>
        }
      >
        <View style={styles.form}>
          <Input label="Name *" value={form.name} onChangeText={(v) => setForm((f) => ({ ...f, name: v }))} error={errors.name} placeholder="Full name" />
          <Input label="Email" value={form.email} onChangeText={(v) => setForm((f) => ({ ...f, email: v }))} error={errors.email} placeholder="email@example.com" keyboardType="email-address" autoCapitalize="none" />
          <Input label="Phone" value={form.phone} onChangeText={(v) => setForm((f) => ({ ...f, phone: v }))} placeholder="+1 555 0100" keyboardType="phone-pad" />
          <Input label="Notes" value={form.notes} onChangeText={(v) => setForm((f) => ({ ...f, notes: v }))} placeholder="Optional notes…" multiline />
        </View>
      </AppModal>
    </PageShell>
  )
}

const styles = StyleSheet.create({
  searchBar: { paddingHorizontal: spacing[5], paddingVertical: spacing[3], backgroundColor: colors.bgSurface, borderBottomWidth: 1, borderBottomColor: colors.borderDefault },
  searchInput: { flex: 1 },
  loading: { padding: spacing[5] },
  list: { flex: 1 },
  separator: { height: 1, backgroundColor: colors.borderDefault },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing[3], paddingHorizontal: spacing[5], paddingVertical: spacing[3], backgroundColor: colors.bgSurface },
  rowPressed: { backgroundColor: colors.bgSubtle },
  rowContent: { flex: 1 },
  name: { fontSize: fontSizes.md, fontWeight: fontWeights.semibold as any, color: colors.textPrimary },
  meta: { fontSize: fontSizes.sm, color: colors.textSecondary, marginTop: 2 },
  rowRight: { alignItems: 'flex-end' },
  spend: { fontSize: fontSizes.md, fontWeight: fontWeights.semibold as any, color: colors.textPrimary },
  orders: { fontSize: fontSizes.xs, color: colors.textSecondary, marginTop: 2 },
  form: { gap: spacing[4] },
})
