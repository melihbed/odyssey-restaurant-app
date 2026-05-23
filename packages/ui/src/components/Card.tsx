import React from "react";
import { StyleSheet, View, type ViewProps } from "react-native";
import { colors } from "../tokens/colors";
import { radius, shadows, spacing } from "../tokens/spacing";

type CardVariant = "default" | "outlined" | "elevated";

interface CardProps extends ViewProps {
  variant?: CardVariant;
  padding?: "none" | "sm" | "md" | "lg";
}

const PADDING = {
  none: 0,
  sm: spacing[3],
  md: spacing[4],
  lg: spacing[6],
} as const;

export function Card({
  variant = "default",
  padding = "md",
  children,
  style,
  ...props
}: CardProps) {
  return (
    <View
      style={StyleSheet.flatten([
        styles.base,
        variant === "elevated" ? shadows.md : null,
        variant === "outlined" ? styles.outlined : null,
        variant === "default" ? styles.default : null,
        { padding: PADDING[padding] },
        style,
      ])}
      {...props}
    >
      {children}
    </View>
  );
}
const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.bgSurface,
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  default: {
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
  outlined: {
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
});
