import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  Platform,
  useWindowDimensions,
} from "react-native";
import { Link } from "expo-router";
import { useGetHomeStats } from "@repo/api-client";
import { formatCurrency, formatDateTime } from "@repo/shared";
import {
  colors,
  fontSizes,
  fontWeights,
  spacing,
  StatusBadge,
  Skeleton,
  ErrorState,
  Card,
  radius,
} from "@repo/ui";
import { PageShell } from "../../components/PageShell";
import { KpiCard } from "../../components/KpiCard";
import { SectionHeader } from "../../components/SectionHeader";

export default function HomeScreen() {
  const { data: stats, isLoading, isError, refetch } = useGetHomeStats();
  const { width } = useWindowDimensions();

  // Responsive check for standard web breakpoints
  const isLargeScreen = width >= 1024;
  const isMediumScreen = width >= 768;

  if (isError) {
    return (
      <PageShell title="Home">
        <ErrorState
          onRetry={refetch}
          description="Could not load dashboard stats. Is the backend running?"
        />
      </PageShell>
    );
  }

  const getKpiWidth = () => {
    if (isLargeScreen) return "25%";
    if (isMediumScreen) return "50%";
    return "100%";
  };

  return (
    <PageShell
      title="Odyssey Restaurant"
      subtitle={new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      })}
    >
      {/* KPI Grid */}
      <View style={styles.kpiRow}>
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <View
              key={i}
              style={[styles.kpiCell, { width: getKpiWidth() as any }]}
            >
              <Skeleton height={110} />
            </View>
          ))
        ) : (
          <>
            <View style={[styles.kpiCell, { width: getKpiWidth() as any }]}>
              <KpiCard
                label="Orders Today"
                value={String(stats?.totalOrdersToday ?? 0)}
                subvalue={`${stats?.totalOrdersAllTime ?? 0} all time`}
                icon="📋"
                color={colors.brand}
              />
            </View>
            <View style={[styles.kpiCell, { width: getKpiWidth() as any }]}>
              <KpiCard
                label="Revenue Today"
                value={formatCurrency(stats?.revenueTodayCents ?? 0)}
                subvalue={`${formatCurrency(
                  stats?.revenueAllTimeCents ?? 0
                )} all time`}
                icon="💰"
                color="#16a34a"
              />
            </View>
            <View style={[styles.kpiCell, { width: getKpiWidth() as any }]}>
              <KpiCard
                label="Pending Orders"
                value={String(stats?.pendingOrders ?? 0)}
                icon="⏳"
                color={stats?.pendingOrders ? "#d97706" : colors.textSecondary}
              />
            </View>
            <View style={[styles.kpiCell, { width: getKpiWidth() as any }]}>
              <KpiCard
                label="Avg Prep Time"
                value={`${stats?.avgPrepTimeMins ?? 0}m`}
                icon="⏱️"
                color="#8b5cf6"
              />
            </View>
          </>
        )}
      </View>

      <View style={isLargeScreen ? styles.gridRow : styles.columnLayout}>
        {/* LEFT COLUMN: Pipeline & Top Items */}
        <View style={styles.leftCol}>
          {/* Order Status Breakdown */}
          {stats?.ordersByStatus && (
            <View style={styles.section}>
              <SectionHeader title="Order Pipeline" />
              <View style={styles.pipelineGrid}>
                {(["pending", "accepted", "preparing", "ready"] as const).map(
                  (status) => (
                    <View
                      key={status}
                      style={[
                        styles.pipelineCell,
                        { width: isMediumScreen ? "25%" : "50%" },
                      ]}
                    >
                      <Card style={styles.pipelineCard} padding="md">
                        <Text style={styles.pipelineCount}>
                          {stats.ordersByStatus[status] ?? 0}
                        </Text>
                        <StatusBadge status={status} />
                      </Card>
                    </View>
                  )
                )}
              </View>
            </View>
          )}

          {/* Popular Items */}
          {(isLoading || (stats?.popularItems?.length ?? 0) > 0) && (
            <View style={styles.section}>
              <SectionHeader
                title="Top Menu Items"
                right={
                  <Link href="/menu">
                    <Text style={styles.seeAll}>See menu →</Text>
                  </Link>
                }
              />
              <Card padding="none">
                {isLoading
                  ? Array.from({ length: 5 }, (_, i) => (
                      <View
                        key={i}
                        style={[
                          styles.itemRow,
                          i > 0 ? styles.itemBorder : null,
                        ]}
                      >
                        <Skeleton height={14} width={200} />
                        <Skeleton height={14} width={60} />
                      </View>
                    ))
                  : stats?.popularItems?.map((item: any, i: number) => (
                      <View
                        key={item.id}
                        style={[
                          styles.itemRow,
                          i > 0 ? styles.itemBorder : null,
                        ]}
                      >
                        <View style={styles.itemLeft}>
                          <Text style={styles.itemRank}>{i + 1}</Text>
                          <Text style={styles.itemName}>{item.name}</Text>
                        </View>
                        <View style={styles.itemRight}>
                          <Text style={styles.itemOrders}>
                            {item.orderCount} orders
                          </Text>
                          <Text style={styles.itemPrice}>
                            {formatCurrency(item.priceCents)}
                          </Text>
                        </View>
                      </View>
                    ))}
              </Card>
            </View>
          )}
        </View>

        {/* RIGHT COLUMN: Recent Orders */}
        <View style={styles.rightCol}>
          <View style={styles.section}>
            <SectionHeader
              title="Recent Orders"
              right={
                <Link href="/orders">
                  <Text style={styles.seeAll}>View all →</Text>
                </Link>
              }
            />
            <Card padding="none" style={styles.recentOrdersCard}>
              {isLoading
                ? Array.from({ length: 5 }, (_, i) => (
                    <View
                      key={i}
                      style={[styles.itemRow, i > 0 ? styles.itemBorder : null]}
                    >
                      <Skeleton height={14} width={100} />
                      <Skeleton height={14} width={80} />
                    </View>
                  ))
                : stats?.recentOrders
                    ?.slice(0, 8)
                    .map((order: any, i: number) => (
                      <Link
                        key={order.id}
                        href={`/(tabs)/orders/${order.id}`}
                        asChild
                      >
                        {/* FIX: Flatten style and enforce flex display for Web */}
                        <Pressable
                          style={StyleSheet.flatten([
                            { display: "flex" as any },
                            styles.itemRow,
                            styles.clickableRow,
                            i > 0 ? styles.itemBorder : null,
                          ])}
                        >
                          <View style={styles.itemLeft}>
                            <Text style={styles.orderId}>
                              #{order.id.slice(-6).toUpperCase()}
                            </Text>
                            <Text style={styles.orderTime}>
                              {formatDateTime(order.createdAt)}
                            </Text>
                          </View>
                          <View style={styles.itemRight}>
                            <StatusBadge status={order.status} />
                            <Text style={styles.orderTotal}>
                              {formatCurrency(order.totalCents)}
                            </Text>
                          </View>
                        </Pressable>
                      </Link>
                    ))}
            </Card>
          </View>
        </View>
      </View>
    </PageShell>
  );
}

// ...existing code...
const styles = StyleSheet.create({
  // Grid Layouts
  gridRow: { flexDirection: "row", gap: spacing[6], alignItems: "flex-start" },
  columnLayout: { flexDirection: "column", gap: spacing[0] },
  leftCol: { flex: 3 },
  rightCol: { flex: 2 },

  // KPI Grid
  kpiRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -spacing[2],
    marginBottom: spacing[6],
  },
  kpiCell: {
    paddingHorizontal: spacing[2],
    marginBottom: spacing[3],
  },

  section: { marginBottom: spacing[6] },

  // Pipeline
  pipelineGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -spacing[2],
  },
  pipelineCell: { paddingHorizontal: spacing[2], marginBottom: spacing[4] },

  // RULE 1: Subtle Contrast & Borders.
  // Removing harsh shadows, using a subtle off-white background with a delicate border.
  pipelineCard: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bgSubtle,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.lg,
    paddingVertical: spacing[5],
  },

  // RULE 2: Typography Hierarchy
  // The number is massive and stark, the badge relies on its own internal colors.
  pipelineCount: {
    fontSize: 32,
    fontWeight: "800",
    color: colors.textPrimary,
    marginBottom: spacing[2],
    letterSpacing: -0.5,
  },

  seeAll: { fontSize: fontSizes.sm, color: colors.brand, fontWeight: "600" },

  // Lists
  recentOrdersCard: { flex: 1, overflow: "hidden" },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[4],
  },
  clickableRow: { backgroundColor: colors.bgSurface },
  itemBorder: { borderTopWidth: 1, borderTopColor: colors.borderDefault },

  // RULE 3: Alignment & Icons
  // Perfect horizontal alignment for the Rank Badge + Text Stack
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
    flex: 1,
  },
  itemTextStack: {
    flexDirection: "column",
    gap: 2,
  },
  itemRight: { alignItems: "flex-end", gap: spacing[1] },

  // Soft background icon/badge for Rank
  itemRank: {
    width: 28,
    height: 28,
    borderRadius: 6, // Square-ish modern look instead of full circle
    backgroundColor: colors.brandLight,
    textAlign: "center",
    lineHeight: 28,
    fontSize: fontSizes.sm,
    color: colors.brand,
    fontWeight: "700",
    overflow: "hidden",
  },

  // Clear Hierarchy: Primary name vs Secondary info
  itemName: {
    fontSize: fontSizes.sm,
    color: colors.textPrimary,
    fontWeight: "600",
  },
  itemOrders: { fontSize: fontSizes.xs, color: colors.textSecondary },

  // Aligned Numerical Data
  itemPrice: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    fontWeight: "500",
  },

  orderId: {
    fontSize: fontSizes.sm,
    color: colors.textPrimary,
    fontWeight: "700",
  },
  orderTime: {
    fontSize: fontSizes.xs,
    color: colors.textTertiary,
    marginTop: 2,
  },
  orderTotal: {
    fontSize: fontSizes.md,
    color: colors.textPrimary,
    fontWeight: "700",
  },
});
