import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { colors, fontSizes, fontWeights, spacing } from '@repo/ui'

interface SectionHeaderProps {
  title: string
  right?: React.ReactNode
}

export function SectionHeader({ title, right }: SectionHeaderProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {right}
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[3],
  },
  title: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold as any,
    color: colors.textPrimary,
  },
})
