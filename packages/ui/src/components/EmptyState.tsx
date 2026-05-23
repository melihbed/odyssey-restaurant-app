import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { colors } from '../tokens/colors'
import { fontSizes, fontWeights } from '../tokens/typography'
import { spacing } from '../tokens/spacing'
import { Button } from './Button'

interface EmptyStateProps {
  icon?: string
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({ icon = '📋', title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
      {actionLabel && onAction ? (
        <Button onPress={onAction} style={styles.action}>
          {actionLabel}
        </Button>
      ) : null}
    </View>
  )
}

export function ErrorState({
  title = 'Something went wrong',
  description,
  onRetry,
}: {
  title?: string
  description?: string
  onRetry?: () => void
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>⚠️</Text>
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
      {onRetry ? (
        <Button variant="secondary" onPress={onRetry} style={styles.action}>
          Try again
        </Button>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[8],
    gap: spacing[2],
  },
  icon: { fontSize: 40, marginBottom: spacing[2] },
  title: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold as any,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  description: {
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 320,
    lineHeight: 22,
  },
  action: { marginTop: spacing[3] },
})
