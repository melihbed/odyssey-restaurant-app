import React from 'react'
import {
  KeyboardAvoidingView,
  Modal as RNModal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native'
import { colors } from '../tokens/colors'
import { fontSizes, fontWeights } from '../tokens/typography'
import { radius, shadows, spacing } from '../tokens/spacing'
import { Button } from './Button'

interface ModalProps {
  visible: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  footer?: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
  scrollable?: boolean
  contentStyle?: StyleProp<ViewStyle>
}

const SIZES = { sm: 400, md: 520, lg: 680 }

export function AppModal({
  visible,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  scrollable = false,
  contentStyle,
}: ModalProps) {
  const maxWidth = SIZES[size]
  const content = scrollable ? (
    <ScrollView style={styles.scrollBody} contentContainerStyle={styles.scrollContent}>
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.body, contentStyle]}>{children}</View>
  )

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={[styles.container, { maxWidth }]}>
          {title ? (
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
              <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={8}>
                <Text style={styles.closeX}>✕</Text>
              </Pressable>
            </View>
          ) : null}
          {content}
          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </View>
      </KeyboardAvoidingView>
    </RNModal>
  )
}

export function ConfirmModal({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  variant = 'destructive',
  loading = false,
}: {
  visible: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel?: string
  variant?: 'primary' | 'destructive'
  loading?: boolean
}) {
  return (
    <AppModal visible={visible} onClose={onClose} title={title} size="sm">
      <Text style={styles.confirmMessage}>{message}</Text>
      <View style={styles.confirmActions}>
        <Button variant="secondary" onPress={onClose} style={styles.confirmBtn}>
          Cancel
        </Button>
        <Button variant={variant} onPress={onConfirm} loading={loading} style={styles.confirmBtn}>
          {confirmLabel}
        </Button>
      </View>
    </AppModal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[4],
  },
  container: {
    width: '100%',
    backgroundColor: colors.bgSurface,
    borderRadius: radius.xl,
    ...shadows.lg,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },
  title: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold as any,
    color: colors.textPrimary,
  },
  closeBtn: { padding: spacing[1] },
  closeX: { fontSize: fontSizes.md, color: colors.textSecondary },
  body: { padding: spacing[6] },
  scrollBody: { maxHeight: 480 },
  scrollContent: { padding: spacing[6] },
  footer: {
    padding: spacing[4],
    paddingTop: 0,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing[2],
  },
  confirmMessage: {
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    lineHeight: 22,
    paddingHorizontal: spacing[6],
    paddingTop: spacing[4],
  },
  confirmActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing[2],
    padding: spacing[6],
    paddingTop: spacing[4],
  },
  confirmBtn: { minWidth: 90 },
})
