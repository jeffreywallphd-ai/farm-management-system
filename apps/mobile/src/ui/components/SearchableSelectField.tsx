import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { getSelectDropdownHint, type SelectSelectionMode } from "./SelectFieldModel";
import { ThemedIcon } from "./ThemedIcon";
import { useUiDensity } from "../theme/UiDensity";
import { theme } from "../theme/theme";

export interface SearchableSelectOption {
  label: string;
  value: string;
  detail?: string;
}

export function SearchableSelectField({
  label,
  options,
  value,
  onChange,
  error,
  placeholder = "Search",
  selectionMode = "single",
}: {
  label: string;
  options: SearchableSelectOption[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  selectionMode?: SelectSelectionMode;
}) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const density = useUiDensity();
  const selectedOption = options.find((option) => option.value === value);
  const selectTextStyle = {
    fontSize: density.isUngloved ? theme.typography.small : theme.typography.body,
    fontWeight: density.isUngloved ? "500" : "700",
    lineHeight: density.isUngloved ? 18 : 20,
  } as const;
  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return options;
    }

    return options.filter((option) => {
      const haystack = `${option.label} ${option.detail ?? ""}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [options, query]);

  return (
    <View style={[styles.container, { gap: density.fieldGap }]}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        onPress={() => setIsOpen((current) => !current)}
        style={[
          styles.dropdownButton,
          {
            minHeight: density.inputMinHeight,
            paddingHorizontal: density.inputPaddingHorizontal,
            paddingVertical: density.inputPaddingVertical,
          },
        ]}
      >
        <View style={styles.dropdownButtonContent}>
          <View style={styles.dropdownTextGroup}>
            <Text style={[styles.dropdownText, selectTextStyle]}>{selectedOption?.label ?? "Choose an option"}</Text>
            {density.selectHintVisible ? <Text style={styles.dropdownHint}>{getSelectDropdownHint(isOpen, selectionMode)}</Text> : null}
          </View>
          <ThemedIcon color={theme.colors.primary} name="arrowDown" size={density.isUngloved ? 18 : 22} />
        </View>
      </Pressable>
      {isOpen ? (
        <>
          <TextInput
            accessibilityLabel={`${label} search`}
            onChangeText={setQuery}
            placeholder={placeholder}
            placeholderTextColor={theme.colors.textSecondary}
            style={[
              styles.input,
              density.isUngloved ? styles.compactInput : null,
              {
                minHeight: density.inputMinHeight,
                paddingHorizontal: density.inputPaddingHorizontal,
                paddingVertical: density.inputPaddingVertical,
              },
            ]}
            value={query}
          />
          <View style={[styles.options, density.isUngloved ? styles.compactOptionsPanel : { gap: density.fieldGap }]}>
            {filteredOptions.length ? (
              filteredOptions.map((option) => {
                const isSelected = option.value === value;

                return (
                  <Pressable
                    accessibilityRole="button"
                    key={option.value}
                    onPress={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    style={[
                      styles.option,
                      {
                        minHeight: density.optionMinHeight,
                        padding: density.optionPadding,
                      },
                      density.isUngloved ? styles.compactOption : null,
                      isSelected ? styles.selectedOption : null,
                    ]}
                  >
                    <Text style={[styles.optionText, selectTextStyle, isSelected ? styles.selectedOptionText : null]}>
                      {option.label}
                    </Text>
                    {option.detail ? (
                      <Text style={[styles.optionDetail, isSelected ? styles.selectedOptionText : null]}>
                        {option.detail}
                      </Text>
                    ) : null}
                  </Pressable>
                );
              })
            ) : (
              <Text style={styles.emptyText}>No matches.</Text>
            )}
          </View>
        </>
      ) : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
  },
  emptyText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small,
  },
  dropdownButton: {
    backgroundColor: theme.colors.dropdownSurface,
    borderColor: theme.colors.dropdownBorder,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    justifyContent: "center",
  },
  dropdownButtonContent: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.md,
    justifyContent: "space-between",
  },
  dropdownHint: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small,
    lineHeight: 20,
  },
  dropdownText: {
    color: theme.colors.textPrimary,
  },
  dropdownTextGroup: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  error: {
    color: theme.colors.error,
    fontSize: theme.typography.small,
    lineHeight: 20,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body,
  },
  compactInput: {
    fontSize: theme.typography.caption,
    lineHeight: 16,
  },
  label: {
    color: theme.colors.primary,
    fontSize: theme.typography.small,
    fontWeight: "700",
  },
  option: {
    backgroundColor: theme.colors.primarySoft,
    borderColor: theme.colors.secondary,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    gap: theme.spacing.xs,
    justifyContent: "center",
  },
  optionDetail: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small,
    lineHeight: 20,
  },
  options: {
  },
  compactOptionsPanel: {
    backgroundColor: theme.colors.primarySoft,
    borderColor: theme.colors.secondary,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    overflow: "hidden",
  },
  compactOption: {
    backgroundColor: "transparent",
    borderRadius: 0,
    borderWidth: 0,
  },
  optionText: {
    color: theme.colors.textPrimary,
  },
  selectedOption: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primaryPressed,
  },
  selectedOptionText: {
    color: theme.colors.onPrimary,
  },
});
