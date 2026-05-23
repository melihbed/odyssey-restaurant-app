import React from 'react'
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
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
      <View style={styles.headerInner}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {headerRight ? <View style={styles.headerRight}>{headerRight}</View> : null}
      </View>
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
      <View style={[styles.flex, contentStyle]}>{children}</View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgDefault },
  header: {
    backgroundColor: colors.bgSurface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },
  headerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[6],
    paddingTop: Platform.OS === 'web' ? spacing[5] : spacing[4],
    paddingBottom: spacing[4],
    maxWidth: Platform.OS === 'web' ? 1280 : undefined,
    width: '100%',
    alignSelf: Platform.OS === 'web' ? 'auto' : undefined,
  },
  headerLeft: { flex: 1 },
  headerRight: { marginLeft: spacing[4] },
  title: {
    fontSize: Platform.OS === 'web' ? fontSizes['2xl'] : fontSizes.xl,
    fontWeight: fontWeights.bold as any,
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  scroll: { flex: 1 },
  content: { padding: spacing[6] },
  flex: { flex: 1 },
})
