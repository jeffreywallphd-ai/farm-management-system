import { useMemo, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { theme } from "../theme/theme";
import { Button } from "./Button";
import { PickerIconButton } from "./PickerIconButton";
import { useDatePreferences } from "../datePreferences";
import { buildCalendarWeeks, monthTitle, parseDateInput, shiftMonth, weekdayLabels } from "./DateFieldModel";

export function DateField({
  label,
  value,
  onChangeText,
  error,
  placeholder = "YYYY-MM-DD",
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  error?: string;
  placeholder?: string;
}) {
  const { weekStartsOn } = useDatePreferences();
  const initialDate = parseDateInput(value) ?? new Date();
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState({ year: initialDate.getFullYear(), month: initialDate.getMonth() });
  const selectedDate = parseDateInput(value);
  const days = useMemo(() => buildCalendarWeeks(visibleMonth.year, visibleMonth.month, new Date(), weekStartsOn), [visibleMonth.month, visibleMonth.year, weekStartsOn]);
  const weekdays = useMemo(() => weekdayLabels(weekStartsOn), [weekStartsOn]);

  function openPicker() {
    const nextDate = parseDateInput(value) ?? new Date();
    setVisibleMonth({ year: nextDate.getFullYear(), month: nextDate.getMonth() });
    setIsPickerOpen(true);
  }

  function moveMonth(offset: number) {
    setVisibleMonth((current) => shiftMonth(current.year, current.month, offset));
  }

  function chooseDate(date: string) {
    onChangeText(date);
    setIsPickerOpen(false);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputRow}>
        <TextInput
          accessibilityLabel={label}
          keyboardType="numbers-and-punctuation"
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textSecondary}
          returnKeyType="done"
          style={[styles.input, error ? styles.inputError : null]}
          value={value}
        />
        <PickerIconButton accessibilityLabel={`Pick ${label}`} icon="calendar" onPress={openPicker} />
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Modal animationType="fade" onRequestClose={() => setIsPickerOpen(false)} transparent visible={isPickerOpen}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Button label="Previous" onPress={() => moveMonth(-1)} size="large" variant="secondary" />
              <Text style={styles.monthTitle}>{monthTitle(visibleMonth.year, visibleMonth.month)}</Text>
              <Button label="Next" onPress={() => moveMonth(1)} size="large" variant="secondary" />
            </View>
            <View style={styles.weekdayGrid}>
              {weekdays.map((day, index) => (
                <Text key={`${day}-${index}`} style={styles.weekday}>
                  {day}
                </Text>
              ))}
            </View>
            <View style={styles.dayGrid}>
              {days.map((day) => {
                const isSelected = selectedDate ? day.date === value : false;
                return (
                  <Pressable
                    accessibilityLabel={day.date}
                    accessibilityRole="button"
                    key={day.date}
                    onPress={() => chooseDate(day.date)}
                    style={({ pressed }) => [
                      styles.dayButton,
                      !day.isCurrentMonth ? styles.outsideMonth : null,
                      day.isToday ? styles.today : null,
                      isSelected ? styles.selectedDay : null,
                      pressed ? styles.pressedDay : null,
                    ]}
                  >
                    <Text style={[styles.dayText, isSelected ? styles.selectedDayText : null]}>{day.day}</Text>
                  </Pressable>
                );
              })}
            </View>
            <View style={styles.modalActions}>
              <Button label="Clear" onPress={() => onChangeText("")} size="large" variant="secondary" />
              <Button label="Close" onPress={() => setIsPickerOpen(false)} size="large" />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.sm,
  },
  label: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.small,
    fontWeight: "700",
  },
  inputRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body,
    flex: 1,
    minHeight: theme.spacing.touchTarget,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  error: {
    color: theme.colors.error,
    fontSize: theme.typography.small,
    lineHeight: 20,
  },
  modalBackdrop: {
    backgroundColor: "rgba(48, 42, 36, 0.45)",
    flex: 1,
    justifyContent: "center",
    padding: theme.spacing.lg,
  },
  modalCard: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
  },
  modalHeader: {
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  monthTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.section,
    fontWeight: "700",
    textAlign: "center",
  },
  weekdayGrid: {
    flexDirection: "row",
  },
  weekday: {
    color: theme.colors.textSecondary,
    flex: 1,
    fontSize: theme.typography.small,
    fontWeight: "700",
    textAlign: "center",
  },
  dayGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayButton: {
    alignItems: "center",
    borderRadius: theme.radius.sm,
    justifyContent: "center",
    minHeight: 48,
    width: `${100 / 7}%`,
  },
  outsideMonth: {
    opacity: 0.38,
  },
  today: {
    borderColor: theme.colors.secondary,
    borderWidth: 1,
  },
  selectedDay: {
    backgroundColor: theme.colors.primary,
  },
  pressedDay: {
    backgroundColor: theme.colors.surfaceMuted,
  },
  dayText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body,
    fontWeight: "700",
  },
  selectedDayText: {
    color: theme.colors.onPrimary,
  },
  modalActions: {
    gap: theme.spacing.sm,
  },
});
