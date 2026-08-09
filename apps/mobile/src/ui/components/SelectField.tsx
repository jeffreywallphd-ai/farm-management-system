import { useState } from "react";
import { ImageBackground, Pressable, StyleSheet, Text, View } from "react-native";

import { formatGridOptionLabel, getSelectDropdownHint, getSelectOptionLayout, type SelectOptionLayout, type SelectSelectionMode } from "./SelectFieldModel";
import { ThemedIcon } from "./ThemedIcon";
import { useUiDensity } from "../theme/UiDensity";
import { theme } from "../theme/theme";

const optionVine = require("../../../assets/images/logo-vine-overlay.png");

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
  const density = useUiDensity();
  const selectedOption = options.find((option) => option.value === value);
  const resolvedOptionLayout = getSelectOptionLayout(label, options, optionLayout);
  const isGridLayout = resolvedOptionLayout === "grid";
  const selectTextStyle = {
    fontSize: density.isUngloved ? theme.typography.small : theme.typography.body,
    fontWeight: density.isUngloved ? "500" : "700",
    lineHeight: density.isUngloved ? 18 : 20,
  } as const;

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
        <View
          style={[
            styles.options,
            density.isUngloved ? styles.compactOptionsPanel : { gap: density.fieldGap },
            isGridLayout ? styles.gridOptions : null,
          ]}
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            const displayLabel = isGridLayout ? formatGridOptionLabel(option.label) : option.label;

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
                    paddingBottom: density.isUngloved ? theme.spacing.md : theme.spacing.lg,
                  },
                  isGridLayout ? styles.gridOption : null,
                  density.isUngloved ? styles.compactOption : null,
                  isSelected ? styles.selectedOption : null,
                ]}
              >
                {density.isUngloved ? null : (
                  <ImageBackground
                    imageStyle={[styles.optionVineImage, isSelected ? styles.selectedOptionVineImage : null]}
                    resizeMode="cover"
                    source={optionVine}
                    style={styles.optionVine}
                  />
                )}
                <Text numberOfLines={3} style={[styles.optionText, selectTextStyle, isSelected ? styles.selectedOptionText : null]}>
                  {displayLabel}
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
  dropdownTextGroup: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  dropdownText: {
    color: theme.colors.textPrimary,
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
  gridOptions: {
    columnGap: theme.spacing.sm,
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: theme.spacing.sm,
  },
  option: {
    alignItems: "center",
    backgroundColor: theme.colors.primarySoft,
    borderColor: theme.colors.secondary,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    justifyContent: "center",
    overflow: "hidden",
  },
  compactOption: {
    backgroundColor: "transparent",
    borderRadius: 0,
    borderWidth: 0,
  },
  gridOption: {
    minHeight: 96,
    paddingHorizontal: theme.spacing.sm,
    width: "48%",
  },
  selectedOption: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primaryPressed,
  },
  optionVine: {
    height: 31,
    left: -8,
    opacity: 0.28,
    position: "absolute",
    right: -8,
    bottom: -6,
    transform: [{ rotate: "9deg" }],
  },
  optionVineImage: {
    tintColor: theme.colors.secondary,
  },
  selectedOptionVineImage: {
    tintColor: theme.colors.onPrimary,
  },
  optionText: {
    color: theme.colors.textPrimary,
    textAlign: "center",
    width: "100%",
    zIndex: 1,
  },
  selectedOptionText: {
    color: theme.colors.onPrimary,
  },
  error: {
    color: theme.colors.error,
    fontSize: theme.typography.small,
    lineHeight: 20,
  },
});
