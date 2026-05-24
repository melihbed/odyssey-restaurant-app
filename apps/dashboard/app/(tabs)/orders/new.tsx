import { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import {
  useGetMenuItems,
  useGetCustomers,
  useGetMenuCategories,
  usePostOrders,
} from "@repo/api-client";
import { formatCurrency } from "@repo/shared";
import {
  Button,
  Select,
  colors,
  fontSizes,
  fontWeights,
  spacing,
  radius,
} from "@repo/ui";
import { PageShell } from "../../../components/PageShell";

interface CartItem {
  menuItemId: string;
  name: string;
  priceCents: number;
  quantity: number;
}

export default function NewOrderScreen() {
  const router = useRouter();

  const { data: categories } = useGetMenuCategories();
  const { data: menuItems, isLoading: isLoadingMenu } = useGetMenuItems({
    available: "true" as any,
  });
  const { data: customerResponse, isLoading: isLoadingCustomers } =
    useGetCustomers();
  const { mutate: createOrder, isPending: isSubmitting } = usePostOrders();

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [cart, setCart] = useState<Record<string, CartItem>>({});

  const activeCategories = useMemo(
    () =>
      (categories ?? [])
        .filter((c) => c.isActive)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [categories]
  );

  const visibleItems = useMemo(() => {
    const all = menuItems ?? [];
    if (!selectedCategoryId) return all;
    return all.filter((item: any) => item.categoryId === selectedCategoryId);
  }, [menuItems, selectedCategoryId]);

  const customerOptions = useMemo(
    () =>
      (customerResponse?.data ?? []).map((c: any) => ({
        label: `${c.name}${c.email ? ` (${c.email})` : ""}`,
        value: c.id,
      })),
    [customerResponse]
  );

  const cartTotalCents = useMemo(
    () =>
      Object.values(cart).reduce(
        (sum, item) => sum + item.priceCents * item.quantity,
        0
      ),
    [cart]
  );

  const adjustCart = (
    id: string,
    name: string,
    priceCents: number,
    delta: number
  ) => {
    setCart((prev) => {
      const current = prev[id] ?? {
        menuItemId: id,
        name,
        priceCents,
        quantity: 0,
      };
      const quantity = current.quantity + delta;
      if (quantity <= 0) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: { ...current, quantity } };
    });
  };

  const handleSubmit = () => {
    const items = Object.values(cart).map((item) => ({
      menuItemId: item.menuItemId,
      quantity: item.quantity,
    }));
    if (items.length === 0) return alert("Cart is empty!");
    createOrder(
      {
        data: {
          ...(selectedCustomerId ? { customerId: selectedCustomerId } : {}),
          items,
        },
      },
      {
        onSuccess: () => router.replace("/(tabs)/orders"),
        onError: (err: any) =>
          alert(
            "Failed to create order: " +
              (err?.response?.data?.message || err.message)
          ),
      }
    );
  };

  return (
    <PageShell title="Create New Order">
      <View style={styles.container}>
        {/* LEFT: Menu */}
        <View style={styles.menuSection}>
          {/* Category tabs */}
          <View style={styles.tabsContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.tabs}
              contentContainerStyle={styles.tabsContent}
            >
              <Pressable
                onPress={() => setSelectedCategoryId(null)}
                style={StyleSheet.flatten([
                  styles.tab,
                  !selectedCategoryId ? styles.tabActive : null,
                ])}
              >
                <Text
                  style={[
                    styles.tabText,
                    !selectedCategoryId ? styles.tabTextActive : null,
                  ]}
                >
                  All
                </Text>
              </Pressable>
              {activeCategories.map((cat) => {
                const active = selectedCategoryId === cat.id;
                return (
                  <Pressable
                    key={cat.id}
                    onPress={() => setSelectedCategoryId(cat.id)}
                    style={StyleSheet.flatten([
                      styles.tab,
                      active ? styles.tabActive : null,
                    ])}
                  >
                    <Text
                      style={[
                        styles.tabText,
                        active ? styles.tabTextActive : null,
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* Items grid */}
          {isLoadingMenu ? (
            <ActivityIndicator
              size="large"
              color={colors.brand}
              style={{ marginTop: spacing[8] }}
            />
          ) : visibleItems.length === 0 ? (
            <View style={styles.emptyMenu}>
              <Text style={styles.emptyMenuText}>
                No items in this category
              </Text>
            </View>
          ) : (
            <ScrollView
              style={styles.menuList}
              contentContainerStyle={styles.menuGrid}
            >
              {visibleItems.map((item: any) => {
                const qty = cart[item.id]?.quantity ?? 0;
                const selected = qty > 0;
                return (
                  <Pressable
                    key={item.id}
                    style={StyleSheet.flatten([
                      styles.menuItemCard,
                      selected && styles.menuItemCardSelected,
                      !item.isAvailable && styles.menuItemCardDisabled,
                    ])}
                    onPress={() =>
                      item.isAvailable &&
                      adjustCart(item.id, item.name, item.priceCents, 1)
                    }
                    disabled={!item.isAvailable}
                  >
                    <Text
                      style={[
                        styles.menuItemName,
                        !item.isAvailable && { color: colors.textTertiary },
                      ]}
                    >
                      {item.name}
                    </Text>
                    <Text
                      style={[
                        styles.menuItemPrice,
                        selected && { color: colors.brand },
                      ]}
                    >
                      {formatCurrency(item.priceCents)}
                    </Text>
                    {!item.isAvailable && (
                      <Text style={styles.unavailableText}>Unavailable</Text>
                    )}
                    {selected && (
                      <View style={styles.qtyBadge}>
                        <Text style={styles.qtyBadgeText}>{qty}</Text>
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          )}
        </View>

        {/* RIGHT: Cart */}
        <View style={styles.sidebar}>
          <View style={styles.cartCard}>
            <Text style={styles.sectionHeader}>Order Details</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Customer</Text>
              {isLoadingCustomers ? (
                <Text style={styles.label}>Loading…</Text>
              ) : (
                <Select
                  options={customerOptions}
                  value={selectedCustomerId}
                  onChange={setSelectedCustomerId}
                  placeholder="Select a customer…"
                />
              )}
            </View>

            <View style={styles.divider} />

            <ScrollView style={styles.cartList}>
              {Object.values(cart).length === 0 ? (
                <Text style={styles.emptyCartText}>No items added.</Text>
              ) : (
                Object.values(cart).map((item) => (
                  <View key={item.menuItemId} style={styles.cartItem}>
                    <View style={styles.cartItemLeft}>
                      <Text style={styles.cartItemName}>{item.name}</Text>
                      <Text style={styles.cartItemPrice}>
                        {formatCurrency(item.priceCents)}
                      </Text>
                    </View>
                    <View style={styles.cartActions}>
                      <Pressable
                        style={styles.qtyBtn}
                        onPress={() =>
                          adjustCart(
                            item.menuItemId,
                            item.name,
                            item.priceCents,
                            -1
                          )
                        }
                      >
                        <Text style={styles.qtyBtnText}>−</Text>
                      </Pressable>
                      <Text style={styles.cartQuantity}>{item.quantity}</Text>
                      <Pressable
                        style={styles.qtyBtn}
                        onPress={() =>
                          adjustCart(
                            item.menuItemId,
                            item.name,
                            item.priceCents,
                            1
                          )
                        }
                      >
                        <Text style={styles.qtyBtnText}>+</Text>
                      </Pressable>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>

            <View style={styles.divider} />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>
                {formatCurrency(cartTotalCents)}
              </Text>
            </View>

            <Button
              onPress={handleSubmit}
              disabled={
                Object.values(cart).length === 0 ||
                isSubmitting ||
                !selectedCustomerId
              }
              loading={isSubmitting}
              fullWidth
            >
              Place Order
            </Button>
          </View>
        </View>
      </View>
    </PageShell>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: "row", gap: spacing[6], flex: 1 },

  // Menu section
  menuSection: { flex: 2, display: "flex" as any, flexDirection: "column" },

  // Category tabs
  tabsContainer: { height: 48, marginBottom: spacing[4] },
  tabs: { flex: 1 },
  tabsContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
    paddingHorizontal: spacing[1],
  },
  tab: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },
  tabActive: { backgroundColor: colors.brand, borderColor: colors.brand },
  tabText: {
    fontSize: fontSizes.sm,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  tabTextActive: { color: "#fff" },

  // Grid
  menuList: { flex: 1 },
  menuGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing[3],
    paddingBottom: spacing[6],
  },
  menuItemCard: {
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.md,
    padding: spacing[4],
    width: 180,
    position: "relative",
    display: "flex",
  },
  menuItemCardSelected: { borderColor: colors.brand, borderWidth: 2 },
  menuItemCardDisabled: { opacity: 0.45 },
  menuItemName: {
    fontSize: fontSizes.md,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: spacing[1],
  },
  menuItemPrice: { fontSize: fontSizes.sm, color: colors.textSecondary },
  unavailableText: {
    color: "#dc2626",
    fontSize: fontSizes.xs,
    marginTop: spacing[1],
  },
  qtyBadge: {
    position: "absolute",
    top: spacing[2],
    right: spacing[2],
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyBadgeText: { fontSize: 11, fontWeight: "700", color: "#fff" },
  emptyMenu: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: spacing[16],
  },
  emptyMenuText: { fontSize: fontSizes.md, color: colors.textTertiary },

  // Cart sidebar
  sidebar: { width: 360 },
  cartCard: {
    flex: 1,
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.lg,
    padding: spacing[5],
  },
  sectionHeader: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold as any,
    color: colors.textPrimary,
    marginBottom: spacing[4],
  },
  inputGroup: { marginBottom: spacing[4] },
  label: {
    fontSize: fontSizes.sm,
    fontWeight: "500",
    color: colors.textSecondary,
    marginBottom: spacing[1],
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderDefault,
    marginVertical: spacing[4],
  },
  cartList: { flex: 1, minHeight: 150 },
  emptyCartText: {
    color: colors.textSecondary,
    fontStyle: "italic",
    textAlign: "center",
    padding: spacing[4],
  },
  cartItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing[3],
  },
  cartItemLeft: { flex: 1 },
  cartItemName: {
    fontSize: fontSizes.sm,
    fontWeight: "500",
    color: colors.textPrimary,
  },
  cartItemPrice: { fontSize: fontSizes.xs, color: colors.textSecondary },
  cartActions: { flexDirection: "row", alignItems: "center", gap: spacing[2] },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: colors.bgSubtle,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyBtnText: {
    fontSize: fontSizes.md,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  cartQuantity: {
    width: 24,
    textAlign: "center",
    fontSize: fontSizes.sm,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing[4],
  },
  totalLabel: {
    fontSize: fontSizes.lg,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  totalValue: {
    fontSize: fontSizes.xl,
    fontWeight: "bold" as any,
    color: colors.brand,
  },
});
