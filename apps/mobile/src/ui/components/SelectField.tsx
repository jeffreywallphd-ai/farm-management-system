import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { formatGridOptionLabel, getSelectDropdownHint, getSelectOptionLayout, type SelectOptionLayout, type SelectSelectionMode } from "./SelectFieldModel";
import { getThemedIconForText, ThemedIcon, type ThemedIconName } from "./ThemedIcon";
import { theme } from "../theme/theme";

export interface SelectOption {
  icon?: ThemedIconName;
  label: string;
  value: string;
}

export function SelectField({
  label,
  options,
  value,
  onChange,
  error,
  optionLayout,
  selectionMode = "single",
}: {
  label: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  optionLayout?: SelectOptionLayout;
  selectionMode?: SelectSelectionMode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((option) => option.value === value);
  const resolvedOptionLayout = optionLayout ?? getSelectOptionLayout(label);
  const isGridLayout = resolvedOptionLayout === "grid";

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Pressable accessibilityRole="button" onPress={() => setIsOpen((current) => !current)} style={styles.dropdownButton}>
        <Text style={styles.dropdownText}>{selectedOption?.label ?? "Choose an option"}</Text>
        <Text style={styles.dropdownHint}>{getSelectDropdownHint(isOpen, selectionMode)}</Text>
      </Pressable>
      {isOpen ? (
        <View style={[styles.options, isGridLayout ? styles.gridOptions : null]}>
          {options.map((option) => {
            const isSelected = option.value === value;
            const iconName = option.icon ?? getThemedIconForText(`${option.label} ${option.value}`, isSelected ? "check" : "leaf");
            const displayLabel = isGridLayout ? formatGridOptionLabel(option.label) : option.label;

            return (
              <Pressable
                accessibilityRole="button"
                key={option.value}
                onPress={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                style={[styles.option, isGridLayout ? styles.gridOption : null, isSelected ? styles.selectedOption : null]}
              >
                <Text numberOfLines={3} style={[styles.optionText, isSelected ? styles.selectedOptionText : null]}>
                  {displayLabel}
                </Text>
                {isGridLayout ? (
                  <View style={styles.optionIconFrame}>
                    <View style={styles.optionIconStretch}>
                      <ThemedIcon
                        accentColor={isSelected ? theme.colors.secondary : theme.colors.accent}
                        color={theme.colors.primary}
                        name={iconName}
                        size={34}
                      />
                    </View>
                  </View>
                ) : null}
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
    color: theme.colors.primary,
    fontSize: theme.typography.small,
    fontWeight: "700",
  },
  dropdownButton: {
    backgroundColor: theme.colors.dropdownSurface,
    borderColor: theme.colors.dropdownBorder,
    borderRadius: theme.radius.lg,
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
  gridOptions: {
    columnGap: theme.spacing.sm,
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: theme.spacing.sm,
  },
  option: {
    alignItems: "center",
    backgroundColor: theme.colors.dropdownSurface,
    borderColor: theme.colors.dropdownBorder,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    flexDirection: "row",
    gap: theme.spacing.xs,
    justifyContent: "center",
    minHeight: theme.spacing.primaryTouchTarget,
    padding: theme.spacing.md,
  },
  gridOption: {
    minHeight: 96,
    paddingHorizontal: theme.spacing.sm,
    width: "48%",
  },
  optionIconFrame: {
    alignItems: "center",
    height: 44,
    justifyContent: "center",
    overflow: "visible",
    width: 26,
  },
  optionIconStretch: {
    transform: [{ scaleX: 0.65 }, { scaleY: 1.25 }],
  },
  selectedOption: {
    backgroundColor: theme.colors.primarySoft,
    borderColor: theme.colors.secondary,
  },
  optionText: {
    color: theme.colors.textPrimary,
    flex: 1,
    fontSize: theme.typography.body,
    fontWeight: "700",
    lineHeight: 20,
  },
  selectedOptionText: {
    color: theme.colors.primary,
  },
  error: {
    color: theme.colors.error,
    fontSize: theme.typography.small,
    lineHeight: 20,
  },
});
