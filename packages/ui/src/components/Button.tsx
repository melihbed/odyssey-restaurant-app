import React from 'react'
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native'
import { colors } from '../tokens/colors'
import { fontSizes, fontWeights } from '../tokens/typography'
import { radius, spacing } from '../tokens/spacing'

type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends Omit<PressableProps, 'style'> {
  variant?: Variant
  size?: Size
  loading?: boolean
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
  fullWidth?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  style,
  fullWidth = false,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading

  return (
    <Pressable
      disabled={isDisabled}
      style={(state) => {
        const { pressed } = state
        const hovered = (state as unknown as { hovered?: boolean }).hovered
        return [
          styles.base,
          styles[`size_${size}`],
          styles[`variant_${variant}`],
          pressed ? styles[`variant_${variant}_pressed`] : null,
          hovered ? styles[`variant_${variant}_hover`] : null,
          isDisabled ? styles.disabled : null,
          fullWidth ? styles.fullWidth : null,
          style,
        ]
      }}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' || variant === 'destructive' ? '#fff' : colors.brand}
        />
      ) : (
        <Text style={[styles.label, styles[`label_${variant}`], styles[`label_${size}`]]}>
          {children}
        </Text>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  fullWidth: { width: '100%' },
  disabled: { opacity: 0.45 },

  size_sm: { paddingHorizontal: spacing[3], paddingVertical: spacing[1.5], minHeight: 32 },
  size_md: { paddingHorizontal: spacing[4], paddingVertical: spacing[2], minHeight: 40 },
  size_lg: { paddingHorizontal: spacing[6], paddingVertical: spacing[3], minHeight: 48 },

  variant_primary: { backgroundColor: colors.brand, borderColor: colors.brand },
  variant_primary_hover: { backgroundColor: colors.brandHover },
  variant_primary_pressed: { backgroundColor: colors.brandHover },

  variant_secondary: { backgroundColor: colors.bgSurface, borderColor: colors.borderDefault },
  variant_secondary_hover: { backgroundColor: colors.bgSubtle },
  variant_secondary_pressed: { backgroundColor: colors.bgSubtle },

  variant_ghost: { backgroundColor: 'transparent', borderColor: 'transparent' },
  variant_ghost_hover: { backgroundColor: colors.bgSubtle },
  variant_ghost_pressed: { backgroundColor: colors.bgSubtle },

  variant_destructive: { backgroundColor: '#ef4444', borderColor: '#ef4444' },
  variant_destructive_hover: { backgroundColor: '#dc2626' },
  variant_destructive_pressed: { backgroundColor: '#dc2626' },

  label: { fontWeight: fontWeights.medium as any },
  label_sm: { fontSize: fontSizes.sm },
  label_md: { fontSize: fontSizes.md },
  label_lg: { fontSize: fontSizes.lg },

  label_primary: { color: '#ffffff' },
  label_secondary: { color: colors.textPrimary },
  label_ghost: { color: colors.textPrimary },
  label_destructive: { color: '#ffffff' },
})
