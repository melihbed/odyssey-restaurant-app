export const palette = {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  neutral: {
    0: '#ffffff',
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
  },
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
  },
  purple: {
    500: '#8b5cf6',
    600: '#7c3aed',
  },
} as const

export const colors = {
  // Backgrounds
  bgDefault: palette.neutral[50],
  bgSurface: palette.neutral[0],
  bgElevated: palette.neutral[0],
  bgSubtle: palette.neutral[100],
  bgMuted: palette.neutral[200],

  // Text
  textPrimary: palette.neutral[900],
  textSecondary: palette.neutral[500],
  textTertiary: palette.neutral[400],
  textInverse: palette.neutral[0],
  textLink: palette.primary[600],

  // Borders
  borderDefault: palette.neutral[200],
  borderStrong: palette.neutral[300],
  borderFocus: palette.primary[500],

  // Brand
  brand: palette.primary[600],
  brandLight: palette.primary[50],
  brandHover: palette.primary[700],

  // Semantic
  statusPending: palette.warning[500],
  statusAccepted: palette.primary[500],
  statusRejected: palette.error[500],
  statusPreparing: palette.purple[500],
  statusReady: palette.success[500],
  statusCompleted: palette.neutral[400],
  statusCancelled: palette.neutral[400],

  // States
  successFg: palette.success[700],
  successBg: palette.success[50],
  warningFg: palette.warning[700],
  warningBg: palette.warning[50],
  errorFg: palette.error[700],
  errorBg: palette.error[50],
} as const

export type ColorKey = keyof typeof colors
