import { Slot, Tabs, usePathname, Link } from 'expo-router'
import React from 'react'
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import { colors, fontSizes, spacing } from '@repo/ui'

const NAV_ITEMS = [
  { href: '/', label: 'Home', icon: '⌂' },
  { href: '/orders', label: 'Orders', icon: '≡' },
  { href: '/crm', label: 'Customers', icon: '◎' },
  { href: '/menu', label: 'Menu', icon: '✦' },
  { href: '/settings', label: 'Settings', icon: '◈' },
] as const


function Sidebar() {
  const pathname = usePathname()

  return (
    <View style={styles.sidebar}>
      {/* Brand */}
      <View style={styles.brand}>
        <View style={styles.logoMark}>
          <Text style={styles.logoText}>O</Text>
        </View>
        <View style={styles.brandLabels}>
          <Text style={styles.brandName}>Odyssey</Text>
          <Text style={styles.brandSub}>Operations</Text>
        </View>
      </View>

      {/* Navigation */}
      <View style={styles.nav}>
        <Text style={styles.navSection}>WORKSPACE</Text>
        {NAV_ITEMS.map(({ href, label, icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link key={href} href={href as any} asChild>
              <Pressable style={StyleSheet.flatten([styles.navItem, active ? styles.navItemActive : null])}>
                <View style={[styles.navIconWrap, active ? styles.navIconWrapActive : null]}>
                  <Text style={[styles.navIcon, active ? styles.navIconActive : null]}>{icon}</Text>
                </View>
                <Text style={StyleSheet.flatten([styles.navLabel, active ? styles.navLabelActive : null])}>
                  {label}
                </Text>
              </Pressable>
            </Link>
          )
        })}
      </View>

      {/* Footer */}
      <View style={styles.sidebarFooter}>
        <View style={styles.footerDivider} />
        <View style={styles.footerInfo}>
          <View style={[styles.statusDot, { backgroundColor: '#22c55e' }]} />
          <Text style={styles.footerText}>Service online</Text>
        </View>
      </View>
    </View>
  )
}

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <View style={[styles.tabIcon, focused ? styles.tabIconActive : null]}>
      <Text style={styles.tabEmoji}>{emoji}</Text>
    </View>
  )
}

export default function TabLayout() {
  if (Platform.OS === 'web') {
    return (
      <View style={styles.webLayout}>
        <Sidebar />
        <View style={styles.webContent}>
          <Slot />
        </View>
      </View>
    )
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: styles.tabLabel,
        tabBarShowLabel: true,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} /> }} />
      <Tabs.Screen name="orders/index" options={{ title: 'Orders', tabBarIcon: ({ focused }) => <TabIcon emoji="📋" focused={focused} /> }} />
      <Tabs.Screen name="crm/index" options={{ title: 'CRM', tabBarIcon: ({ focused }) => <TabIcon emoji="👥" focused={focused} /> }} />
      <Tabs.Screen name="menu/index" options={{ title: 'Menu', tabBarIcon: ({ focused }) => <TabIcon emoji="🍽️" focused={focused} /> }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings', tabBarIcon: ({ focused }) => <TabIcon emoji="⚙️" focused={focused} /> }} />
      <Tabs.Screen name="orders/[id]" options={{ href: null }} />
      <Tabs.Screen name="crm/[id]" options={{ href: null }} />
    </Tabs>
  )
}

const styles = StyleSheet.create({
  webLayout: { flex: 1, flexDirection: 'row', backgroundColor: colors.bgDefault },
  webContent: { flex: 1, overflow: 'hidden' },

  sidebar: {
    width: 240,
    backgroundColor: colors.bgSurface,
    borderRightWidth: 1,
    borderRightColor: colors.borderDefault,
    paddingTop: spacing[6],
    paddingBottom: spacing[4],
    justifyContent: 'space-between',
  },

  // Brand
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[6],
    marginBottom: spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },
  logoMark: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: { fontSize: 18, fontWeight: '800', color: '#fff' },
  brandLabels: { gap: 1 },
  brandName: { fontSize: fontSizes.md, fontWeight: '700', color: colors.textPrimary, letterSpacing: -0.2 },
  brandSub: { fontSize: 10, fontWeight: '500', color: colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.8 },

  // Nav
  nav: { flex: 1, paddingHorizontal: spacing[3], paddingTop: spacing[2] },
  navSection: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textTertiary,
    letterSpacing: 1,
    paddingHorizontal: spacing[3],
    marginBottom: spacing[1],
    marginTop: spacing[2],
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    borderRadius: 8,
    marginBottom: 2,
    gap: spacing[3],
  },
  navItemActive: { backgroundColor: colors.brandLight },
  navIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bgSubtle,
  },
  navIconWrapActive: { backgroundColor: colors.brand },
  navIcon: { fontSize: 13, color: colors.textSecondary },
  navIconActive: { color: '#fff' },
  navLabel: { fontSize: fontSizes.sm, color: colors.textSecondary, fontWeight: '500' },
  navLabelActive: { color: colors.brand, fontWeight: '600' },

  // Footer
  sidebarFooter: { paddingHorizontal: spacing[5] },
  footerDivider: { height: 1, backgroundColor: colors.borderDefault, marginBottom: spacing[3] },
  footerInfo: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  footerText: { fontSize: fontSizes.xs, color: colors.textTertiary, fontWeight: '500' },

  // Native tabs
  tabBar: {
    backgroundColor: colors.bgSurface,
    borderTopColor: colors.borderDefault,
    borderTopWidth: 1,
    paddingBottom: Platform.OS === 'ios' ? 0 : spacing[1],
    height: Platform.OS === 'ios' ? 82 : 60,
  },
  tabLabel: { fontSize: 11, fontWeight: '500' },
  tabIcon: { padding: spacing[0.5] },
  tabIconActive: {},
  tabEmoji: { fontSize: 20 },
})
