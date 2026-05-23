import React, { useState } from 'react'
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native'
import { colors } from '../tokens/colors'
import { fontSizes } from '../tokens/typography'
import { radius, spacing } from '../tokens/spacing'

interface InputProps extends TextInputProps {
  label?: string
  error?: string
  hint?: string
  containerStyle?: StyleProp<ViewStyle>
}

export function Input({ label, error, hint, containerStyle, style, ...props }: InputProps) {
  const [focused, setFocused] = useState(false)

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        style={[
          styles.input,
          focused ? styles.inputFocused : null,
          // outlineStyle is web-only; suppress browser default focus ring
          focused ? ({ outlineStyle: 'none' } as object) : null,
          error ? styles.inputError : null,
          props.multiline ? styles.inputMultiline : null,
          style,
        ]}
        placeholderTextColor={colors.textTertiary}
        onFocus={(e) => {
          setFocused(true)
          props.onFocus?.(e)
        }}
        onBlur={(e) => {
          setFocused(false)
          props.onBlur?.(e)
        }}
        {...props}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {!error && hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { gap: spacing[1] },
  label: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    fontWeight: '500',
    marginBottom: spacing[0.5],
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.md,
    paddingHorizontal: spacing[3],
    fontSize: fontSizes.md,
    color: colors.textPrimary,
    backgroundColor: colors.bgSurface,
  },
  inputFocused: {
    borderColor: colors.borderFocus,
  },
  inputError: { borderColor: '#ef4444' },
  inputMultiline: {
    height: 100,
    paddingTop: spacing[2],
    paddingBottom: spacing[2],
    textAlignVertical: 'top',
  },
  error: { fontSize: fontSizes.xs, color: '#ef4444' },
  hint: { fontSize: fontSizes.xs, color: colors.textTertiary },
})
