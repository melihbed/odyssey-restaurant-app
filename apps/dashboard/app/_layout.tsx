import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import React from 'react'
import { ToastProvider } from '@repo/ui'
import { axiosInstance } from '@repo/api-client'

// Expo inlines EXPO_PUBLIC_* variables at build time only when they are read as
// process.env.EXPO_PUBLIC_NAME, so the API URL is set here in app code.
if (process.env.EXPO_PUBLIC_API_URL) {
  axiosInstance.defaults.baseURL = process.env.EXPO_PUBLIC_API_URL
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
})

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="design-system" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="auto" />
      </ToastProvider>
    </QueryClientProvider>
  )
}
