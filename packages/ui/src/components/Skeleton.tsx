import React, { useEffect, useRef } from 'react'
import { Animated, StyleSheet, View, type ViewStyle, type StyleProp } from 'react-native'
import { radius } from '../tokens/spacing'

interface SkeletonProps {
  width?: number | `${number}%`
  height?: number
  borderRadius?: number
  style?: StyleProp<ViewStyle>
}

export function Skeleton({ width, height = 16, borderRadius = radius.sm, style }: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.4)).current

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    )
    animation.start()
    return () => animation.stop()
  }, [opacity])

  return (
    <Animated.View
      style={[
        styles.base,
        { width: width ?? '100%', height, borderRadius, opacity },
        style,
      ]}
    />
  )
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <View style={styles.textBlock}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={i}
          height={14}
          width={i === lines - 1 ? '60%' : '100%'}
          style={{ marginBottom: 8 }}
        />
      ))}
    </View>
  )
}

export function SkeletonCard() {
  return (
    <View style={styles.card}>
      <Skeleton height={20} width={160} style={{ marginBottom: 8 }} />
      <SkeletonText lines={2} />
    </View>
  )
}

const styles = StyleSheet.create({
  base: { backgroundColor: '#e2e8f0' },
  textBlock: {},
  card: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: radius.lg,
    backgroundColor: '#ffffff',
  },
})
