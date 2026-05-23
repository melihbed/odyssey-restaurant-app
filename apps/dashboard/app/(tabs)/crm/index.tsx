import React, { useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Link } from "expo-router";
import { formatCurrency } from "@repo/shared";
import {
  Avatar,
  Button,
  colors,
  EmptyState,
  ErrorState,
  fontSizes,
  fontWeights,
  Input,
  AppModal,
  Skeleton,
  spacing,
} from "@repo/ui";
import { PageShell } from "../../../components/PageShell";
import { useGetCustomers } from "@repo/api-client";
import { useCreateCustomer } from "../../../hooks/useCustomers";

const COL_ORDERS = 80;
const COL_SPENT = 120;

export default function CRMScreen() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);

  const { data, isLoading, isError, refetch } = useGetCustomers({
    search: search || undefined,
    page,
    limit: 20,
  });
  const { mutate: createCustomer, isPending: creating } = useCreateCustomer();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleCreate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = "Invalid email";
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }
    createCustomer(
      {
        data: {
          name: form.name,
          email: form.email || undefined,
          phone: form.phone || undefined,
          notes: form.notes || undefined,
        },
      },
      {
        onSuccess: () => {
          setShowCreate(false);
          setForm({ name: "", email: "", phone: "", notes: "" });
          setErrors({});
        },
      }
    );
  };

  const customers = data?.data ?? [];
  const total = data?.total ?? 0;

  const isWeb = Platform.OS === "web";

  return (
    <PageShell
      title="CRM"
      subtitle={`${total} customer${total !== 1 ? "s" : ""}`}
      scrollable={false}
      headerRight={
        <Button size="sm" onPress={() => setShowCreate(true)}>
          + Add Customer
        </Button>
      }
    >
      {/* Search */}
      <View style={styles.toolbar}>
        <Input
          placeholder="Search by name…"
          value={search}
          onChangeText={(t) => {
            setSearch(t);
            setPage(1);
          }}
          containerStyle={styles.searchInput}
        />
      </View>

      {/* Table header — web only */}
      {isWeb && (
        <View style={styles.tableHeader}>
          <View style={styles.colCustomer}>
            <Text style={styles.colHeading}>Customer</Text>
          </View>
          <View style={styles.colContact}>
            <Text style={styles.colHeading}>Contact</Text>
          </View>
          <View style={[styles.colFixed, { width: COL_ORDERS }]}>
            <Text style={[styles.colHeading, styles.alignRight]}>Orders</Text>
          </View>
          <View style={[styles.colFixed, { width: COL_SPENT }]}>
            <Text style={[styles.colHeading, styles.alignRight]}>
              Total Spent
            </Text>
          </View>
          {/* Spacer to perfectly align with trailing chevrons in the list */}
          <View style={styles.chevronSpacer} />
        </View>
      )}

      {isError ? (
        <ErrorState onRetry={refetch} description="Could not load customers" />
      ) : isLoading ? (
        <View style={styles.skeletons}>
          {Array.from({ length: 6 }, (_, i) => (
            <View key={i} style={styles.skeletonRow}>
              <Skeleton width={36} height={36} borderRadius={18} />
              <View style={{ flex: 1, gap: 6 }}>
                <Skeleton height={13} width="50%" />
                <Skeleton height={11} width="35%" />
              </View>
            </View>
          ))}
        </View>
      ) : customers.length === 0 ? (
        <EmptyState
          icon="👥"
          title="No customers"
          description={
            search ? `No results for "${search}"` : "Add your first customer"
          }
          actionLabel="Add Customer"
          onAction={() => setShowCreate(true)}
        />
      ) : (
        <FlatList
          data={customers}
          keyExtractor={(c) => c.id}
          style={styles.list}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item }) => (
            <Link href={`/(tabs)/crm/${item.id}`} asChild>
              {/* FIX: Flatten style and enforce display: flex for the Web <a> tag */}
              <Pressable
                style={StyleSheet.flatten([
                  { display: "flex" as any },
                  styles.row,
                ])}
              >
                {/* Avatar + Name */}
                <View style={styles.colCustomer}>
                  <Avatar name={item.name} size="sm" />
                  <View style={styles.nameBlock}>
                    <Text style={styles.name} numberOfLines={1}>
                      {item.name}
                    </Text>
                    {!isWeb && (
                      <Text style={styles.metaMobile} numberOfLines={1}>
                        {item.email ?? item.phone ?? "No contact"}
                      </Text>
                    )}
                  </View>
                </View>

                {/* Contact — web only column */}
                {isWeb && (
                  <View style={styles.colContact}>
                    <Text style={styles.contactText} numberOfLines={1}>
                      {item.email ?? item.phone ?? (
                        <Text style={styles.noData}>—</Text>
                      )}
                    </Text>
                  </View>
                )}

                {/* Orders */}
                <View
                  style={[
                    isWeb ? styles.colFixed : styles.colMobileRight,
                    isWeb ? { width: COL_ORDERS } : null,
                  ]}
                >
                  {isWeb ? (
                    <Text style={[styles.orderCount, styles.alignRight]}>
                      {(item as any).orderCount ?? 0}
                    </Text>
                  ) : (
                    <View style={styles.mobileRight}>
                      <Text style={styles.spendMobile}>
                        {formatCurrency((item as any).totalSpentCents ?? 0)}
                      </Text>
                      <Text style={styles.ordersMobile}>
                        {(item as any).orderCount ?? 0} orders
                      </Text>
                    </View>
                  )}
                </View>

                {/* Spent — web only */}
                {isWeb && (
                  <View style={[styles.colFixed, { width: COL_SPENT }]}>
                    <Text style={[styles.spentAmount, styles.alignRight]}>
                      {formatCurrency((item as any).totalSpentCents ?? 0)}
                    </Text>
                  </View>
                )}

                {isWeb && <Text style={styles.chevron}>›</Text>}
              </Pressable>
            </Link>
          )}
        />
      )}

      {/* Pagination */}
      {total > 20 && (
        <View style={styles.pagination}>
          <Button
            variant="secondary"
            size="sm"
            disabled={page === 1}
            onPress={() => setPage((p) => p - 1)}
          >
            ← Prev
          </Button>
          <Text style={styles.pageInfo}>
            Page {page} of {Math.ceil(total / 20)}
          </Text>
          <Button
            variant="secondary"
            size="sm"
            disabled={page * 20 >= total}
            onPress={() => setPage((p) => p + 1)}
          >
            Next →
          </Button>
        </View>
      )}

      {/* Create Modal */}
      <AppModal
        visible={showCreate}
        onClose={() => {
          setShowCreate(false);
          setErrors({});
        }}
        title="Add Customer"
        scrollable
        footer={
          <Button onPress={handleCreate} loading={creating} fullWidth>
            Create Customer
          </Button>
        }
      >
        <View style={styles.form}>
          <Input
            label="Name *"
            value={form.name}
            onChangeText={(v) => setForm((f) => ({ ...f, name: v }))}
            error={errors.name}
            placeholder="Full name"
          />
          <Input
            label="Email"
            value={form.email}
            onChangeText={(v) => setForm((f) => ({ ...f, email: v }))}
            error={errors.email}
            placeholder="email@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Input
            label="Phone"
            value={form.phone}
            onChangeText={(v) => setForm((f) => ({ ...f, phone: v }))}
            placeholder="+1 555 0100"
            keyboardType="phone-pad"
          />
          <Input
            label="Notes"
            value={form.notes}
            onChangeText={(v) => setForm((f) => ({ ...f, notes: v }))}
            placeholder="Optional notes…"
            multiline
          />
        </View>
      </AppModal>
    </PageShell>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[3],
    backgroundColor: colors.bgSurface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },
  searchInput: { maxWidth: Platform.OS === "web" ? 360 : undefined },

  tableHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[2],
    backgroundColor: colors.bgSubtle,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
    gap: spacing[4], // Match gap from rows
  },
  colHeading: {
    fontSize: fontSizes.xs,
    fontWeight: "700",
    color: colors.textTertiary,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  alignRight: { textAlign: "right" },

  // Columns & Flex logic
  colCustomer: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
  },
  colContact: { flex: 2 },
  colFixed: { alignItems: "flex-end", justifyContent: "center" },
  colMobileRight: { marginLeft: "auto" },

  list: { flex: 1 },
  separator: { height: 1, backgroundColor: colors.borderDefault },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[3],
    backgroundColor: colors.bgSurface,
    gap: spacing[4],
  },
  rowHovered: { backgroundColor: colors.bgSubtle },

  nameBlock: { flex: 1 },
  name: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold as any,
    color: colors.textPrimary,
  },
  metaMobile: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginTop: 1,
  },
  contactText: { fontSize: fontSizes.sm, color: colors.textSecondary },
  noData: { color: colors.textTertiary },
  orderCount: {
    fontSize: fontSizes.sm,
    fontWeight: "600",
    color: colors.textPrimary,
    width: COL_ORDERS,
  },
  spentAmount: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold as any,
    color: colors.textPrimary,
    width: COL_SPENT,
  },

  // Chevron alignment
  chevron: {
    fontSize: 20,
    color: colors.textTertiary,
    marginLeft: spacing[2],
    width: 16,
    textAlign: "center",
  },
  chevronSpacer: { width: 16, marginLeft: spacing[2] },

  mobileRight: { alignItems: "flex-end" },
  spendMobile: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold as any,
    color: colors.textPrimary,
  },
  ordersMobile: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    marginTop: 1,
  },

  skeletons: { padding: spacing[6], gap: spacing[3] },
  skeletonRow: { flexDirection: "row", alignItems: "center", gap: spacing[3] },

  pagination: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing[4],
    padding: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.borderDefault,
  },
  pageInfo: { fontSize: fontSizes.sm, color: colors.textSecondary },
  form: { gap: spacing[4] },
});
