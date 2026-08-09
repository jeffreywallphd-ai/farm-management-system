import { useState } from "react";
import { Modal, StyleSheet, Text, View } from "react-native";

import { theme } from "../theme/theme";
import { Button } from "./Button";
import { PickerIconButton } from "./PickerIconButton";
import { SelectField } from "./SelectField";
import { useUiDensity } from "../theme/UiDensity";
import {
  defaultTimeParts,
  formatTimeDisplay,
  formatTimeInput,
  minuteOptionsFor,
  parseTimeInput,
  TIME_PICKER_HOURS,
  TIME_PICKER_MERIDIEMS,
  type TimeMeridiem,
  type TimePickerParts,
} from "./TimeFieldModel";

export function TimeField({
  label,
  value,
  onChangeText,
  error,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  error?: string;
}) {
  const density = useUiDensity();
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [draftParts, setDraftParts] = useState<TimePickerParts>(() => parseTimeInput(value) ?? defaultTimeParts());

  function openPicker() {
    setDraftParts(parseTimeInput(value) ?? defaultTimeParts());
    setIsPickerOpen(true);
  }

  function updateDraft(changes: Partial<TimePickerParts>) {
    setDraftParts((current) => ({ ...current, ...changes }));
  }

  function applyTime() {
    onChangeText(formatTimeInput(draftParts));
    setIsPickerOpen(false);
  }

  return (
    <View style={[styles.container, { gap: density.fieldGap }]}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputRow, { gap: density.fieldGap }]}>
        <View
          style={[
            styles.displayField,
            {
              minHeight: density.inputMinHeight,
              paddingHorizontal: density.inputPaddingHorizontal,
              paddingVertical: density.inputPaddingVertical,
            },
            error ? styles.inputError : null,
          ]}
        >
          <Text style={[styles.displayText, density.isUngloved ? styles.compactDisplayText : null]}>{formatTimeDisplay(value)}</Text>
        </View>
        <PickerIconButton accessibilityLabel={`Pick ${label}`} icon="clock" onPress={openPicker} />
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Modal animationType="fade" onRequestClose={() => setIsPickerOpen(false)} transparent visible={isPickerOpen}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { gap: density.contentGap, padding: density.isUngloved ? theme.spacing.md : theme.spacing.lg }]}>
            <Text style={styles.modalTitle}>{label}</Text>
            <View style={styles.pickerGrid}>
              <SelectField
                label="Hour"
                onChange={(nextHour) => updateDraft({ hour: nextHour })}
                options={TIME_PICKER_HOURS.map((hour) => ({ label: hour, value: hour }))}
                value={draftParts.hour}
              />
              <SelectField
                label="Minute"
                onChange={(nextMinute) => updateDraft({ minute: nextMinute })}
                options={minuteOptionsFor(value).map((minute) => ({ label: minute, value: minute }))}
                value={draftParts.minute}
              />
              <SelectField
                label="AM or PM"
                onChange={(nextMeridiem) => updateDraft({ meridiem: nextMeridiem as TimeMeridiem })}
                options={TIME_PICKER_MERIDIEMS.map((meridiem) => ({ label: meridiem, value: meridiem }))}
                value={draftParts.meridiem}
              />
            </View>
            <View style={styles.modalActions}>
              <Button label="Cancel" onPress={() => setIsPickerOpen(false)} size="large" variant="secondary" />
              <Button label="Use time" onPress={applyTime} size="large" />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
  },
  label: {
    color: theme.colors.primary,
    fontSize: theme.typography.small,
    fontWeight: "700",
  },
  inputRow: {
    alignItems: "center",
    flexDirection: "row",
  },
  displayField: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
  },
  displayText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body,
    fontWeight: "700",
  },
  compactDisplayText: {
    fontSize: theme.typography.caption,
    lineHeight: 16,
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
    borderRadius: theme.radius.lg,
    borderWidth: 1,
  },
  modalTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.headingFontFamily,
    fontSize: theme.typography.section,
    fontWeight: theme.typography.headingFontWeight,
    lineHeight: 26,
  },
  pickerGrid: {
    gap: theme.spacing.sm,
  },
  modalActions: {
    gap: theme.spacing.sm,
  },
});
