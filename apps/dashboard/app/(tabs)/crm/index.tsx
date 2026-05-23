import React, { useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Link } from "expo-router";
import {
  formatCurrency,
  formatRelativeTime,
  getCustomerTier,
  TIER_META,
  type CustomerTier,
} from "@repo/shared";
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
  Select,
  Skeleton,
  spacing,
} from "@repo/ui";
import { PageShell } from "../../../components/PageShell";
import {
  useGetCustomers,
  GetCustomersSortBy,
  GetCustomersSortOrder,
} from "@repo/api-client";
import { useCreateCustomer } from "../../../hooks/useCustomers";

const COL_TIER = 70;
const COL_ORDERS = 80;
const COL_SPENT = 120;
const COL_LAST_VISIT = 120;

const SORT_OPTIONS = [
  { label: "Newest First", value: "createdAt_desc" },
  { label: "Name A–Z", value: "name_asc" },
  { label: "Name Z–A", value: "name_desc" },
  { label: "Most Spent", value: "totalSpent_desc" },
  { label: "Most Orders", value: "orderCount_desc" },
  { label: "Last Visit", value: "lastOrder_desc" },
];

const SEGMENTS: { label: string; value: "all" | CustomerTier }[] = [
  { label: "All", value: "all" },
  { label: "VIP", value: "vip" },
  { label: "Regular", value: "regular" },
  { label: "New", value: "new" },
  { label: "At Risk", value: "at-risk" },
];

function parseSortKey(key: string) {
  const [by, order] = key.split("_") as [string, string];
  return {
    sortBy:
      by === "createdAt"
        ? undefined
        : (by as (typeof GetCustomersSortBy)[keyof typeof GetCustomersSortBy]),
    sortOrder:
      (order as (typeof GetCustomersSortOrder)[keyof typeof GetCustomersSortOrder]) ??
      "desc",
  };
}

export default function CRMScreen() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [sortKey, setSortKey] = useState("createdAt_desc");
  const [segment, setSegment] = useState<"all" | CustomerTier>("all");

  const { sortBy, sortOrder } = parseSortKey(sortKey);

  const { data, isLoading, isError, refetch } = useGetCustomers({
    search: search || undefined,
    page,
    limit: 20,
    sortBy,
    sortOrder,
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

  const allCustomers = data?.data ?? [];
  const filteredCustomers =
    segment === "all"
      ? allCustomers
      : allCustomers.filter((c) => getCustomerTier(c) === segment);
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
      {/* Toolbar */}
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
        {isWeb && (
          <View style={styles.sortSelect}>
            <Select
              placeholder="Sort by…"
              value={sortKey}
              onChange={(v) => {
                setSortKey(v);
                setPage(1);
              }}
              options={SORT_OPTIONS}
            />
          </View>
        )}
      </View>

      {/* Segment chips */}
      <View style={styles.chipsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chips}
          contentContainerStyle={styles.chipsContent}
        >
          {SEGMENTS.map(({ label, value }) => {
            const active = segment === value;
            const tierColor =
              value !== "all"
                ? TIER_META[value as CustomerTier].color
                : colors.brand;
            return (
              <Pressable
                key={value}
                onPress={() => setSegment(value)}
                style={StyleSheet.flatten([
                  styles.chip,
                  active
                    ? { backgroundColor: tierColor, borderColor: tierColor }
                    : null,
                ])}
              >
                <Text
                  style={[
                    styles.chipText,
                    active ? styles.chipTextActive : null,
                  ]}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Table header — web only */}
      {isWeb && (
        <View style={styles.tableHeader}>
          <View style={styles.colCustomer}>
            <Text style={styles.colHeading}>Customer</Text>
          </View>
          <View style={[styles.colFixed, { width: COL_TIER }]}>
            <Text style={styles.colHeading}>Tier</Text>
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
          <View style={[styles.colFixed, { width: COL_LAST_VISIT }]}>
            <Text style={[styles.colHeading, styles.alignRight]}>
              Last Visit
            </Text>
          </View>
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
      ) : filteredCustomers.length === 0 ? (
        <EmptyState
          icon="👥"
          title="No customers"
          description={
            search
              ? `No results for "${search}"`
              : segment !== "all"
              ? `No ${
                  TIER_META[segment as CustomerTier]?.label ?? segment
                } customers`
              : "Add your first customer"
          }
          actionLabel="Add Customer"
          onAction={() => setShowCreate(true)}
        />
      ) : (
        <FlatList
          data={filteredCustomers}
          keyExtractor={(c) => c.id}
          style={styles.list}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item }) => {
            const tier = getCustomerTier(item);
            const tierMeta = TIER_META[tier];
            return (
              <Link href={`/(tabs)/crm/${item.id}`} asChild>
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
                        <>
                          <Text
                            style={[
                              styles.tierBadgeMobile,
                              { color: tierMeta.color },
                            ]}
                          >
                            {tierMeta.label}
                          </Text>
                          <Text style={styles.metaMobile} numberOfLines={1}>
                            {item.email ?? item.phone ?? "No contact"}
                          </Text>
                        </>
                      )}
                    </View>
                  </View>

                  {/* Tier — web only */}
                  {isWeb && (
                    <View style={[styles.colFixed, { width: COL_TIER }]}>
                      <View
                        style={[
                          styles.tierPill,
                          {
                            backgroundColor: tierMeta.color + "18",
                            borderColor: tierMeta.color + "40",
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.tierPillText,
                            { color: tierMeta.color },
                          ]}
                        >
                          {tierMeta.label}
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* Contact — web only */}
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
                        {item.orderCount ?? 0}
                      </Text>
                    ) : (
                      <View style={styles.mobileRight}>
                        <Text style={styles.spendMobile}>
                          {formatCurrency(item.totalSpentCents ?? 0)}
                        </Text>
                        <Text style={styles.ordersMobile}>
                          {item.orderCount ?? 0} orders
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Spent — web only */}
                  {isWeb && (
                    <View style={[styles.colFixed, { width: COL_SPENT }]}>
                      <Text style={[styles.spentAmount, styles.alignRight]}>
                        {formatCurrency(item.totalSpentCents ?? 0)}
                      </Text>
                    </View>
                  )}

                  {/* Last Visit — web only */}
                  {isWeb && (
                    <View style={[styles.colFixed, { width: COL_LAST_VISIT }]}>
                      <Text style={[styles.lastVisit, styles.alignRight]}>
                        {item.lastOrderAt
                          ? formatRelativeTime(item.lastOrderAt)
                          : "—"}
                      </Text>
                    </View>
                  )}

                  {isWeb && <Text style={styles.chevron}>›</Text>}
                </Pressable>
              </Link>
            );
          }}
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
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[3],
    backgroundColor: colors.bgSurface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },
  searchInput: { flex: 1 },
  sortSelect: { width: 180 },

  // Segment chips
  chipsContainer: {
    height: 48, // Constrain container height
    backgroundColor: colors.bgSurface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },
  chips: { flex: 1 },
  chipsContent: {
    flexDirection: "row",
    alignItems: "center", // Prevening stretching
    gap: spacing[2],
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[1],
  },
  chip: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  chipText: {
    fontSize: fontSizes.xs,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  chipTextActive: { color: "#fff" },

  // Table header
  tableHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[2],
    backgroundColor: colors.bgSubtle,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },
  colHeading: {
    fontSize: fontSizes.xs,
    fontWeight: "700",
    color: colors.textTertiary,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  alignRight: { textAlign: "right" },
  chevronSpacer: { width: 28 },

  // Columns
  colCustomer: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
  },
  colContact: { flex: 2 },
  colFixed: { alignItems: "flex-end", justifyContent: "center" },
  colMobileRight: { marginLeft: "auto" },

  // Tier pill
  tierPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  tierPillText: { fontSize: 10, fontWeight: "700" },
  tierBadgeMobile: { fontSize: fontSizes.xs, fontWeight: "700", marginTop: 1 },

  // List
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
  lastVisit: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    width: COL_LAST_VISIT,
  },
  chevron: { fontSize: 20, color: colors.textTertiary, marginLeft: spacing[2] },

  // Mobile right side
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

  // Skeletons
  skeletons: { padding: spacing[6], gap: spacing[3] },
  skeletonRow: { flexDirection: "row", alignItems: "center", gap: spacing[3] },

  // Pagination
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
