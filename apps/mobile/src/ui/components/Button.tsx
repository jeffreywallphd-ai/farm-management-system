import { Pressable, StyleSheet, Text } from "react-native";

import { theme } from "../theme/theme";

export function Button({
  label,
  onPress,
  variant = "primary",
  size = "standard",
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
  size?: "standard" | "large" | "hero";
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        size === "large" ? styles.largeButton : null,
        size === "hero" ? styles.heroButton : null,
        variant === "secondary" ? styles.secondary : styles.primary,
        pressed && !disabled && (variant === "secondary" ? styles.secondaryPressed : styles.primaryPressed),
        disabled && styles.disabled,
      ]}
    >
      <Text
        style={[
          styles.label,
          size === "large" ? styles.largeLabel : null,
          size === "hero" ? styles.heroLabel : null,
          variant === "secondary" ? styles.secondaryLabel : styles.primaryLabel,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    borderRadius: theme.radius.md,
    minHeight: theme.spacing.touchTarget,
    justifyContent: "center",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  largeButton: {
    minHeight: theme.spacing.primaryTouchTarget,
    paddingVertical: theme.spacing.lg,
  },
  heroButton: {
    minHeight: 112,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.xl,
  },
  primary: {
    backgroundColor: theme.colors.primary,
  },
  primaryPressed: {
    backgroundColor: theme.colors.primaryPressed,
  },
  secondary: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.secondary,
    borderWidth: 1,
  },
  secondaryPressed: {
    backgroundColor: theme.colors.surfaceMuted,
  },
  disabled: {
    opacity: 0.55,
  },
  label: {
    fontSize: theme.typography.body,
    fontWeight: "700",
    textAlign: "center",
  },
  largeLabel: {
    fontSize: theme.typography.section,
  },
  heroLabel: {
    fontSize: theme.typography.heading,
  },
  primaryLabel: {
    color: theme.colors.onPrimary,
  },
  secondaryLabel: {
    color: theme.colors.primary,
  },
});
