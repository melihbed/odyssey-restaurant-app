import { vi, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import React from 'react'

// @testing-library/react does not auto-cleanup in vitest without this hook.
afterEach(cleanup)

// Strip props that are React Native-specific and invalid on DOM elements
// (RN-style arrays, accessibilityRole, etc.). Tests only care about
// behavior (text content, click events, disabled state), not visual styles.
const domProps = ({ style, accessibilityRole, accessibilityLabel, accessible, testID, ...rest }: any) => ({
  'data-testid': testID,
  ...rest,
})

// React Native 0.85+ ships Flow-annotated source that vite's SSR transformer
// cannot parse. We stub the module at the vite resolver level (vitest.config.ts)
// and replace it at runtime here with lightweight DOM equivalents so
// @testing-library/react can query rendered output.
vi.mock('react-native', () => ({
  View: ({ children, ...rest }: any) =>
    React.createElement('div', domProps(rest), children),

  Text: ({ children, ...rest }: any) =>
    React.createElement('span', domProps(rest), children),

  Pressable: ({ children, onPress, disabled, style, ...rest }: any) =>
    React.createElement('button', { onClick: onPress, disabled, ...domProps(rest) }, children),

  ActivityIndicator: ({ ...rest }: any) =>
    React.createElement('div', { role: 'status', 'aria-label': 'Loading', ...domProps(rest) }),

  StyleSheet: {
    create: <T extends Record<string, any>>(styles: T): T => styles,
    flatten: (style: any) => style,
    hairlineWidth: 1,
  },

  Platform: {
    OS: 'web' as const,
    select: (spec: any) => spec.web ?? spec.default,
  },
}))
