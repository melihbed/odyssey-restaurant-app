import { useQueryClient } from '@tanstack/react-query'
import { getGetSettingsQueryKey, usePutSettings } from '@repo/api-client'
import { useToast } from '@repo/ui'

export function useUpdateSettings() {
  const qc = useQueryClient()
  const toast = useToast()
  return usePutSettings({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetSettingsQueryKey() })
        toast.success('Settings saved')
      },
      onError: () => toast.error('Failed to save settings'),
    },
  })
}
