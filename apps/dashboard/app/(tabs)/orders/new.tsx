import React, { useState, useMemo } from "react";
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
  usePostOrders,
} from "@repo/api-client";
import { formatCurrency } from "@repo/shared";
import {
  Card,
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

  const { data: menuItems, isLoading: isLoadingMenu } = useGetMenuItems();
  const { data: customerResponse, isLoading: isLoadingCustomers } =
    useGetCustomers();
  const { mutate: createOrder, isPending: isSubmitting } = usePostOrders();

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [cart, setCart] = useState<Record<string, CartItem>>({});

  const customers = customerResponse?.data ?? [];
  const customerOptions = useMemo(() => {
    return customers.map((c: any) => ({
      label: `${c.name} ${c.email ? `(${c.email})` : ""}`,
      value: c.id,
    }));
  }, [customers]);

  const cartTotalCents = useMemo(() => {
    return Object.values(cart).reduce(
      (total, item) => total + item.priceCents * item.quantity,
      0
    );
  }, [cart]);

  const adjustCart = (id: string, name: string, priceCents: number, delta: number) => {
    setCart((prev) => {
      const current = prev[id] ?? { menuItemId: id, name, priceCents, quantity: 0 }
      const quantity = current.quantity + delta
      if (quantity <= 0) {
        const { [id]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [id]: { ...current, quantity } }
    })
  }

  const handleSubmit = () => {
    const orderItems = Object.values(cart).map((item) => ({
      menuItemId: item.menuItemId,
      quantity: item.quantity,
    }));

    if (orderItems.length === 0) return alert("Cart is empty!");

    createOrder(
      {
        data: {
          // UUID is optional based on spec (but needs to be valid if provided),
          // we only pass it if a customer was selected.
          ...(selectedCustomerId ? { customerId: selectedCustomerId } : {}),
          items: orderItems,
        },
      },
      {
        onSuccess: () => {
          router.replace("/(tabs)/orders"); // Go back to orders list
        },
        onError: (err: any) => {
          alert(
            "Failed to create order: " +
              (err?.response?.data?.message || err.message)
          );
        },
      }
    );
  };

  return (
    <PageShell title="Create New Order">
      <View style={styles.container}>
        {/* LEFT COLUMN: Menu Items */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionHeader}>Menu</Text>
          {isLoadingMenu ? (
            <ActivityIndicator size="large" color={colors.brand} />
          ) : (
            <ScrollView contentContainerStyle={styles.menuGrid}>
              {menuItems?.map((item: any) => (
                <Pressable
                  key={item.id}
                  style={[
                    styles.menuItemCard,
                    !item.isAvailable && { opacity: 0.5 },
                  ]}
                  onPress={() => item.isAvailable && adjustCart(item.id, item.name, item.priceCents, 1)}
                  disabled={!item.isAvailable}
                >
                  <Text style={styles.menuItemName}>{item.name}</Text>
                  <Text style={styles.menuItemPrice}>
                    {formatCurrency(item.priceCents)}
                  </Text>
                  {!item.isAvailable && (
                    <Text style={styles.unavailableText}>Unavailable</Text>
                  )}
                </Pressable>
              ))}
            </ScrollView>
          )}
        </View>

        {/* RIGHT COLUMN: Cart & Checkout */}
        <View style={styles.sidebar}>
          <Card padding="md" style={styles.cartCard}>
            <Text style={styles.sectionHeader}>Order Details</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Customer</Text>
              {isLoadingCustomers ? (
                <Text>Loading customers...</Text>
              ) : (
                <Select
                  options={customerOptions}
                  value={selectedCustomerId}
                  onChange={setSelectedCustomerId}
                  placeholder="Select a customer..."
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
                        {formatCurrency(item.priceCents * item.quantity)}
                      </Text>
                    </View>
                    <View style={styles.cartActions}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onPress={() => adjustCart(item.menuItemId, item.name, item.priceCents, -1)}
                      >-</Button>
                      <Text style={styles.cartQuantity}>{item.quantity}</Text>
                      <Button
                        variant="ghost"
                        size="sm"
                        onPress={() => adjustCart(item.menuItemId, item.name, item.priceCents, 1)}
                      >+</Button>
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
            >
              {isSubmitting ? "Submitting..." : "Place Order"}
            </Button>
          </Card>
        </View>
      </View>
    </PageShell>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: "row", gap: spacing[6], flex: 1, minHeight: 500 },
  menuSection: { flex: 2 },
  sidebar: { flex: 1, minWidth: 320 },
  sectionHeader: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold as any,
    color: colors.textPrimary,
    marginBottom: spacing[4],
  },
  menuGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing[4] },
  menuItemCard: {
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.md,
    padding: spacing[4],
    width: 200,
  },
  menuItemName: {
    fontSize: fontSizes.md,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: spacing[2],
  },
  menuItemPrice: { fontSize: fontSizes.md, color: colors.textSecondary },
  unavailableText: {
    color: colors.errorFg,
    fontSize: fontSizes.xs,
    marginTop: spacing[2],
  },
  cartCard: { flex: 1 },
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
  cartQuantity: {
    width: 24,
    textAlign: "center",
    fontSize: fontSizes.sm,
    fontWeight: "600",
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
    fontWeight: "bold",
    color: colors.brand,
  },
});
