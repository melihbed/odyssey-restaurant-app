import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View, Platform } from "react-native";
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
} from "@repo/ui";
import { PageShell } from "../../components/PageShell";
import { KpiCard } from "../../components/KpiCard";
import { SectionHeader } from "../../components/SectionHeader";

export default function HomeScreen() {
  const { data: stats, isLoading, isError, refetch } = useGetHomeStats();

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
          <>
            <View style={styles.kpiCell}>
              <Skeleton height={100} />
            </View>
            <View style={styles.kpiCell}>
              <Skeleton height={100} />
            </View>
            <View style={styles.kpiCell}>
              <Skeleton height={100} />
            </View>
            <View style={styles.kpiCell}>
              <Skeleton height={100} />
            </View>
          </>
        ) : (
          <>
            <View style={styles.kpiCell}>
              <KpiCard
                label="Orders Today"
                value={String(stats?.totalOrdersToday ?? 0)}
                subvalue={`${stats?.totalOrdersAllTime ?? 0} all time`}
                icon="📋"
                color={colors.brand}
              />
            </View>
            <View style={styles.kpiCell}>
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
            <View style={styles.kpiCell}>
              <KpiCard
                label="Pending Orders"
                value={String(stats?.pendingOrders ?? 0)}
                icon="⏳"
                color={stats?.pendingOrders ? "#d97706" : colors.textSecondary}
              />
            </View>
            <View style={styles.kpiCell}>
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

      {/* Order Status Breakdown */}
      {stats?.ordersByStatus && (
        <View style={styles.section}>
          <SectionHeader title="Order Pipeline" />
          <View style={styles.pipelineRow}>
            {(["pending", "accepted", "preparing", "ready"] as const).map(
              (status) => (
                <View key={status} style={styles.pipelineCell}>
                  <Card style={styles.pipelineCard}>
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
              <Link href="/(tabs)/menu/index">
                <Text style={styles.seeAll}>See menu →</Text>
              </Link>
            }
          />
          <Card padding="none">
            {isLoading
              ? Array.from({ length: 5 }, (_, i) => (
                  <View
                    key={i}
                    style={[styles.itemRow, i > 0 ? styles.itemBorder : null]}
                  >
                    <Skeleton height={14} width={200} />
                    <Skeleton height={14} width={60} />
                  </View>
                ))
              : stats?.popularItems?.map((item: any, i: number) => (
                  <View
                    key={item.id}
                    style={[styles.itemRow, i > 0 ? styles.itemBorder : null]}
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

      {/* Recent Orders */}
      <View style={styles.section}>
        <SectionHeader
          title="Recent Orders"
          right={
            <Link href="/(tabs)/orders/index">
              <Text style={styles.seeAll}>View all →</Text>
            </Link>
          }
        />
        <Card padding="none">
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
            : stats?.recentOrders?.slice(0, 8).map((order: any, i: number) => (
                <Link
                  key={order.id}
                  href={`/(tabs)/orders/${order.id}`}
                  asChild
                >
                  <Pressable
                    style={StyleSheet.flatten([
                      styles.itemRow,
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
    </PageShell>
  );
}

const styles = StyleSheet.create({
  kpiRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -spacing[2],
    marginBottom: spacing[5],
  },
  kpiCell: {
    width: Platform.OS === "web" ? "25%" : "50%",
    paddingHorizontal: spacing[2],
    marginBottom: spacing[3],
  },
  section: { marginBottom: spacing[6] },
  pipelineRow: { flexDirection: "row", gap: spacing[2] },
  pipelineCell: { flex: 1 },
  pipelineCard: { alignItems: "center", padding: spacing[3] },
  pipelineCount: {
    fontSize: fontSizes["2xl"],
    fontWeight: fontWeights.bold as any,
    color: colors.textPrimary,
    marginBottom: spacing[1],
  },
  seeAll: { fontSize: fontSizes.sm, color: colors.brand, fontWeight: "500" },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  itemBorder: { borderTopWidth: 1, borderTopColor: colors.borderDefault },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
    flex: 1,
  },
  itemRight: { alignItems: "flex-end", gap: spacing[1] },
  itemRank: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.brandLight,
    textAlign: "center",
    lineHeight: 20,
    fontSize: fontSizes.xs,
    color: colors.brand,
    fontWeight: "700",
    overflow: "hidden",
  },
  itemName: {
    fontSize: fontSizes.sm,
    color: colors.textPrimary,
    fontWeight: "500",
  },
  itemOrders: { fontSize: fontSizes.xs, color: colors.textSecondary },
  itemPrice: {
    fontSize: fontSizes.sm,
    color: colors.textPrimary,
    fontWeight: "500",
  },
  orderId: {
    fontSize: fontSizes.sm,
    color: colors.textPrimary,
    fontWeight: "600",
    fontFamily: "monospace",
  },
  orderTime: { fontSize: fontSizes.xs, color: colors.textSecondary },
  orderTotal: {
    fontSize: fontSizes.sm,
    color: colors.textPrimary,
    fontWeight: "600",
  },
});
