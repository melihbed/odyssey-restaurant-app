import React, { useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { useGetOrders } from "@repo/api-client";
import {
  formatCurrency,
  formatRelativeTime,
  ORDER_STATUS_LABELS,
} from "@repo/shared";
import {
  Button,
  Card,
  colors,
  EmptyState,
  ErrorState,
  fontSizes,
  fontWeights,
  Input,
  Skeleton,
  spacing,
  StatusBadge,
} from "@repo/ui";
import { PageShell } from "../../../components/PageShell";

const ALL_STATUSES = [
  "pending",
  "accepted",
  "preparing",
  "ready",
  "completed",
  "rejected",
  "cancelled",
] as const;
type OrderStatus = (typeof ALL_STATUSES)[number];

export default function OrdersScreen() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<OrderStatus | undefined>(
    undefined
  );
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, refetch } = useGetOrders({
    status: statusFilter,
    page,
    limit: 25,
  });

  const orders = data?.data ?? [];
  const total = data?.total ?? 0;

  return (
    <PageShell
      title="Orders"
      subtitle={`${total} total`}
      scrollable={false}
      headerRight={
        <Link href="/(tabs)/orders/new" asChild>
          <Button size="sm">+ New Order</Button>
        </Link>
      }
    >
      {/* Status Filter Chips */}
      <View style={styles.filters}>
        <Pressable
          style={[styles.chip, !statusFilter ? styles.chipActive : null]}
          onPress={() => {
            setStatusFilter(undefined);
            setPage(1);
          }}
        >
          <Text
            style={[
              styles.chipText,
              !statusFilter ? styles.chipTextActive : null,
            ]}
          >
            All
          </Text>
        </Pressable>
        {ALL_STATUSES.map((s) => (
          <Pressable
            key={s}
            style={[styles.chip, statusFilter === s ? styles.chipActive : null]}
            onPress={() => {
              setStatusFilter(s);
              setPage(1);
            }}
          >
            <Text
              style={[
                styles.chipText,
                statusFilter === s ? styles.chipTextActive : null,
              ]}
            >
              {ORDER_STATUS_LABELS[s]}
            </Text>
          </Pressable>
        ))}
      </View>

      {isError ? (
        <ErrorState onRetry={refetch} description="Could not load orders" />
      ) : isLoading ? (
        <View style={styles.listContainer}>
          {Array.from({ length: 8 }, (_, i) => (
            <View key={i} style={styles.skeletonRow}>
              <Skeleton height={60} />
            </View>
          ))}
        </View>
      ) : orders.length === 0 ? (
        <EmptyState
          icon="📋"
          title="No orders"
          description={
            statusFilter
              ? `No ${ORDER_STATUS_LABELS[statusFilter]?.toLowerCase()} orders`
              : "No orders yet"
          }
        />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item }) => (
            <Link href={`/(tabs)/orders/${item.id}`} asChild>
              {/* FIX: Flatten style and enforce display: flex for the Web <a> tag */}
              <Pressable
                style={StyleSheet.flatten([
                  { display: "flex" as any },
                  styles.row,
                ])}
              >
                <View style={styles.rowLeft}>
                  <View style={styles.rowTop}>
                    <Text style={styles.orderId}>
                      #{item.id.slice(-6).toUpperCase()}
                    </Text>
                    <StatusBadge status={item.status} />
                  </View>
                  <Text style={styles.rowMeta}>
                    {(item as any).customerName ?? "Walk-in"} ·{" "}
                    {(item as any).itemCount} item
                    {(item as any).itemCount !== 1 ? "s" : ""} ·{" "}
                    {formatRelativeTime(item.createdAt)}
                  </Text>
                </View>
                <View style={styles.rowRight}>
                  <Text style={styles.rowTotal}>
                    {formatCurrency(item.totalCents)}
                  </Text>
                  <Text style={styles.rowArrow}>›</Text>
                </View>
              </Pressable>
            </Link>
          )}
        />
      )}

      {/* Pagination */}
      {total > 25 && (
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
            Page {page} of {Math.ceil(total / 25)}
          </Text>
          <Button
            variant="secondary"
            size="sm"
            disabled={page * 25 >= total}
            onPress={() => setPage((p) => p + 1)}
          >
            Next →
          </Button>
        </View>
      )}
    </PageShell>
  );
}

const styles = StyleSheet.create({
  filters: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing[1.5],
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[3],
    backgroundColor: colors.bgSurface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },
  chip: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: 20,
    backgroundColor: colors.bgSubtle,
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
  chipActive: { backgroundColor: colors.brand, borderColor: colors.brand },
  chipText: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  chipTextActive: { color: "#fff" },
  listContainer: { padding: spacing[5], gap: spacing[2] },
  skeletonRow: { marginBottom: spacing[2] },
  list: { flex: 1 },
  listContent: { padding: spacing[4] },
  separator: { height: 1, backgroundColor: colors.borderDefault },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    backgroundColor: colors.bgSurface,
  },
  rowPressed: { backgroundColor: colors.bgSubtle },
  rowLeft: { flex: 1, gap: spacing[1] },
  rowTop: { flexDirection: "row", alignItems: "center", gap: spacing[2] },
  orderId: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold as any,
    color: colors.textPrimary,
    fontFamily: "monospace",
  },
  rowMeta: { fontSize: fontSizes.sm, color: colors.textSecondary },
  rowRight: { flexDirection: "row", alignItems: "center", gap: spacing[2] },
  rowTotal: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold as any,
    color: colors.textPrimary,
  },
  rowArrow: { fontSize: 20, color: colors.textTertiary },
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
});
