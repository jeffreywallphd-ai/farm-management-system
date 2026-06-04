import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { getSelectDropdownHint, type SelectSelectionMode } from "./SelectFieldModel";
import { theme } from "../theme/theme";

export interface SelectOption {
  label: string;
  value: string;
}

export function SelectField({
  label,
  options,
  value,
  onChange,
  error,
  selectionMode = "single",
}: {
  label: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  selectionMode?: SelectSelectionMode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((option) => option.value === value);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Pressable accessibilityRole="button" onPress={() => setIsOpen((current) => !current)} style={styles.dropdownButton}>
        <Text style={styles.dropdownText}>{selectedOption?.label ?? "Choose an option"}</Text>
        <Text style={styles.dropdownHint}>{getSelectDropdownHint(isOpen, selectionMode)}</Text>
      </Pressable>
      {isOpen ? (
        <View style={styles.options}>
          {options.map((option) => {
            const isSelected = option.value === value;

            return (
              <Pressable
                accessibilityRole="button"
                key={option.value}
                onPress={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                style={[styles.option, isSelected ? styles.selectedOption : null]}
              >
                <Text style={[styles.optionText, isSelected ? styles.selectedOptionText : null]}>
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
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
  dropdownButton: {
    backgroundColor: theme.colors.dropdownSurface,
    borderColor: theme.colors.dropdownBorder,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    gap: theme.spacing.xs,
    justifyContent: "center",
    minHeight: theme.spacing.primaryTouchTarget,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  dropdownHint: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small,
    lineHeight: 20,
  },
  dropdownText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body,
    fontWeight: "700",
  },
  options: {
    gap: theme.spacing.sm,
  },
  option: {
    backgroundColor: theme.colors.dropdownSurface,
    borderColor: theme.colors.dropdownBorder,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: theme.spacing.primaryTouchTarget,
    padding: theme.spacing.md,
  },
  selectedOption: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accentPressed,
  },
  optionText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body,
    fontWeight: "700",
  },
  selectedOptionText: {
    color: theme.colors.onAccent,
  },
  error: {
    color: theme.colors.error,
    fontSize: theme.typography.small,
    lineHeight: 20,
  },
});
