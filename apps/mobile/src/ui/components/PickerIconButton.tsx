import { Pressable, StyleSheet, View } from "react-native";

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
      {icon === "calendar" ? <CalendarGlyph /> : <ClockGlyph />}
    </Pressable>
  );
}

function CalendarGlyph() {
  return (
    <View style={styles.calendarOuter}>
      <View style={styles.calendarTop} />
      <View style={styles.calendarGrid}>
        <View style={styles.calendarDot} />
        <View style={styles.calendarDot} />
        <View style={styles.calendarDot} />
        <View style={styles.calendarDot} />
      </View>
    </View>
  );
}

function ClockGlyph() {
  return (
    <View style={styles.clockOuter}>
      <View style={styles.clockHourHand} />
      <View style={styles.clockMinuteHand} />
    </View>
  );
}

const iconColor = theme.colors.primary;

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.secondary,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: theme.spacing.touchTarget,
    minWidth: theme.spacing.touchTarget,
    padding: theme.spacing.md,
  },
  pressed: {
    backgroundColor: theme.colors.surfaceMuted,
  },
  calendarOuter: {
    borderColor: iconColor,
    borderRadius: 3,
    borderWidth: 2,
    height: 24,
    overflow: "hidden",
    width: 24,
  },
  calendarTop: {
    backgroundColor: iconColor,
    height: 6,
    width: "100%",
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    padding: 4,
  },
  calendarDot: {
    backgroundColor: iconColor,
    borderRadius: 2,
    height: 4,
    width: 4,
  },
  clockOuter: {
    alignItems: "center",
    borderColor: iconColor,
    borderRadius: 12,
    borderWidth: 2,
    height: 24,
    justifyContent: "center",
    width: 24,
  },
  clockHourHand: {
    backgroundColor: iconColor,
    height: 8,
    left: 10,
    position: "absolute",
    top: 5,
    width: 2,
  },
  clockMinuteHand: {
    backgroundColor: iconColor,
    height: 2,
    left: 10,
    position: "absolute",
    top: 12,
    width: 7,
  },
});
