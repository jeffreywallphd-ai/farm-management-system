export type SelectSelectionMode = "single" | "multiple";
export type SelectOptionLayout = "grid" | "list";

interface SelectLayoutOption {
  label: string;
}

const maxGridOptionLabelLength = 18;

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
  "parent goal",
  "previous crop",
  "seed lot",
  "show tasks from",
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

export function getSelectOptionLayout(
  label: string,
  options: readonly SelectLayoutOption[] = [],
  requestedLayout?: SelectOptionLayout,
): SelectOptionLayout {
  const normalizedLabel = label.trim().toLowerCase();
  const isDynamicOptionSet =
    exactDynamicOptionLabels.has(normalizedLabel) || dynamicOptionLabelTerms.some((term) => normalizedLabel.includes(term));

  if (requestedLayout === "list" || isDynamicOptionSet || hasLongOptionLabel(options)) {
    return "list";
  }

  return requestedLayout ?? "grid";
}

export function formatGridOptionLabel(label: string): string {
  const trimmedLabel = label.trim();
  const words = trimmedLabel.split(/\s+/);

  if (words.length === 1 && trimmedLabel.includes("-")) {
    return trimmedLabel.replace("-", "-\n");
  }

  if (words.length < 2 || trimmedLabel.length <= 13) {
    return label;
  }

  return words.join("\n");
}

function hasLongOptionLabel(options: readonly SelectLayoutOption[]): boolean {
  return options.some((option) => {
    const words = option.label.trim().split(/\s+/).filter(Boolean);

    return option.label.trim().length > maxGridOptionLabelLength || words.length > 2;
  });
}
