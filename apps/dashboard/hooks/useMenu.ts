import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getGetMenuCategoriesQueryKey,
  getGetMenuItemsQueryKey,
  usePostMenuCategories,
  usePostMenuItems,
  putMenuCategoriesId,
  deleteMenuCategoriesId,
  putMenuItemsId,
  deleteMenuItemsId,
  patchMenuItemsIdAvailability,
} from '@repo/api-client'
import type {
  PutMenuCategoriesIdBody,
  PutMenuItemsIdBody,
  PatchMenuItemsIdAvailabilityBody,
} from '@repo/api-client'
import { useToast } from '@repo/ui'

export function useCreateCategory() {
  const qc = useQueryClient()
  const toast = useToast()
  return usePostMenuCategories({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetMenuCategoriesQueryKey() })
        toast.success('Category created')
      },
      onError: () => toast.error('Failed to create category'),
    },
  })
}

export function useUpdateCategory(id: string) {
  const qc = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: ({ data }: { data: PutMenuCategoriesIdBody }) => putMenuCategoriesId(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: getGetMenuCategoriesQueryKey() })
      toast.success('Category updated')
    },
    onError: () => toast.error('Failed to update category'),
  })
}

export function useDeleteCategory(id: string) {
  const qc = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: () => deleteMenuCategoriesId(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: getGetMenuCategoriesQueryKey() })
      toast.success('Category deleted')
    },
    onError: () => toast.error('Failed to delete category'),
  })
}

export function useCreateMenuItem() {
  const qc = useQueryClient()
  const toast = useToast()
  return usePostMenuItems({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetMenuItemsQueryKey() })
        toast.success('Menu item created')
      },
      onError: () => toast.error('Failed to create menu item'),
    },
  })
}

export function useUpdateMenuItemById() {
  const qc = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PutMenuItemsIdBody }) => putMenuItemsId(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: getGetMenuItemsQueryKey() })
      toast.success('Menu item updated')
    },
    onError: () => toast.error('Failed to update item'),
  })
}

export function useToggleAvailability(id: string) {
  const qc = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: ({ data }: { data: PatchMenuItemsIdAvailabilityBody }) =>
      patchMenuItemsIdAvailability(id, data),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: getGetMenuItemsQueryKey() })
      toast.success(data.isAvailable ? 'Item marked available' : 'Item marked unavailable')
    },
    onError: () => toast.error('Failed to update availability'),
  })
}

export function useDeleteMenuItemById() {
  const qc = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: (id: string) => deleteMenuItemsId(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: getGetMenuItemsQueryKey() })
      toast.success('Menu item deleted')
    },
    onError: () => toast.error('Failed to delete item'),
  })
}
