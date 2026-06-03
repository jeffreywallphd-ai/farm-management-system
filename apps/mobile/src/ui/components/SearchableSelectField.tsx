import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

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
}: {
  label: string;
  options: SearchableSelectOption[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
}) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((option) => option.value === value);
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
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Pressable accessibilityRole="button" onPress={() => setIsOpen((current) => !current)} style={styles.dropdownButton}>
        <Text style={styles.dropdownText}>{selectedOption?.label ?? "Choose an option"}</Text>
        <Text style={styles.dropdownHint}>{isOpen ? "Hide options" : "Show options"}</Text>
      </Pressable>
      {isOpen ? (
        <>
          <TextInput
            accessibilityLabel={`${label} search`}
            onChangeText={setQuery}
            placeholder={placeholder}
            placeholderTextColor={theme.colors.textSecondary}
            style={styles.input}
            value={query}
          />
          <View style={styles.options}>
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
                    style={[styles.option, isSelected ? styles.selectedOption : null]}
                  >
                    <Text style={[styles.optionText, isSelected ? styles.selectedOptionText : null]}>
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
    gap: theme.spacing.sm,
  },
  emptyText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small,
  },
  dropdownButton: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
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
  error: {
    color: theme.colors.error,
    fontSize: theme.typography.small,
    lineHeight: 20,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body,
    minHeight: theme.spacing.touchTarget,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  label: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.small,
    fontWeight: "700",
  },
  option: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    gap: theme.spacing.xs,
    justifyContent: "center",
    minHeight: theme.spacing.primaryTouchTarget,
    padding: theme.spacing.md,
  },
  optionDetail: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small,
    lineHeight: 20,
  },
  options: {
    gap: theme.spacing.sm,
  },
  optionText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body,
    fontWeight: "700",
  },
  selectedOption: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accentPressed,
  },
  selectedOptionText: {
    color: theme.colors.onAccent,
  },
});
