export type StarterPackTaskSelection = Partial<Record<string, string[]>>;

export function toggleStarterPackTaskKeys(
  current: StarterPackTaskSelection,
  packId: string,
  taskKeys: string[],
): StarterPackTaskSelection {
  if (!taskKeys.length) {
    return current;
  }

  const currentKeys = new Set(current[packId] ?? []);
  const taskKeySet = new Set(taskKeys);
  const shouldSelect = taskKeys.some((taskKey) => !currentKeys.has(taskKey));
  const retainedKeys = [...currentKeys].filter((taskKey) => !taskKeySet.has(taskKey));
  const nextKeys = shouldSelect
    ? [...retainedKeys, ...taskKeys]
    : retainedKeys;
  const next = { ...current };
  if (nextKeys.length) next[packId] = nextKeys;
  else delete next[packId];
  return next;
}

export function isStarterPackHierarchyChecked(taskKeys: string[], selectedTaskKeys: Set<string>): boolean {
  return taskKeys.some((taskKey) => selectedTaskKeys.has(taskKey));
}

export function selectedStarterPackTaskCount(taskKeys: string[], selectedTaskKeys: Set<string>): number {
  return taskKeys.filter((taskKey) => selectedTaskKeys.has(taskKey)).length;
}

export function starterPackTaskCountLabel(totalTaskCount: number, selectedTaskCount: number, allTasksAdded: boolean): string {
  if (allTasksAdded) {
    return "Added";
  }
  if (selectedTaskCount > 0) {
    return `${selectedTaskCount}/${totalTaskCount} task${totalTaskCount === 1 ? "" : "s"}`;
  }
  return `${totalTaskCount} task${totalTaskCount === 1 ? "" : "s"}`;
}
