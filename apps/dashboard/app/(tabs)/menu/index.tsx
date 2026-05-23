import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  Button,
  colors,
  ConfirmModal,
  EmptyState,
  ErrorState,
  fontSizes,
  fontWeights,
  AppModal,
  Input,
  Select,
  Skeleton,
  spacing,
  Badge,
} from "@repo/ui";
import { PageShell } from "../../../components/PageShell";
import { MenuItemCard } from "../../../components/MenuItemCard";
import { useGetMenuCategories, useGetMenuItems } from "@repo/api-client";
import {
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useCreateMenuItem,
  useUpdateMenuItemById,
  useDeleteMenuItemById,
} from "../../../hooks/useMenu";

type CategoryForm = { name: string; description: string };
type ItemForm = {
  name: string;
  description: string;
  priceCents: string;
  categoryId: string;
  prepTimeMins: string;
};

const emptyItem: ItemForm = {
  name: "",
  description: "",
  priceCents: "",
  categoryId: "",
  prepTimeMins: "15",
};
const emptyCat: CategoryForm = { name: "", description: "" };

export default function MenuScreen() {
  const {
    data: categories = [],
    isLoading: loadingCats,
    isError: errorCats,
    refetch: refetchCats,
  } = useGetMenuCategories();
  const [selectedCatId, setSelectedCatId] = useState<string | undefined>(
    undefined
  );

  const activeCatId = selectedCatId ?? categories[0]?.id;
  const {
    data: items = [],
    isLoading: loadingItems,
    refetch: refetchItems,
  } = useGetMenuItems({ categoryId: activeCatId });

  const { mutate: createCat, isPending: creatingCat } = useCreateCategory();
  const { mutate: updateCat, isPending: updatingCat } = useUpdateCategory(
    activeCatId ?? ""
  );
  const { mutate: deleteCat, isPending: deletingCat } = useDeleteCategory(
    activeCatId ?? ""
  );

  // Item CRUD — dynamic-ID mutations (ID passed at call time, not hook creation)
  const { mutate: createItem, isPending: creatingItem } = useCreateMenuItem();
  const { mutate: updateItem, isPending: updatingItem } =
    useUpdateMenuItemById();
  const { mutate: deleteItem, isPending: deletingItem } =
    useDeleteMenuItemById();

  const [showCatModal, setShowCatModal] = useState(false);
  const [editingCat, setEditingCat] = useState<any>(null);
  const [catForm, setCatForm] = useState<CategoryForm>(emptyCat);
  const [deleteCatConfirm, setDeleteCatConfirm] = useState(false);

  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [itemForm, setItemForm] = useState<ItemForm>(emptyItem);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);

  const catOptions = categories.map((c: any) => ({
    label: c.name,
    value: c.id,
  }));

  const openNewCat = () => {
    setCatForm(emptyCat);
    setEditingCat(null);
    setShowCatModal(true);
  };
  const openEditCat = (cat: any) => {
    setCatForm({ name: cat.name, description: cat.description ?? "" });
    setEditingCat(cat);
    setShowCatModal(true);
  };
  const handleSaveCat = () => {
    if (!catForm.name.trim()) return;
    if (editingCat) {
      updateCat({ data: catForm }, { onSuccess: () => setShowCatModal(false) });
    } else {
      createCat(
        { data: { ...catForm, sortOrder: categories.length } },
        { onSuccess: () => setShowCatModal(false) }
      );
    }
  };

  const openNewItem = () => {
    setItemForm({ ...emptyItem, categoryId: activeCatId ?? "" });
    setEditingItem(null);
    setShowItemModal(true);
  };
  const openEditItem = (item: any) => {
    setItemForm({
      name: item.name,
      description: item.description ?? "",
      priceCents: String(item.priceCents / 100),
      categoryId: item.categoryId ?? "",
      prepTimeMins: String(item.prepTimeMins),
    });
    setEditingItem(item);
    setShowItemModal(true);
  };
  const handleSaveItem = () => {
    if (!itemForm.name.trim() || !itemForm.priceCents) return;
    const payload = {
      name: itemForm.name,
      description: itemForm.description || undefined,
      priceCents: Math.round(parseFloat(itemForm.priceCents) * 100),
      categoryId: itemForm.categoryId || undefined,
      prepTimeMins: parseInt(itemForm.prepTimeMins) || 15,
    };
    if (editingItem) {
      updateItem(
        { id: editingItem.id, data: payload },
        { onSuccess: () => setShowItemModal(false) }
      );
    } else {
      createItem(
        { data: payload },
        { onSuccess: () => setShowItemModal(false) }
      );
    }
  };

  if (errorCats)
    return (
      <PageShell title="Menu">
        <ErrorState onRetry={refetchCats} />
      </PageShell>
    );

  return (
    <PageShell
      title="Menu"
      scrollable={false}
      headerRight={
        <Button size="sm" onPress={openNewCat}>
          + Category
        </Button>
      }
    >
      <View style={styles.layout}>
        {/* Sidebar: Categories */}
        <View style={styles.sidebar}>
          <Text style={styles.sidebarTitle}>Categories</Text>
          {loadingCats
            ? Array.from({ length: 4 }, (_, i) => (
                <Skeleton
                  key={i}
                  height={44}
                  style={{ marginBottom: spacing[1] }}
                />
              ))
            : categories.map((cat: any) => (
                <Pressable
                  key={cat.id}
                  style={[
                    styles.catItem,
                    cat.id === activeCatId ? styles.catItemActive : null,
                  ]}
                  onPress={() => setSelectedCatId(cat.id)}
                  onLongPress={() => openEditCat(cat)}
                >
                  <Text
                    style={[
                      styles.catName,
                      cat.id === activeCatId ? styles.catNameActive : null,
                    ]}
                    numberOfLines={1}
                  >
                    {cat.name}
                  </Text>
                  {!cat.isActive && <Badge variant="warning">Off</Badge>}
                </Pressable>
              ))}
        </View>

        {/* Main: Items */}
        <View style={styles.main}>
          <View style={styles.mainHeader}>
            <Text style={styles.mainTitle}>
              {categories.find((c: any) => c.id === activeCatId)?.name ??
                "Items"}
            </Text>
            <View style={styles.mainActions}>
              {activeCatId && (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    onPress={() =>
                      openEditCat(
                        categories.find((c: any) => c.id === activeCatId)!
                      )
                    }
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onPress={() => setDeleteCatConfirm(true)}
                  >
                    Delete
                  </Button>
                  <Button size="sm" onPress={openNewItem}>
                    + Item
                  </Button>
                </>
              )}
            </View>
          </View>

          <ScrollView
            style={styles.itemList}
            contentContainerStyle={styles.itemListContent}
          >
            {loadingItems ? (
              Array.from({ length: 5 }, (_, i) => (
                <Skeleton
                  key={i}
                  height={72}
                  style={{ marginBottom: spacing[2] }}
                />
              ))
            ) : items.length === 0 ? (
              <EmptyState
                icon="🍽️"
                title="No items"
                description="Add your first menu item"
                actionLabel="Add Item"
                onAction={openNewItem}
              />
            ) : (
              items.map((item: any) => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  onEdit={openEditItem}
                  onDeleteRequest={setDeleteItemId}
                />
              ))
            )}
          </ScrollView>
        </View>
      </View>

      {/* Category Modal */}
      <AppModal
        visible={showCatModal}
        onClose={() => setShowCatModal(false)}
        title={editingCat ? "Edit Category" : "New Category"}
        footer={
          <Button
            onPress={handleSaveCat}
            loading={creatingCat || updatingCat}
            fullWidth
          >
            {editingCat ? "Save" : "Create"}
          </Button>
        }
      >
        <View style={{ gap: spacing[4] }}>
          <Input
            label="Name *"
            value={catForm.name}
            onChangeText={(v) => setCatForm((f) => ({ ...f, name: v }))}
            placeholder="e.g. Appetizers"
          />
          <Input
            label="Description"
            value={catForm.description}
            onChangeText={(v) => setCatForm((f) => ({ ...f, description: v }))}
            multiline
          />
        </View>
      </AppModal>

      {/* Item Modal */}
      <AppModal
        visible={showItemModal}
        onClose={() => setShowItemModal(false)}
        title={editingItem ? "Edit Item" : "New Menu Item"}
        scrollable
        footer={
          <Button
            onPress={handleSaveItem}
            loading={creatingItem || updatingItem}
            fullWidth
          >
            {editingItem ? "Save" : "Create"}
          </Button>
        }
      >
        <View style={{ gap: spacing[4] }}>
          <Input
            label="Name *"
            value={itemForm.name}
            onChangeText={(v) => setItemForm((f) => ({ ...f, name: v }))}
          />
          <Input
            label="Description"
            value={itemForm.description}
            onChangeText={(v) => setItemForm((f) => ({ ...f, description: v }))}
            multiline
          />
          <Input
            label="Price ($) *"
            value={itemForm.priceCents}
            onChangeText={(v) => setItemForm((f) => ({ ...f, priceCents: v }))}
            keyboardType="decimal-pad"
            placeholder="12.99"
          />
          <Input
            label="Prep Time (min)"
            value={itemForm.prepTimeMins}
            onChangeText={(v) =>
              setItemForm((f) => ({ ...f, prepTimeMins: v }))
            }
            keyboardType="number-pad"
          />
          <Select
            label="Category"
            options={catOptions}
            value={itemForm.categoryId}
            onChange={(v) => setItemForm((f) => ({ ...f, categoryId: v }))}
          />
        </View>
      </AppModal>

      <ConfirmModal
        visible={deleteCatConfirm}
        onClose={() => setDeleteCatConfirm(false)}
        onConfirm={() =>
          deleteCat(undefined, {
            onSuccess: () => {
              setDeleteCatConfirm(false);
              setSelectedCatId(undefined);
            },
          })
        }
        title="Delete Category"
        message="Delete this category? Items in it will become uncategorized."
        confirmLabel="Delete"
        loading={deletingCat}
      />

      <ConfirmModal
        visible={!!deleteItemId}
        onClose={() => setDeleteItemId(null)}
        onConfirm={() => {
          if (deleteItemId)
            deleteItem(deleteItemId, {
              onSuccess: () => setDeleteItemId(null),
            });
        }}
        title="Delete Item"
        message="Remove this item from the menu?"
        confirmLabel="Delete"
        loading={deletingItem}
      />
    </PageShell>
  );
}

const styles = StyleSheet.create({
  layout: { flex: 1, flexDirection: "row" },
  sidebar: {
    width: Platform.OS === "web" ? 200 : 130,
    backgroundColor: colors.bgSurface,
    borderRightWidth: 1,
    borderRightColor: colors.borderDefault,
    padding: spacing[3],
  },
  sidebarTitle: {
    fontSize: fontSizes.xs,
    fontWeight: "700",
    color: colors.textTertiary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: spacing[2],
  },
  catItem: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2.5],
    borderRadius: 8,
    marginBottom: spacing[0.5],
  },
  catItemActive: { backgroundColor: colors.brandLight },
  catName: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  catNameActive: { color: colors.brand, fontWeight: "600" },
  main: { flex: 1, backgroundColor: colors.bgDefault },
  mainHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[3],
    backgroundColor: colors.bgSurface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },
  mainTitle: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold as any,
    color: colors.textPrimary,
  },
  mainActions: { flexDirection: "row", gap: spacing[2] },
  itemList: { flex: 1 },
  itemListContent: { padding: spacing[4], gap: spacing[3] },
});
