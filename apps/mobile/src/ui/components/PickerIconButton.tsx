import { Pressable, StyleSheet } from "react-native";

import { ThemedIcon } from "./ThemedIcon";
import { useUiDensity } from "../theme/UiDensity";
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
  const density = useUiDensity();
  const buttonSize = density.isUngloved ? 44 : theme.spacing.touchTarget;

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          minHeight: buttonSize,
          minWidth: buttonSize,
          padding: density.isUngloved ? theme.spacing.sm : theme.spacing.md,
        },
        pressed ? styles.pressed : null,
      ]}
    >
      <ThemedIcon color={theme.colors.primary} name={icon} size={density.isUngloved ? 22 : 28} />
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
  },
  pressed: {
    backgroundColor: theme.colors.surfaceMuted,
  },
});
