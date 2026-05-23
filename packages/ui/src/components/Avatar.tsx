import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { initials } from '@repo/shared'
import { colors, palette } from '../tokens/colors'
import { fontWeights } from '../tokens/typography'
import { radius } from '../tokens/spacing'

const BG_COLORS = [
  palette.primary[100],
  '#ede9fe',
  '#fce7f3',
  '#d1fae5',
  '#fef3c7',
  '#fee2e2',
]

type AvatarSize = 'sm' | 'md' | 'lg'
const SIZE_VALUES = { sm: 28, md: 36, lg: 48 }
const FONT_SIZES = { sm: 11, md: 14, lg: 18 }

interface AvatarProps {
  name: string
  size?: AvatarSize
}

export function Avatar({ name, size = 'md' }: AvatarProps) {
  const dim = SIZE_VALUES[size]
  const fontSize = FONT_SIZES[size]
  const colorIndex = name.charCodeAt(0) % BG_COLORS.length
  const bg = BG_COLORS[colorIndex]!

  return (
    <View style={[styles.base, { width: dim, height: dim, borderRadius: dim / 2, backgroundColor: bg }]}>
      <Text style={[styles.label, { fontSize, color: colors.textPrimary }]}>
        {initials(name)}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center' },
  label: { fontWeight: fontWeights.semibold as any },
})
