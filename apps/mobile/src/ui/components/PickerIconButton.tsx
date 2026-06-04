import { Pressable, StyleSheet } from "react-native";

import { ThemedIcon } from "./ThemedIcon";
import { theme } from "../theme/theme";

export type PickerIconName = "calendar" | "clock";

export function PickerIconButton({
  accessibilityLabel,
  icon,
  onPress,
}: {
  accessibilityLabel: string;
  icon: PickerIconName;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed ? styles.pressed : null]}
    >
      <ThemedIcon color={theme.colors.primary} name={icon} size={28} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    backgroundColor: theme.colors.surfaceTint,
    borderColor: theme.colors.secondary,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: theme.spacing.touchTarget,
    minWidth: theme.spacing.touchTarget,
    padding: theme.spacing.md,
  },
  pressed: {
    backgroundColor: theme.colors.surfaceMuted,
  },
});
