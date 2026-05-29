import { Pressable, StyleSheet, Text } from "react-native";

import { theme } from "../theme/theme";

export function Button({
  label,
  onPress,
  variant = "primary",
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === "secondary" ? styles.secondary : styles.primary,
        pressed && !disabled && (variant === "secondary" ? styles.secondaryPressed : styles.primaryPressed),
        disabled && styles.disabled,
      ]}
    >
      <Text style={[styles.label, variant === "secondary" ? styles.secondaryLabel : styles.primaryLabel]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    borderRadius: theme.radius.md,
    minHeight: 48,
    justifyContent: "center",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
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
  },
  primaryLabel: {
    color: theme.colors.onPrimary,
  },
  secondaryLabel: {
    color: theme.colors.primary,
  },
});
