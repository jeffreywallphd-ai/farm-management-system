import { Pressable, StyleSheet, Text, View } from "react-native";

import { getThemedIconForText, ThemedIcon, type ThemedIconName } from "./ThemedIcon";
import { theme } from "../theme/theme";

export function Button({
  icon,
  label,
  onPress,
  trailingIcon,
  variant = "primary",
  size = "standard",
  disabled = false,
}: {
  icon?: ThemedIconName;
  label: string;
  onPress: () => void;
  trailingIcon?: ThemedIconName;
  variant?: "primary" | "secondary";
  size?: "standard" | "large" | "hero";
  disabled?: boolean;
}) {
  const iconColor = variant === "secondary" ? theme.colors.primary : theme.colors.onPrimary;
  const iconSize = size === "hero" ? 32 : size === "large" ? 26 : 22;
  const resolvedIcon = icon ?? getThemedIconForText(label, "leaf");
  const resolvedTrailingIcon = trailingIcon ?? "arrowRight";

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
      <View style={styles.content}>
        <ThemedIcon color={iconColor} name={resolvedIcon} size={iconSize} />
        <Text
          numberOfLines={2}
          style={[
            styles.label,
            size === "standard" ? styles.standardLabel : null,
            size === "large" ? styles.largeLabel : null,
            size === "hero" ? styles.heroLabel : null,
            variant === "secondary" ? styles.secondaryLabel : styles.primaryLabel,
          ]}
        >
          {label}
        </Text>
        {resolvedTrailingIcon ? <ThemedIcon color={iconColor} name={resolvedTrailingIcon} size={iconSize} /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    borderRadius: theme.radius.lg,
    minHeight: theme.spacing.primaryTouchTarget,
    justifyContent: "center",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  largeButton: {
    minHeight: theme.spacing.primaryTouchTarget,
    paddingVertical: theme.spacing.lg,
  },
  heroButton: {
    minHeight: 86,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
  },
  primary: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primaryPressed,
    borderWidth: 1,
    elevation: 2,
    shadowColor: "#0A1E15",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
  },
  primaryPressed: {
    backgroundColor: theme.colors.primaryPressed,
  },
  secondary: {
    backgroundColor: theme.colors.surfaceTint,
    borderColor: theme.colors.secondary,
    borderWidth: 1,
  },
  secondaryPressed: {
    backgroundColor: theme.colors.surfaceMuted,
  },
  disabled: {
    opacity: 0.55,
  },
  content: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.md,
    justifyContent: "center",
    width: "100%",
  },
  label: {
    flex: 1,
    flexShrink: 1,
    fontSize: theme.typography.body,
    fontWeight: "700",
    textAlign: "left",
  },
  standardLabel: {
    lineHeight: 20,
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
