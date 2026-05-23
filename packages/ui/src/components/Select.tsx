import React, { useState } from 'react'
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { colors } from '../tokens/colors'
import { fontSizes } from '../tokens/typography'
import { radius, spacing, shadows } from '../tokens/spacing'

export interface SelectOption<T = string> {
  label: string
  value: T
  description?: string
}

interface SelectProps<T = string> {
  label?: string
  placeholder?: string
  options: SelectOption<T>[]
  value?: T
  onChange: (value: T) => void
  error?: string
}

export function Select<T = string>({
  label,
  placeholder = 'Select an option',
  options,
  value,
  onChange,
  error,
}: SelectProps<T>) {
  const [open, setOpen] = useState(false)
  const selected = options.find((o) => o.value === value)

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Pressable
        style={[styles.trigger, error ? styles.triggerError : null]}
        onPress={() => setOpen(true)}
      >
        <Text style={selected ? styles.value : styles.placeholder}>
          {selected ? selected.label : placeholder}
        </Text>
        <Text style={styles.chevron}>▾</Text>
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={styles.dropdown}>
            <ScrollView>
              {options.map((option, i) => (
                <Pressable
                  key={String(option.value)}
                  style={[
                    styles.option,
                    option.value === value ? styles.optionSelected : null,
                    i < options.length - 1 ? styles.optionBorder : null,
                  ]}
                  onPress={() => {
                    onChange(option.value)
                    setOpen(false)
                  }}
                >
                  <Text
                    style={[styles.optionLabel, option.value === value ? styles.optionLabelSelected : null]}
                  >
                    {option.label}
                  </Text>
                  {option.description ? (
                    <Text style={styles.optionDesc}>{option.description}</Text>
                  ) : null}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { gap: spacing[1] },
  label: { fontSize: fontSizes.sm, color: colors.textSecondary, fontWeight: '500' },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 40,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.md,
    paddingHorizontal: spacing[3],
    backgroundColor: colors.bgSurface,
  },
  triggerError: { borderColor: '#ef4444' },
  value: { fontSize: fontSizes.md, color: colors.textPrimary },
  placeholder: { fontSize: fontSizes.md, color: colors.textTertiary },
  chevron: { color: colors.textSecondary },
  error: { fontSize: fontSizes.xs, color: '#ef4444' },

  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[4],
  },
  dropdown: {
    backgroundColor: colors.bgSurface,
    borderRadius: radius.lg,
    width: '100%',
    maxHeight: 320,
    ...shadows.lg,
  },
  option: { paddingHorizontal: spacing[4], paddingVertical: spacing[3] },
  optionBorder: { borderBottomWidth: 1, borderBottomColor: colors.borderDefault },
  optionSelected: { backgroundColor: colors.brandLight },
  optionLabel: { fontSize: fontSizes.md, color: colors.textPrimary },
  optionLabelSelected: { color: colors.brand, fontWeight: '600' },
  optionDesc: { fontSize: fontSizes.sm, color: colors.textSecondary, marginTop: 2 },
})
