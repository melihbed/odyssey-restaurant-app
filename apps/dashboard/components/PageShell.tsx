import React from 'react'
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native'
import { colors, fontSizes, fontWeights, spacing } from '@repo/ui'

interface PageShellProps {
  title: string
  subtitle?: string
  headerRight?: React.ReactNode
  children: React.ReactNode
  scrollable?: boolean
  contentStyle?: StyleProp<ViewStyle>
}

export function PageShell({
  title,
  subtitle,
  headerRight,
  children,
  scrollable = true,
  contentStyle,
}: PageShellProps) {
  const header = (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {headerRight ? <View style={styles.headerRight}>{headerRight}</View> : null}
    </View>
  )

  if (scrollable) {
    return (
      <SafeAreaView style={styles.safe}>
        {header}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.content, contentStyle]}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safe}>
      {header}
      <View style={[styles.content, styles.flex, contentStyle]}>{children}</View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgDefault },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[5],
    paddingTop: Platform.OS === 'web' ? spacing[6] : spacing[4],
    paddingBottom: spacing[4],
    backgroundColor: colors.bgSurface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },
  headerLeft: { flex: 1 },
  headerRight: { marginLeft: spacing[4] },
  title: {
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.bold as any,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  scroll: { flex: 1 },
  content: { padding: spacing[5] },
  flex: { flex: 1 },
})
