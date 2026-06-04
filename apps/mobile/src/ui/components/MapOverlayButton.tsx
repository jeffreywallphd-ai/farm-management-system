import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from "react-native";

import { theme } from "../theme/theme";

export function MapOverlayButton({
  accessibilityLabel,
  disabled = false,
  label,
  onPress,
  style,
  variant = "primary",
}: {
  accessibilityLabel?: string;
  disabled?: boolean;
  label: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  variant?: "primary" | "secondary";
}) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === "secondary" ? styles.secondary : styles.primary,
        pressed && !disabled && (variant === "secondary" ? styles.secondaryPressed : styles.primaryPressed),
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text
        numberOfLines={2}
        style={[
          styles.label,
          variant === "secondary" ? styles.secondaryLabel : styles.primaryLabel,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function MapOverlayCloseButton({
  disabled = false,
  onPress,
}: {
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel="Close map"
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.closeButton,
        pressed && !disabled && styles.secondaryPressed,
        disabled && styles.disabled,
      ]}
    >
      <Text style={styles.closeLabel}>x</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    borderRadius: theme.radius.md,
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
  },
  primary: {
    backgroundColor: "rgba(47, 79, 62, 0.88)",
  },
  primaryPressed: {
    backgroundColor: "rgba(34, 59, 46, 0.92)",
  },
  secondary: {
    backgroundColor: "rgba(255, 252, 246, 0.78)",
    borderColor: "rgba(102, 122, 69, 0.8)",
    borderWidth: 1,
  },
  secondaryPressed: {
    backgroundColor: "rgba(230, 226, 213, 0.88)",
  },
  closeButton: {
    alignItems: "center",
    backgroundColor: "rgba(255, 252, 246, 0.72)",
    borderColor: "rgba(102, 122, 69, 0.8)",
    borderRadius: theme.radius.md,
    borderWidth: 1,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  disabled: {
    opacity: 0.55,
  },
  label: {
    fontSize: theme.typography.small,
    fontWeight: "800",
    lineHeight: 18,
    textAlign: "center",
  },
  primaryLabel: {
    color: theme.colors.onPrimary,
  },
  secondaryLabel: {
    color: theme.colors.primary,
  },
  closeLabel: {
    color: theme.colors.primary,
    fontSize: theme.typography.heading,
    fontWeight: "800",
    lineHeight: 24,
    textAlign: "center",
  },
});
