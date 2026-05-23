import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { Animated, StyleSheet, Text, View } from 'react-native'
import { fontSizes } from '../tokens/typography'
import { radius, spacing, shadows } from '../tokens/spacing'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  type: ToastType
  message: string
  duration?: number
}

interface ToastContextValue {
  show: (type: ToastType, message: string, duration?: number) => void
  success: (message: string) => void
  error: (message: string) => void
  warning: (message: string) => void
  info: (message: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const TOAST_STYLES: Record<ToastType, { bg: string; fg: string; icon: string }> = {
  success: { bg: '#f0fdf4', fg: '#15803d', icon: '✓' },
  error:   { bg: '#fef2f2', fg: '#b91c1c', icon: '✕' },
  warning: { bg: '#fffbeb', fg: '#b45309', icon: '!' },
  info:    { bg: '#eff6ff', fg: '#1d4ed8', icon: 'i' },
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const opacity = useRef(new Animated.Value(0)).current
  const { bg, fg, icon } = TOAST_STYLES[toast.type]

  useEffect(() => {
    Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(toast.duration ?? 3000),
      Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => onRemove(toast.id))
  }, [])

  return (
    <Animated.View style={[styles.toast, { backgroundColor: bg, opacity }]}>
      <View style={[styles.iconBadge, { backgroundColor: fg }]}>
        <Text style={styles.iconText}>{icon}</Text>
      </View>
      <Text style={[styles.message, { color: fg }]} numberOfLines={2}>
        {toast.message}
      </Text>
    </Animated.View>
  )
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const show = useCallback((type: ToastType, message: string, duration = 3000) => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { id, type, message, duration }])
  }, [])

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const value: ToastContextValue = {
    show,
    success: (msg) => show('success', msg),
    error: (msg) => show('error', msg),
    warning: (msg) => show('warning', msg),
    info: (msg) => show('info', msg),
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      <View style={styles.container} pointerEvents="none">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onRemove={remove} />
        ))}
      </View>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: spacing[8],
    left: spacing[4],
    right: spacing[4],
    alignItems: 'center',
    gap: spacing[2],
    zIndex: 9999,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderRadius: radius.lg,
    maxWidth: 480,
    width: '100%',
    ...shadows.md,
  },
  iconBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  message: { flex: 1, fontSize: fontSizes.sm, fontWeight: '500' },
})
