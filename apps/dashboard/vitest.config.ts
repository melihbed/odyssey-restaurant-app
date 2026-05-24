import { defineConfig } from 'vitest/config'
import type { Plugin } from 'vite'

const VIRTUAL_ID = '\0virtual:react-native'

// React Native ships Flow-annotated source that vite's SSR transformer cannot parse.
// This plugin intercepts every `import/require('react-native')` at the resolver level
// and returns an empty stub. The actual runtime mock is provided by vi.mock in
// vitest.setup.ts, which runs before any test module is evaluated.
const reactNativeStub: Plugin = {
  name: 'vitest:react-native-stub',
  enforce: 'pre',
  resolveId(id) {
    if (id === 'react-native') return { id: VIRTUAL_ID, moduleSideEffects: false }
  },
  load(id) {
    if (id !== VIRTUAL_ID) return
    // Minimal stub — vi.mock in setupFiles replaces this at runtime.
    return `export default {}; export const View=()=>null; export const Text=()=>null;
export const Pressable=()=>null; export const ActivityIndicator=()=>null;
export const StyleSheet={create:s=>s,flatten:s=>s,hairlineWidth:1};
export const Platform={OS:'web',select:s=>s.web??s.default};`
  },
}

export default defineConfig({
  plugins: [reactNativeStub],
  esbuild: {
    jsx: 'automatic',
  },
  test: {
    environment: 'jsdom',
    include: ['__tests__/**/*.{test,spec}.{ts,tsx}'],
    setupFiles: ['./vitest.setup.ts'],
    server: {
      deps: {
        inline: ['@repo/ui', '@repo/shared'],
      },
    },
  },
})
