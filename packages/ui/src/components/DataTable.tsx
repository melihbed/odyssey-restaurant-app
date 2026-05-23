import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { colors } from '../tokens/colors'
import { fontSizes, fontWeights } from '../tokens/typography'
import { radius, spacing } from '../tokens/spacing'
import { Skeleton } from './Skeleton'

export interface Column<T> {
  key: string
  header: string
  render?: (row: T) => React.ReactNode
  flex?: number
  align?: 'left' | 'right' | 'center'
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  keyExtractor: (item: T) => string
  loading?: boolean
  skeletonCount?: number
  emptyMessage?: string
  onRowPress?: (item: T) => void
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  keyExtractor,
  loading = false,
  skeletonCount = 5,
  emptyMessage = 'No data',
  onRowPress,
}: DataTableProps<T>) {
  return (
    <View style={styles.table}>
      {/* Header */}
      <View style={styles.header}>
        {columns.map((col) => (
          <Text
            key={col.key}
            style={[
              styles.headerCell,
              { flex: col.flex ?? 1 },
              col.align === 'right' ? styles.alignRight : col.align === 'center' ? styles.alignCenter : null,
            ]}
          >
            {col.header}
          </Text>
        ))}
      </View>

      {/* Body */}
      {loading ? (
        Array.from({ length: skeletonCount }, (_, i) => (
          <View key={i} style={[styles.row, i > 0 ? styles.rowBorder : null]}>
            {columns.map((col) => (
              <View key={col.key} style={{ flex: col.flex ?? 1, paddingHorizontal: spacing[1] }}>
                <Skeleton height={14} width="80%" />
              </View>
            ))}
          </View>
        ))
      ) : data.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>{emptyMessage}</Text>
        </View>
      ) : (
        data.map((item, i) => {
          const rowContent = (
            <>
              {columns.map((col) => (
                <View
                  key={col.key}
                  style={[
                    styles.cell,
                    { flex: col.flex ?? 1 },
                    col.align === 'right' ? styles.alignRight : col.align === 'center' ? styles.alignCenter : null,
                  ]}
                >
                  {col.render ? (
                    col.render(item)
                  ) : (
                    <Text style={styles.cellText} numberOfLines={1}>
                      {String(item[col.key] ?? '')}
                    </Text>
                  )}
                </View>
              ))}
            </>
          )

          return onRowPress ? (
            <Pressable
              key={keyExtractor(item)}
              style={({ pressed }) => [styles.row, i > 0 ? styles.rowBorder : null, pressed ? styles.rowPressed : null]}
              onPress={() => onRowPress(item)}
            >
              {rowContent}
            </Pressable>
          ) : (
            <View key={keyExtractor(item)} style={[styles.row, i > 0 ? styles.rowBorder : null]}>
              {rowContent}
            </View>
          )
        })
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  table: {
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.bgSurface,
  },
  header: {
    flexDirection: 'row',
    backgroundColor: colors.bgSubtle,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
  },
  headerCell: {
    fontSize: fontSizes.xs,
    fontWeight: '700',
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    backgroundColor: colors.bgSurface,
  },
  rowBorder: { borderTopWidth: 1, borderTopColor: colors.borderDefault },
  rowPressed: { backgroundColor: colors.bgSubtle },
  cell: { justifyContent: 'center' },
  cellText: { fontSize: fontSizes.sm, color: colors.textPrimary },
  alignRight: { alignItems: 'flex-end' },
  alignCenter: { alignItems: 'center' },
  empty: { paddingVertical: spacing[8], alignItems: 'center' },
  emptyText: { fontSize: fontSizes.sm, color: colors.textSecondary },
})
