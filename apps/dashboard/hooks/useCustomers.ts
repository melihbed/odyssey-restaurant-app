import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getGetCustomersQueryKey,
  usePostCustomers,
  putCustomersId,
} from '@repo/api-client'
import type { PutCustomersIdBody } from '@repo/api-client'
import { useToast } from '@repo/ui'

export function useCreateCustomer() {
  const qc = useQueryClient()
  const toast = useToast()
  return usePostCustomers({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetCustomersQueryKey() })
        toast.success('Customer created')
      },
      onError: () => toast.error('Failed to create customer'),
    },
  })
}

export function useUpdateCustomer(id: string) {
  const qc = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: ({ data }: { data: PutCustomersIdBody }) => putCustomersId(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: getGetCustomersQueryKey() })
      toast.success('Customer updated')
    },
    onError: () => toast.error('Failed to update customer'),
  })
}
