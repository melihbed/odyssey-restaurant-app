import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getGetOrdersQueryKey,
  getGetOrdersIdQueryKey,
  postOrdersIdActions,
} from '@repo/api-client'
import type { PostOrdersIdActionsBody } from '@repo/api-client'
import { useToast } from '@repo/ui'

export function useOrderAction(id: string) {
  const qc = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: ({ data }: { data: PostOrdersIdActionsBody }) => postOrdersIdActions(id, data),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: getGetOrdersQueryKey() })
      qc.invalidateQueries({ queryKey: getGetOrdersIdQueryKey(id) })
      toast.success(`Order updated to ${data.status}`)
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'Action failed')
    },
  })
}
