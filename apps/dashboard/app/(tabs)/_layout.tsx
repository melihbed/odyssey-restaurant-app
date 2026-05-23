import { Tabs, usePathname, Link } from 'expo-router'
import React from 'react'
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { colors, spacing } from '@repo/ui'

const TAB_ITEMS = [
  { name: 'index', href: '/', label: 'Home', emoji: '🏠' },
  { name: 'orders/index', href: '/orders', label: 'Orders', emoji: '📋' },
  { name: 'crm/index', href: '/crm', label: 'CRM', emoji: '👥' },
  { name: 'menu/index', href: '/menu', label: 'Menu', emoji: '🍽️' },
  { name: 'settings', href: '/settings', label: 'Settings', emoji: '⚙️' },
] as const

function WebTabBar(_props: BottomTabBarProps) {
  const pathname = usePathname()

  return (
    <View style={webStyles.bar}>
      {TAB_ITEMS.map((tab) => {
        const active =
          tab.href === '/'
            ? pathname === '/'
            : pathname.startsWith(tab.href)
        return (
          <Link key={tab.name} href={tab.href as any} asChild>
            <Pressable style={webStyles.item}>
              <Text style={webStyles.emoji}>{tab.emoji}</Text>
              <Text style={[webStyles.label, active && webStyles.labelActive]}>
                {tab.label}
              </Text>
            </Pressable>
          </Link>
        )
      })}
    </View>
  )
}

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <View style={[styles.icon, focused ? styles.iconActive : null]}>
      <Text style={styles.emoji}>{emoji}</Text>
    </View>
  )
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={Platform.OS === 'web' ? (props) => <WebTabBar {...props} /> : undefined}
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: styles.tabLabel,
        tabBarShowLabel: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="orders/index"
        options={{
          title: 'Orders',
          tabBarIcon: ({ focused }) => <TabIcon emoji="📋" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="crm/index"
        options={{
          title: 'CRM',
          tabBarIcon: ({ focused }) => <TabIcon emoji="👥" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="menu/index"
        options={{
          title: 'Menu',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🍽️" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ focused }) => <TabIcon emoji="⚙️" focused={focused} />,
        }}
      />
      {/* Hidden from tab bar — accessible via link from Home or Settings */}
      <Tabs.Screen name="orders/[id]" options={{ href: null }} />
      <Tabs.Screen name="crm/[id]" options={{ href: null }} />
    </Tabs>
  )
}

const webStyles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.bgSurface,
    borderTopWidth: 1,
    borderTopColor: colors.borderDefault,
    height: 60,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  emoji: { fontSize: 18 },
  label: { fontSize: 11, fontWeight: '500', color: colors.textSecondary },
  labelActive: { color: colors.brand, fontWeight: '600' },
})

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.bgSurface,
    borderTopColor: colors.borderDefault,
    borderTopWidth: 1,
    paddingBottom: Platform.OS === 'ios' ? 0 : spacing[1],
    height: Platform.OS === 'ios' ? 82 : 60,
  },
  tabLabel: { fontSize: 11, fontWeight: '500' },
  icon: { padding: spacing[0.5] },
  iconActive: {},
  emoji: { fontSize: 20 },
})
