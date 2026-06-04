export type SelectSelectionMode = "single" | "multiple";
export type SelectOptionLayout = "grid" | "list";

const exactDynamicOptionLabels = new Set([
  "assigned farmhand",
  "board",
  "certification subgoal",
  "compost batch",
  "crop",
  "farm place",
  "farmhand",
  "goal",
  "item",
  "lot",
  "material",
  "observation",
  "organic input",
  "parent place",
  "previous crop",
  "seed lot",
  "show work for",
]);

const dynamicOptionLabelTerms = [
  "handling place",
  "harvest place",
  "linked setup material",
  "storage place",
] as const;

export function getSelectDropdownHint(isOpen: boolean, selectionMode: SelectSelectionMode = "single") {
  if (isOpen) {
    return "Hide options";
  }

  return selectionMode === "multiple" ? "Change options" : "Change option";
}

export function getSelectOptionLayout(label: string): SelectOptionLayout {
  const normalizedLabel = label.trim().toLowerCase();
  const isDynamicOptionSet =
    exactDynamicOptionLabels.has(normalizedLabel) || dynamicOptionLabelTerms.some((term) => normalizedLabel.includes(term));

  return isDynamicOptionSet ? "list" : "grid";
}

export function formatGridOptionLabel(label: string): string {
  const words = label.trim().split(/\s+/);

  if (words.length < 2 || label.length <= 13) {
    return label;
  }

  return words.join("\n");
}
