export type SelectSelectionMode = "single" | "multiple";

export function getSelectDropdownHint(isOpen: boolean, selectionMode: SelectSelectionMode = "single") {
  if (isOpen) {
    return "Hide options";
  }

  return selectionMode === "multiple" ? "Change options" : "Change option";
}
