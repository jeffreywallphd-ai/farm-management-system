import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { Farm } from "../../domain/farm/Farm";
import type { FarmLocation } from "../../domain/farm/FarmLocation";
import type { TrackedItem } from "../../domain/farm/TrackedItem";
import {
  FARM_PLACE_GEOMETRY_ROLES,
  type FarmMapSettings,
  type FarmPlaceGeometry,
  type FarmPlaceGeometryRole,
  type FarmPlaceGeometryType,
  type SupportedGeoJsonGeometry,
} from "../../domain/gis/FarmMap";
import type { FarmMapRepository } from "../../application/ports/FarmMapRepository";
import type { FarmDeviceCoordinates } from "../../application/ports/FarmLocationDeviceService";
import type { FarmReferenceRepository } from "../../application/ports/FarmReferenceRepository";
import type { OrganicCertificationRepository } from "../../application/ports/OrganicCertificationRepository";
import type { PlanningRepository } from "../../application/ports/PlanningRepository";
import {
  archiveFarmPlaceGeometry,
  createFarmPlaceGeometry,
  saveFarmCenterLocation,
  saveFarmMapAddressText,
  saveFarmMapViewport,
  updateFarmPlaceGeometry,
} from "../../application/use-cases/manage-farm-map/ManageFarmMap";
import { getOrganicCertificationDashboard } from "../../application/use-cases/manage-organic-certification/GetOrganicCertificationDashboard";
import { saveOrganicOperationProfile } from "../../application/use-cases/manage-organic-certification/SaveOrganicOperationProfile";
import {
  ensureFarmWorkPacks,
  getFarmWorkPackSetupSummary,
  setFarmWorkPackActive,
  setFarmWorkPackItemActive,
  type FarmWorkPackGroup,
  type FarmWorkPackId,
  type FarmWorkPackGoalSetupSummary,
  type FarmWorkPackSetupSummary,
  type FarmWorkPackSubgoalSetupSummary,
} from "../../application/use-cases/manage-planning/DefaultFarmWorkPacks";
import { ensureOrganicCertificationPlan } from "../../application/use-cases/manage-planning/CreateOrganicCertificationPlan";
import { ensureDefaultPlanningBoards } from "../../application/use-cases/manage-planning/ManagePlanning";
import type { WeekStartsOn } from "../../application/use-cases/manage-farmhands/ListFarmhandWork";
import { updateFarmName } from "../../application/use-cases/update-farm-name/updateFarmName";
import { ORGANIC_CERTIFICATION_SCOPE_LABELS, type OrganicCertificationScopeType, type OrganicOperationProfile } from "../../domain/organic/OrganicCertification";
import { defaultRecordRetentionYearsForStatus } from "../../domain/validation/organicCertificationValidation";
import { expoFarmLocationDeviceService } from "../../infrastructure/location/ExpoFarmLocationDeviceService";
import { systemClock } from "../../infrastructure/system/clock";
import { localIdGenerator } from "../../infrastructure/system/idGenerator";
import { Button } from "../components/Button";
import { CollapsibleCard } from "../components/CollapsibleCard";
import { FarmGeometryMapEditor } from "../components/FarmGeometryMapEditor";
import { FarmMapPreview } from "../components/FarmMapPreview";
import type { FarmMapPreviewViewState } from "../components/FarmMapPreviewModel";
import { FormField } from "../components/FormField";
import { FarmPlacesEditor, TrackedItemsEditor } from "../components/ReferenceEditors";
import { PageHeader } from "../components/PageHeader";
import { Screen } from "../components/Screen";
import { SelectField } from "../components/SelectField";
import { useDatePreferences } from "../datePreferences";
import { buildFarmPlaceOptions } from "../farmPlaceDisplay";
import { isOrganicCertificationPursuitActive } from "../organicCertificationPlanningVisibility";
import { useUiDensity } from "../theme/UiDensity";
import { theme } from "../theme/theme";
import {
  isStarterPackHierarchyChecked,
  selectedStarterPackTaskCount,
  starterPackTaskCountLabel,
  toggleStarterPackTaskKeys,
} from "./FarmWorkPackSetupModel";

type ReferenceSection = {
  type: "crop";
  title: string;
  addLabel: string;
  placeholder: string;
  items: TrackedItem[];
};

export type SetupSectionId =
  | "farmProfile"
  | "farmMapLocation"
  | "organicCertification"
  | "farmWorkPacks"
  | "scheduleWeek"
  | "farmPlaces"
  | "crops";

export function FarmDashboardScreen({
  farm,
  locations,
  crops,
  farmMapRepository,
  organicCertificationRepository,
  planningRepository,
  repository,
  onReferenceSaved,
  initialExpandedSection,
}: {
  farm: Farm;
  locations: FarmLocation[];
  crops: TrackedItem[];
  farmMapRepository: FarmMapRepository;
  organicCertificationRepository: OrganicCertificationRepository;
  planningRepository: PlanningRepository;
  repository: FarmReferenceRepository;
  onReferenceSaved: () => Promise<void>;
  initialExpandedSection?: SetupSectionId;
}) {
  const [expandedSection, setExpandedSection] = useState<SetupSectionId | undefined>(initialExpandedSection);
  const [farmName, setFarmName] = useState(farm.name);
  const [farmNameError, setFarmNameError] = useState<string | undefined>();
  const [isSavingFarmName, setIsSavingFarmName] = useState(false);
  const [farmMapSettings, setFarmMapSettings] = useState<FarmMapSettings | null>(null);
  const [farmCenter, setFarmCenter] = useState<FarmPlaceGeometry | null>(null);
  const [farmGeometries, setFarmGeometries] = useState<FarmPlaceGeometry[]>([]);
  const datePreferences = useDatePreferences();
  const sections: ReferenceSection[] = [
    { type: "crop", title: "Crops", addLabel: "Add crop", placeholder: "Kale", items: crops },
  ];

  function toggle(section: SetupSectionId) {
    setExpandedSection((current) => (current === section ? undefined : section));
  }

  useEffect(() => {
    setExpandedSection(initialExpandedSection);
  }, [initialExpandedSection]);

  useEffect(() => {
    setFarmName(farm.name);
  }, [farm.name]);

  async function handleSaveFarmName() {
    setIsSavingFarmName(true);
    setFarmNameError(undefined);

    try {
      await updateFarmName({ farmId: farm.id, name: farmName }, { repository });
    } catch (caughtError) {
      setFarmNameError(caughtError instanceof Error ? caughtError.message : "Farm name could not be saved.");
    } finally {
      setIsSavingFarmName(false);
    }
  }

  const loadFarmMap = useCallback(async () => {
    const [settings, center, geometries] = await Promise.all([
      farmMapRepository.getByFarmId(farm.id),
      farmMapRepository.getFarmCenter(farm.id),
      farmMapRepository.getGeometriesByFarmId(farm.id),
    ]);

    setFarmMapSettings(settings);
    setFarmCenter(center);
    setFarmGeometries(geometries);
  }, [farm.id, farmMapRepository]);

  useEffect(() => {
    void loadFarmMap();
  }, [loadFarmMap]);

  return (
    <Screen>
      <PageHeader
        eyebrow="Farm setup"
        supportingText="Open just the setup section you want. Your quick farm-note capture now lives on Home."
        title={farmName}
      />
      <CollapsibleCard
        detail="Rename this local farm setup."
        isExpanded={expandedSection === "farmProfile"}
        onToggle={() => toggle("farmProfile")}
        rootLevelHeader
        title="Farm name"
      >
        <View style={styles.actionStack}>
          <FormField
            error={farmNameError}
            label="Farm name"
            onChangeText={setFarmName}
            onSubmitEditing={handleSaveFarmName}
            placeholder="Green Hill Farm"
            value={farmName}
          />
          <Button disabled={isSavingFarmName} label={isSavingFarmName ? "Saving..." : "Save farm name"} onPress={handleSaveFarmName} size="large" />
        </View>
      </CollapsibleCard>
      <CollapsibleCard
        detail={farmCenter ? "Saved farm center geometry is local on this device." : "Save an address or coordinates for the farm map."}
        isExpanded={expandedSection === "farmMapLocation"}
        onToggle={() => toggle("farmMapLocation")}
        rootLevelHeader
        title="Farm map location"
      >
        <FarmMapLocationEditor
          farmId={farm.id}
          farmCenter={farmCenter}
          mapSettings={farmMapSettings}
          onSaved={loadFarmMap}
          repository={farmMapRepository}
        />
      </CollapsibleCard>
      <CollapsibleCard
        detail="Choose starter goals and tasks for the work this farm actually does."
        isExpanded={expandedSection === "farmWorkPacks"}
        onToggle={() => toggle("farmWorkPacks")}
        rootLevelHeader
        title="Starter work packs"
      >
        <FarmWorkPackSetup farmId={farm.id} planningRepository={planningRepository} />
      </CollapsibleCard>
      <CollapsibleCard
        detail="Show or hide organic certification planning and boards for this farm."
        isExpanded={expandedSection === "organicCertification"}
        onToggle={() => toggle("organicCertification")}
        rootLevelHeader
        title="Organic certification"
      >
        <OrganicCertificationSetup
          farmId={farm.id}
          organicCertificationRepository={organicCertificationRepository}
          planningRepository={planningRepository}
        />
      </CollapsibleCard>      
      <CollapsibleCard
        detail={`${locations.length} saved place${locations.length === 1 ? "" : "s"}`}
        isExpanded={expandedSection === "farmPlaces"}
        onToggle={() => toggle("farmPlaces")}
        rootLevelHeader
        title="Farm places"
      >
        <FarmPlacesEditor
          farmId={farm.id}
          geometryEditorForPlace={(place) => (
            <PlaceGeometryEditor
              farmGeometries={farmGeometries.filter((geometry) => geometry.placeId === place.id)}
              farmId={farm.id}
              farmMapSettings={farmMapSettings}
              farmCenter={farmCenter}
              locations={locations}
              onSaved={loadFarmMap}
              place={place}
              repository={farmMapRepository}
            />
          )}
          locations={locations}
          onReferenceSaved={onReferenceSaved}
          repository={repository}
        />
      </CollapsibleCard>
      {sections.map((section) => (
        <CollapsibleCard
          detail={`${section.items.length} saved`}
          isExpanded={expandedSection === sectionIdForType(section.type)}
          key={section.type}
          onToggle={() => toggle(sectionIdForType(section.type))}
          rootLevelHeader
          title={section.title}
        >
          <TrackedItemsEditor
            addLabel={section.addLabel}
            farmId={farm.id}
            items={section.items}
            kind={section.type}
            onReferenceSaved={onReferenceSaved}
            placeholder={section.placeholder}
            repository={repository}
            title={section.title}
          />
        </CollapsibleCard>
      ))}
      <CollapsibleCard
        detail="Controls calendar pickers, day order, and farmhand Week Of dates across the app."
        isExpanded={expandedSection === "scheduleWeek"}
        onToggle={() => toggle("scheduleWeek")}
        rootLevelHeader
        title="Schedule week setup"
      >
        <SelectField
          error={datePreferences.error}
          label="Week starts on"
          onChange={(value) => {
            void datePreferences.saveWeekStartsOn(Number(value) as WeekStartsOn);
          }}
          options={[
            { label: "Sunday", value: "0" },
            { label: "Monday", value: "1" },
          ]}
          value={String(datePreferences.weekStartsOn)}
        />
      </CollapsibleCard>
    </Screen>
  );
}

function sectionIdForType(_type: ReferenceSection["type"]): SetupSectionId {
  return "crops";
}

export function FarmWorkPackSetup({
  farmId,
  planningRepository,
}: {
  farmId: string;
  planningRepository: PlanningRepository;
}) {
  const [summaries, setSummaries] = useState<FarmWorkPackSetupSummary[]>([]);
  const [selectedTaskKeysByPackId, setSelectedTaskKeysByPackId] = useState<Partial<Record<FarmWorkPackId, string[]>>>({});
  const [expandedPackIds, setExpandedPackIds] = useState<Set<FarmWorkPackId>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();
  const packGroups: Array<{ group: FarmWorkPackGroup; title: string; detail: string }> = [
    {
      group: "administrationPlanning",
      title: "Administration and planning work",
      detail: "Planning, ordering, records, schedules, and follow-up decisions.",
    },
    {
      group: "farmWork",
      title: "Farm work",
      detail: "Hands-on field, greenhouse, livestock, harvest, and equipment tasks.",
    },
  ];

  const loadPackSummaries = useCallback(async () => {
    setIsLoading(true);
    setError(undefined);

    try {
      setSummaries(await getFarmWorkPackSetupSummary({ farmId }, { repository: planningRepository }));
    } catch {
      setError("Starter work packs could not be loaded.");
    } finally {
      setIsLoading(false);
    }
  }, [farmId, planningRepository]);

  useEffect(() => {
    void loadPackSummaries();
  }, [loadPackSummaries]);

  function toggleExpandedPack(packId: FarmWorkPackId) {
    setExpandedPackIds((current) => {
      const next = new Set(current);
      if (next.has(packId)) next.delete(packId);
      else next.add(packId);
      return next;
    });
  }

  function togglePackTaskKeys(packId: FarmWorkPackId, taskKeys: string[]) {
    setSelectedTaskKeysByPackId((current) => {
      return toggleStarterPackTaskKeys(current, packId, taskKeys);
    });
  }

  async function handleTogglePackActive(summary: FarmWorkPackSetupSummary) {
    setIsSaving(true);
    setError(undefined);
    setMessage(undefined);

    try {
      const nextIsActive = !summary.isActive;
      await setFarmWorkPackActive(
        { farmId, packId: summary.id, isActive: nextIsActive },
        { clock: systemClock, repository: planningRepository },
      );
      if (nextIsActive) {
        await ensureDefaultPlanningBoards(
          { farmId },
          { clock: systemClock, idGenerator: localIdGenerator, repository: planningRepository },
        );
      }
      await loadPackSummaries();
      setMessage(`${summary.shortTitle} starter pack is now ${nextIsActive ? "active" : "inactive"}.`);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Starter work pack status could not be changed.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleTogglePackItemActive(templateKey: string, isActive: boolean) {
    setIsSaving(true);
    setError(undefined);
    setMessage(undefined);

    try {
      const nextIsActive = !isActive;
      await setFarmWorkPackItemActive(
        { farmId, templateKey, isActive: nextIsActive },
        { clock: systemClock, repository: planningRepository },
      );
      await loadPackSummaries();
      setMessage(`Starter pack item is now ${nextIsActive ? "active" : "inactive"}.`);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Starter work pack item status could not be changed.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleAddPack(summary: FarmWorkPackSetupSummary) {
    const selectedTaskKeys = selectedTaskKeysByPackId[summary.id] ?? unappliedTaskKeys(summary);
    if (!selectedTaskKeys.length) return;

    setIsSaving(true);
    setError(undefined);
    setMessage(undefined);

    try {
      const result = await ensureFarmWorkPacks(
        { farmId, packIds: [summary.id], taskTemplateKeysByPackId: { [summary.id]: selectedTaskKeys } },
        { clock: systemClock, idGenerator: localIdGenerator, repository: planningRepository },
      );
      await ensureDefaultPlanningBoards(
        { farmId },
        { clock: systemClock, idGenerator: localIdGenerator, repository: planningRepository },
      );
      setSelectedTaskKeysByPackId((current) => {
        const next = { ...current };
        delete next[summary.id];
        return next;
      });
      await loadPackSummaries();
      setMessage(
        `Added ${summary.shortTitle} starter pack with ${result.tasks.length} task${result.tasks.length === 1 ? "" : "s"}.`,
      );
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Starter work pack could not be added.");
    } finally {
      setIsSaving(false);
    }
  }

  function renderPackGroup(group: FarmWorkPackGroup, title: string, detail: string) {
    const groupSummaries = summaries.filter((summary) => summary.group === group);
    if (!isLoading && groupSummaries.length === 0) return null;

    return (
      <View key={group} style={styles.packGroupPanel}>
        <Text style={styles.packGroupTitle}>{title}</Text>
        <Text style={styles.helperText}>{detail}</Text>
        <View style={styles.packList}>
          {groupSummaries.map((summary) => {
            const selectedKeys = selectedTaskKeysByPackId[summary.id] ?? [];
            const remainingTaskKeys = unappliedTaskKeys(summary);
            const taskKeysToAdd = selectedKeys.length ? selectedKeys : remainingTaskKeys;
            const isExpanded = expandedPackIds.has(summary.id);
            const statusText = summary.isApplied
              ? summary.isActive ? "Active" : "Inactive"
              : selectedKeys.length ? `${selectedKeys.length} selected` : "Not added";
            return (
              <View
                key={summary.id}
                style={[
                  styles.packOption,
                  selectedKeys.length ? styles.packOptionSelected : null,
                  summary.isApplied ? styles.packOptionApplied : null,
                ]}
              >
                <View style={styles.packHeader}>
                  <Text style={styles.packTitle}>{summary.shortTitle}</Text>
                  <Text style={summary.isApplied ? styles.packStatusApplied : styles.packStatus}>
                    {statusText}
                  </Text>
                </View>
                <Text style={styles.statusText}>{summary.setupQuestion}</Text>
                <Text style={styles.helperText}>{summary.description}</Text>
                <Text style={styles.placeDetail}>
                  {summary.goalCount} goal{summary.goalCount === 1 ? "" : "s"} - {summary.taskCount} task{summary.taskCount === 1 ? "" : "s"}
                </Text>
                <Text style={styles.placeDetail}>Good for: {summary.suggestedFor.join(", ")}</Text>
                <View style={styles.packActionRow}>
                  {remainingTaskKeys.length ? (
                    <Pressable
                      accessibilityRole="button"
                      disabled={isSaving}
                      onPress={() => handleAddPack(summary)}
                      style={[styles.packInlineButton, styles.packPrimaryInlineButton]}
                    >
                      <Text style={[styles.packInlineButtonText, styles.packPrimaryInlineButtonText]}>
                        {selectedKeys.length
                          ? `Add ${taskKeysToAdd.length} selected task${taskKeysToAdd.length === 1 ? "" : "s"}`
                          : "Add starter pack tasks"}
                      </Text>
                    </Pressable>
                  ) : null}
                  {summary.isApplied ? (
                    <Pressable
                      accessibilityRole="button"
                      disabled={isSaving}
                      onPress={() => handleTogglePackActive(summary)}
                      style={styles.packInlineButton}
                    >
                      <Text style={styles.packInlineButtonText}>{summary.isActive ? "Deactivate pack" : "Activate pack"}</Text>
                    </Pressable>
                  ) : null}
                  <Pressable accessibilityRole="button" onPress={() => toggleExpandedPack(summary.id)} style={styles.packInlineButton}>
                    <Text style={styles.packInlineButtonText}>{isExpanded ? "Hide goals" : "Show goals"}</Text>
                  </Pressable>
                </View>
                {isExpanded ? (
                  <FarmWorkPackTaskPicker
                    isSaving={isSaving}
                    onToggleItemActive={handleTogglePackItemActive}
                    onToggleTaskKeys={(taskKeys) => togglePackTaskKeys(summary.id, taskKeys)}
                    selectedTaskKeys={selectedKeys}
                    summary={summary}
                  />
                ) : null}
              </View>
            );
          })}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.actionStack}>
      <Text style={styles.sectionTitle}>What kind of farm work should the app start with?</Text>
      <Text style={styles.helperText}>
        Pick only the work this farm does. Starter packs create editable goals and tasks in Farm Planning and Farm Work Boards.
      </Text>
      {isLoading ? <Text style={styles.helperText}>Opening starter work packs...</Text> : null}
      {packGroups.map((group) => renderPackGroup(group.group, group.title, group.detail))}
      {message ? <Text style={styles.statusText}>{message}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

function FarmWorkPackTaskPicker({
  isSaving,
  onToggleItemActive,
  onToggleTaskKeys,
  selectedTaskKeys,
  summary,
}: {
  isSaving: boolean;
  onToggleItemActive: (templateKey: string, isActive: boolean) => void;
  onToggleTaskKeys: (taskKeys: string[]) => void;
  selectedTaskKeys: string[];
  summary: FarmWorkPackSetupSummary;
}) {
  const selectedSet = new Set(selectedTaskKeys);
  return (
    <View style={styles.packTaskList}>
      {summary.goals.map((goal) => {
        const goalTaskKeys = unappliedTaskKeysForGoal(goal);
        const selectedGoalTaskCount = selectedStarterPackTaskCount(goalTaskKeys, selectedSet);
        return (
          <View key={goal.templateKey} style={styles.packGoalGroup}>
            <PackCheckRow
              disabled={isSaving || goal.isApplied || goalTaskKeys.length === 0}
              isChecked={goal.isApplied || isStarterPackHierarchyChecked(goalTaskKeys, selectedSet)}
              label={goal.title}
              meta={goal.isApplied ? "Added" : starterPackTaskCountLabel(goalTaskKeys.length, selectedGoalTaskCount, false)}
              metaLabel="Goal"
              onPress={() => onToggleTaskKeys(goalTaskKeys)}
              title
            />
            {goal.subgoals.map((subgoal) => (
              <FarmWorkPackSubgoalPicker
                isSaving={isSaving}
                onToggleItemActive={onToggleItemActive}
                key={subgoal.templateKey}
                onToggleTaskKeys={onToggleTaskKeys}
                selectedSet={selectedSet}
                subgoal={subgoal}
              />
            ))}
          </View>
        );
      })}
    </View>
  );
}

function FarmWorkPackSubgoalPicker({
  isSaving,
  onToggleItemActive,
  onToggleTaskKeys,
  selectedSet,
  subgoal,
}: {
  isSaving: boolean;
  onToggleItemActive: (templateKey: string, isActive: boolean) => void;
  onToggleTaskKeys: (taskKeys: string[]) => void;
  selectedSet: Set<string>;
  subgoal: FarmWorkPackSubgoalSetupSummary;
}) {
  const subgoalTaskKeys = unappliedTaskKeysForSubgoal(subgoal);
  const selectedSubgoalTaskCount = selectedStarterPackTaskCount(subgoalTaskKeys, selectedSet);
  return (
    <View style={styles.packSubgoalGroup}>
      <PackCheckRow
        actionLabel={subgoal.isApplied ? subgoal.isActive ? "Deactivate" : "Activate" : undefined}
        actionDisabled={isSaving}
        onActionPress={subgoal.isApplied ? () => onToggleItemActive(subgoal.templateKey, subgoal.isActive) : undefined}
        disabled={isSaving || subgoal.isApplied || subgoalTaskKeys.length === 0}
        isChecked={subgoal.isApplied || isStarterPackHierarchyChecked(subgoalTaskKeys, selectedSet)}
        label={subgoal.title}
        meta={subgoal.isApplied ? subgoal.isActive ? "Added" : "Inactive" : starterPackTaskCountLabel(subgoalTaskKeys.length, selectedSubgoalTaskCount, false)}
        metaLabel="Subgoal"
        onPress={() => onToggleTaskKeys(subgoalTaskKeys)}
      />
      <View style={styles.packTaskItemGroup}>
        {subgoal.tasks.map((task) => (
          <PackCheckRow
            actionLabel={task.isApplied ? task.isActive ? "Deactivate" : "Activate" : undefined}
            actionDisabled={isSaving}
            disabled={isSaving || task.isApplied}
            isChecked={task.isApplied || selectedSet.has(task.templateKey)}
            key={task.templateKey}
            label={task.title}
            meta={task.isApplied ? task.isActive ? "Added" : "Inactive" : "Task"}
            onActionPress={task.isApplied ? () => onToggleItemActive(task.templateKey, task.isActive) : undefined}
            onPress={() => onToggleTaskKeys([task.templateKey])}
          />
        ))}
      </View>
    </View>
  );
}

function PackItemToggle({
  disabled,
  label,
  onPress,
}: {
  disabled: boolean;
  label: string;
  onPress: () => void;
}) {
  const density = useUiDensity();

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.packItemToggle,
        {
          paddingHorizontal: density.isUngloved ? theme.spacing.sm : theme.spacing.md,
          paddingVertical: density.isUngloved ? theme.spacing.xs : theme.spacing.sm,
        },
        disabled ? styles.packCheckRowDisabled : null,
      ]}
    >
      <Text style={[styles.packItemToggleText, density.isUngloved ? styles.compactPackItemToggleText : null]}>{label}</Text>
    </Pressable>
  );
}

function PackCheckRow({
  actionDisabled = false,
  actionLabel,
  disabled,
  isChecked,
  label,
  meta,
  metaLabel,
  onActionPress,
  onPress,
  title = false,
}: {
  actionDisabled?: boolean;
  actionLabel?: string;
  disabled: boolean;
  isChecked: boolean;
  label: string;
  meta: string;
  metaLabel?: string;
  onActionPress?: () => void;
  onPress: () => void;
  title?: boolean;
}) {
  const density = useUiDensity();

  return (
    <View
      style={[
        styles.packCheckRow,
        {
          minHeight: density.isUngloved ? density.inputMinHeight : theme.spacing.primaryTouchTarget,
          paddingHorizontal: density.isUngloved ? theme.spacing.xs : theme.spacing.sm,
        },
      ]}
    >
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: isChecked, disabled }}
        disabled={disabled}
        onPress={onPress}
        style={[styles.packCheckMain, disabled ? styles.packCheckRowDisabled : null]}
      >
        <Text style={styles.packCheckBox}>{isChecked ? "[x]" : "[ ]"}</Text>
        <Text style={[styles.packCheckLabel, title ? styles.packCheckLabelTitle : null]}>{label}</Text>
        <View style={styles.packCheckMetaGroup}>
          {metaLabel ? <Text style={styles.packCheckMetaLabel}>{metaLabel}</Text> : null}
          <Text style={styles.packCheckMeta}>{meta}</Text>
        </View>
      </Pressable>
      {actionLabel && onActionPress ? (
        <PackItemToggle
          disabled={actionDisabled}
          label={actionLabel}
          onPress={onActionPress}
        />
      ) : null}
    </View>
  );
}

function unappliedTaskKeys(summary: FarmWorkPackSetupSummary): string[] {
  return summary.goals.flatMap(unappliedTaskKeysForGoal);
}

function unappliedTaskKeysForGoal(goal: FarmWorkPackGoalSetupSummary): string[] {
  return goal.subgoals.flatMap(unappliedTaskKeysForSubgoal);
}

function unappliedTaskKeysForSubgoal(subgoal: FarmWorkPackSubgoalSetupSummary): string[] {
  return subgoal.tasks.filter((task) => !task.isApplied).map((task) => task.templateKey);
}

function OrganicCertificationSetup({
  farmId,
  organicCertificationRepository,
  planningRepository,
}: {
  farmId: string;
  organicCertificationRepository: OrganicCertificationRepository;
  planningRepository: PlanningRepository;
}) {
  const [profile, setProfile] = useState<OrganicOperationProfile | null>(null);
  const [enabledScopes, setEnabledScopes] = useState<OrganicCertificationScopeType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();
  const isActive = isOrganicCertificationPursuitActive(profile);

  const loadCertificationSetup = useCallback(async () => {
    setIsLoading(true);

    try {
      const dashboard = await getOrganicCertificationDashboard(
        { farmId },
        { repository: organicCertificationRepository },
      );
      setProfile(dashboard.profile);
      setEnabledScopes(dashboard.enabledScopes.map((scope) => scope.scopeType));
    } catch {
      setError("Organic certification setup could not be loaded.");
    } finally {
      setIsLoading(false);
    }
  }, [farmId, organicCertificationRepository]);

  useEffect(() => {
    void loadCertificationSetup();
  }, [loadCertificationSetup]);

  async function handleToggle(nextIsActive: boolean) {
    setIsSaving(true);
    setError(undefined);
    setMessage(undefined);

    try {
      const organicStatus = nextIsActive
        ? profile && profile.organicStatus !== "notOrganic"
          ? profile.organicStatus
          : "transitioning"
        : "notOrganic";
      const nextEnabledScopes = nextIsActive ? (enabledScopes.length ? enabledScopes : ["crops"]) : [];
      const retentionYears = profile && profile.organicStatus === organicStatus
        ? profile.recordRetentionYears
        : defaultRecordRetentionYearsForStatus(organicStatus);
      const saved = await saveOrganicOperationProfile(
        {
          farmId,
          organicStatus,
          certifierName: profile?.certifierName,
          certifierContact: profile?.certifierContact,
          certificateNumber: profile?.certificateNumber,
          certificateEffectiveDate: profile?.certificateEffectiveDate,
          annualUpdateDueDate: profile?.annualUpdateDueDate,
          inspectionDueWindow: profile?.inspectionDueWindow,
          recordRetentionYears: retentionYears,
          notes: profile?.notes,
          enabledScopes: nextEnabledScopes,
        },
        { clock: systemClock, idGenerator: localIdGenerator, repository: organicCertificationRepository },
      );

      if (nextIsActive) {
        await ensureOrganicCertificationPlan(
          { farmId, targetDate: saved.profile.annualUpdateDueDate },
          { clock: systemClock, idGenerator: localIdGenerator, repository: planningRepository },
        );
      }

      setMessage(nextIsActive ? "Organic certification planning is on." : "Organic certification planning is off.");
      await loadCertificationSetup();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Organic certification setup could not be saved.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <View style={styles.actionStack}>
      <Text style={styles.sectionTitle}>Organic certification pursuit</Text>
      <Text style={styles.helperText}>
        {isActive
          ? "Certification planning is on. The two certification goal boards appear in Farm Planning and Farm Work Boards."
          : "Certification planning is off. Certification goals and boards stay hidden until this is turned on."}
      </Text>
      {enabledScopes.length ? (
        <Text style={styles.statusText}>
          Active scope{enabledScopes.length === 1 ? "" : "s"}: {enabledScopes.map((scope) => ORGANIC_CERTIFICATION_SCOPE_LABELS[scope]).join(", ")}
        </Text>
      ) : null}
      {isLoading ? <Text style={styles.helperText}>Opening certification setup...</Text> : null}
      <Button
        disabled={isSaving || isLoading}
        label={isSaving ? "Saving..." : isActive ? "Turn certification planning off" : "Turn certification planning on"}
        onPress={() => handleToggle(!isActive)}
        size="large"
        variant={isActive ? "secondary" : "primary"}
      />
      {message ? <Text style={styles.statusText}>{message}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  actionStack: {
    gap: theme.spacing.sm,
  },
  helperText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body,
    lineHeight: 24,
  },
  inlineGrid: {
    gap: theme.spacing.sm,
  },
  packGroupPanel: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
  },
  packGroupTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.headingFontFamily,
    fontSize: theme.typography.body,
    fontWeight: theme.typography.headingFontWeight,
  },
  packList: {
    gap: theme.spacing.sm,
  },
  packOption: {
    backgroundColor: theme.colors.surfaceMuted,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    gap: theme.spacing.xs,
    padding: theme.spacing.md,
  },
  packOptionApplied: {
    opacity: 0.72,
  },
  packOptionSelected: {
    backgroundColor: theme.colors.surfaceTint,
    borderColor: theme.colors.primary,
  },
  packHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.sm,
    justifyContent: "space-between",
  },
  packTitle: {
    color: theme.colors.textPrimary,
    flex: 1,
    fontFamily: theme.typography.headingFontFamily,
    fontSize: theme.typography.body,
    fontWeight: theme.typography.headingFontWeight,
  },
  packStatus: {
    color: theme.colors.primary,
    fontSize: theme.typography.small,
    fontWeight: "800",
  },
  packStatusApplied: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small,
    fontWeight: "800",
  },
  packActionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  packInlineButton: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.primary,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  packPrimaryInlineButton: {
    backgroundColor: theme.colors.primary,
  },
  packInlineButtonText: {
    color: theme.colors.primary,
    fontSize: theme.typography.small,
    fontWeight: "800",
  },
  packPrimaryInlineButtonText: {
    color: theme.colors.onPrimary,
  },
  packTaskList: {
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
    padding: theme.spacing.sm,
  },
  packGoalGroup: {
    gap: theme.spacing.xs,
  },
  packSubgoalGroup: {
    gap: theme.spacing.xs,
    paddingLeft: theme.spacing.md,
  },
  packTaskItemGroup: {
    gap: theme.spacing.xs,
    paddingLeft: theme.spacing.md,
  },
  packCheckRow: {
    alignItems: "stretch",
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.xs,
  },
  packCheckMain: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: theme.spacing.sm,
    minWidth: 0,
  },
  packCheckRowDisabled: {
    opacity: 0.62,
  },
  packCheckBox: {
    color: theme.colors.primary,
    fontSize: theme.typography.small,
    fontWeight: "900",
  },
  packCheckLabel: {
    color: theme.colors.textPrimary,
    flex: 1,
    flexShrink: 1,
    fontSize: theme.typography.small,
    lineHeight: 18,
  },
  packCheckLabelTitle: {
    fontFamily: theme.typography.headingFontFamily,
    fontWeight: theme.typography.headingFontWeight,
  },
  packCheckMetaGroup: {
    alignItems: "flex-end",
    minWidth: 72,
  },
  packCheckMetaLabel: {
    color: theme.colors.primary,
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  packCheckMeta: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small,
    fontWeight: "700",
  },
  packItemToggle: {
    alignSelf: "flex-end",
    backgroundColor: theme.colors.surfaceTint,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    flexShrink: 0,
    minHeight: 30,
    justifyContent: "center",
    paddingHorizontal: theme.spacing.sm,
  },
  packItemToggleText: {
    color: theme.colors.primary,
    fontSize: theme.typography.small,
    fontWeight: "800",
  },
  compactPackItemToggleText: {
    fontSize: theme.typography.caption,
    lineHeight: 16,
  },
  mapPreview: {
    backgroundColor: theme.colors.surfaceMuted,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
  },
  mapPreviewTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.headingFontFamily,
    fontSize: theme.typography.body,
    fontWeight: theme.typography.headingFontWeight,
  },
  geometrySection: {
    gap: theme.spacing.md,
  },
  geometryRow: {
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    gap: theme.spacing.sm,
    padding: theme.spacing.sm,
  },
  sectionBlock: {
    gap: theme.spacing.sm,
  },
  sectionTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.headingFontFamily,
    fontSize: theme.typography.body,
    fontWeight: theme.typography.headingFontWeight,
  },
  placeTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.headingFontFamily,
    fontSize: theme.typography.body,
    fontWeight: theme.typography.headingFontWeight,
  },
  placeDetail: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small,
    lineHeight: 20,
  },
  statusText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body,
    lineHeight: 24,
  },
  error: {
    color: theme.colors.error,
    fontSize: theme.typography.small,
    lineHeight: 20,
  },
});

function FarmMapLocationEditor({
  farmId,
  farmCenter,
  mapSettings,
  onSaved,
  repository,
}: {
  farmId: string;
  farmCenter: FarmPlaceGeometry | null;
  mapSettings: FarmMapSettings | null;
  onSaved: () => Promise<void>;
  repository: FarmMapRepository;
}) {
  const [addressText, setAddressText] = useState(mapSettings?.addressText ?? "");
  const [latitude, setLatitude] = useState(mapSettings?.defaultCenterLatitude?.toString() ?? "");
  const [longitude, setLongitude] = useState(mapSettings?.defaultCenterLongitude?.toString() ?? "");
  const [zoom, setZoom] = useState((mapSettings?.defaultZoom ?? 13).toString());
  const [pitch, setPitch] = useState((mapSettings?.defaultPitch ?? 0).toString());
  const [bearing, setBearing] = useState((mapSettings?.defaultBearing ?? 0).toString());
  const [message, setMessage] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();
  const [isSaving, setIsSaving] = useState(false);
  const latestMapViewRef = useRef<FarmMapPreviewViewState | null>(null);

  useEffect(() => {
    setAddressText(mapSettings?.addressText ?? "");
    setLatitude(mapSettings?.defaultCenterLatitude?.toString() ?? "");
    setLongitude(mapSettings?.defaultCenterLongitude?.toString() ?? "");
    setZoom((mapSettings?.defaultZoom ?? 13).toString());
    setPitch((mapSettings?.defaultPitch ?? 0).toString());
    setBearing((mapSettings?.defaultBearing ?? 0).toString());
    latestMapViewRef.current = mapSettings?.defaultCenterLatitude !== undefined && mapSettings.defaultCenterLongitude !== undefined
      ? {
        latitude: mapSettings.defaultCenterLatitude,
        longitude: mapSettings.defaultCenterLongitude,
        zoom: mapSettings.defaultZoom,
        pitch: mapSettings.defaultPitch,
        bearing: mapSettings.defaultBearing,
      }
      : null;
  }, [mapSettings]);

  async function handleSaveAddress() {
    setIsSaving(true);
    setError(undefined);
    setMessage(undefined);

    try {
      await saveFarmMapAddressText(
        { farmId, addressText },
        { clock: systemClock, idGenerator: localIdGenerator, repository },
      );
      await onSaved();
      setMessage("Address saved on this device.");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "The address could not be saved.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleFindAddressCoordinates() {
    setIsSaving(true);
    setError(undefined);
    setMessage(undefined);

    try {
      const coordinates = await expoFarmLocationDeviceService.geocodeAddress(addressText);

      applyCoordinatesToForm(coordinates);
      await saveFarmCenterLocation(
        {
          farmId,
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
          addressText,
          source: "addressGeocode",
        },
        { clock: systemClock, idGenerator: localIdGenerator, repository },
      );
      await onSaved();
      setMessage("Address coordinates saved as the farm center.");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "The address could not be found.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSaveCoordinates() {
    setIsSaving(true);
    setError(undefined);
    setMessage(undefined);

    try {
      const mapView = currentMapViewFromForm();

      if (!mapView) {
        throw new Error("Choose a farm location on the map or enter latitude and longitude.");
      }

      await saveFarmCenterLocation(
        {
          farmId,
          latitude: mapView.latitude,
          longitude: mapView.longitude,
          addressText,
          source: "manualMapEdit",
        },
        { clock: systemClock, idGenerator: localIdGenerator, repository },
      );
      await saveFarmMapViewport(
        {
          farmId,
          defaultCenterLatitude: mapView.latitude,
          defaultCenterLongitude: mapView.longitude,
          defaultZoom: mapView.zoom,
          defaultPitch: mapView.pitch,
          defaultBearing: mapView.bearing,
        },
        { clock: systemClock, idGenerator: localIdGenerator, repository },
      );
      await onSaved();
      setMessage("Farm map configuration saved.");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "The farm location could not be saved.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSaveMapLocation(viewState: FarmMapPreviewViewState) {
    handleMapViewChanged(viewState);
    setIsSaving(true);
    setError(undefined);
    setMessage(undefined);

    try {
      await saveFarmCenterLocation(
        {
          farmId,
          latitude: viewState.latitude,
          longitude: viewState.longitude,
          addressText,
          source: "manualMapEdit",
        },
        { clock: systemClock, idGenerator: localIdGenerator, repository },
      );
      await saveFarmMapViewport(
        {
          farmId,
          defaultCenterLatitude: viewState.latitude,
          defaultCenterLongitude: viewState.longitude,
          defaultZoom: viewState.zoom,
          defaultPitch: viewState.pitch,
          defaultBearing: viewState.bearing,
        },
        { clock: systemClock, idGenerator: localIdGenerator, repository },
      );
      await onSaved();
      setMessage("Farm map location saved from the full-screen map.");
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : "The farm map location could not be saved.";
      setError(message);
      throw new Error(message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleUseGpsLocation() {
    setIsSaving(true);
    setError(undefined);
    setMessage(undefined);

    try {
      const coordinates = await expoFarmLocationDeviceService.getCurrentCoordinates();

      applyCoordinatesToForm(coordinates);
      await saveFarmCenterLocation(
        {
          farmId,
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
          addressText,
          source: "gps",
        },
        { clock: systemClock, idGenerator: localIdGenerator, repository },
      );
      await onSaved();
      setMessage(coordinates.accuracyMeters ? `GPS farm center saved. Accuracy about ${Math.round(coordinates.accuracyMeters)} meters.` : "GPS farm center saved.");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "GPS location could not be saved.");
    } finally {
      setIsSaving(false);
    }
  }

  function applyCoordinatesToForm(coordinates: FarmDeviceCoordinates) {
    latestMapViewRef.current = null;
    setLatitude(formatCoordinate(coordinates.latitude));
    setLongitude(formatCoordinate(coordinates.longitude));
  }

  function handleLatitudeChanged(value: string) {
    latestMapViewRef.current = null;
    setLatitude(value);
  }

  function handleLongitudeChanged(value: string) {
    latestMapViewRef.current = null;
    setLongitude(value);
  }

  function handleZoomChanged(value: string) {
    latestMapViewRef.current = null;
    setZoom(value);
  }

  function handlePitchChanged(value: string) {
    latestMapViewRef.current = null;
    setPitch(value);
  }

  function handleBearingChanged(value: string) {
    latestMapViewRef.current = null;
    setBearing(value);
  }

  function handleMapViewChanged(viewState: FarmMapPreviewViewState) {
    latestMapViewRef.current = viewState;
    setLatitude(formatCoordinate(viewState.latitude));
    setLongitude(formatCoordinate(viewState.longitude));
    setZoom(formatMapNumber(viewState.zoom));
    setPitch(formatMapNumber(viewState.pitch));
    setBearing(formatMapNumber(viewState.bearing));
  }

  function currentMapViewFromForm(options?: { allowMissingCoordinates?: boolean }): FarmMapPreviewViewState | null {
    if (latestMapViewRef.current) {
      return latestMapViewRef.current;
    }

    const viewState = previewViewStateFromText({ latitude, longitude, zoom, pitch, bearing });

    if (!viewState && !options?.allowMissingCoordinates) {
      parseCoordinate(latitude, "Latitude");
      parseCoordinate(longitude, "Longitude");
    }

    return viewState;
  }

  const previewViewState = previewViewStateFromText({ latitude, longitude, zoom, pitch, bearing });

  return (
    <View style={styles.actionStack}>
      <Text style={styles.sectionTitle}>Farm map location</Text>
      <Text style={styles.helperText}>
        Core farm location helps later farm-event notes, places, and certification records line up without requiring an online map.
      </Text>
      <View style={styles.sectionBlock}>
        <Text style={styles.sectionTitle}>Address</Text>
        {mapSettings?.addressText ? <Text style={styles.statusText}>Saved address: {mapSettings.addressText}</Text> : null}
        <FormField label="Farm address" onChangeText={setAddressText} placeholder="123 Farm Lane, Ames IA" value={addressText} />
        <Button disabled={isSaving} label={isSaving ? "Saving..." : "Save address"} onPress={handleSaveAddress} size="large" variant="secondary" />
      </View>
      <View style={styles.sectionBlock}>
        <Text style={styles.sectionTitle}>Farm map configuration</Text>
        <Text style={styles.helperText}>
          Save the farm center and the default map view used by place geometry tools.
        </Text>
        <View style={styles.inlineGrid}>
          <FormField keyboardType="decimal-pad" label="Latitude" onChangeText={handleLatitudeChanged} placeholder="42.0308" value={latitude} />
          <FormField keyboardType="decimal-pad" label="Longitude" onChangeText={handleLongitudeChanged} placeholder="-93.6319" value={longitude} />
          <FormField keyboardType="decimal-pad" label="Zoom" onChangeText={handleZoomChanged} placeholder="13" value={zoom} />
          <FormField keyboardType="decimal-pad" label="Pitch" onChangeText={handlePitchChanged} placeholder="0" value={pitch} />
          <FormField keyboardType="decimal-pad" label="Bearing" onChangeText={handleBearingChanged} placeholder="0" value={bearing} />
        </View>
        <Button disabled={isSaving} label={isSaving ? "Saving..." : "Save farm map configuration"} onPress={handleSaveCoordinates} size="large" />
        <Button disabled={isSaving} label={isSaving ? "Finding..." : "Find coordinates from address"} onPress={handleFindAddressCoordinates} size="large" variant="secondary" />
        <Button
          disabled={isSaving}
          label="Use current GPS location"
          onPress={handleUseGpsLocation}
          size="large"
          variant="secondary"
        />
      </View>
      <View style={styles.sectionBlock}>
        <Text style={styles.sectionTitle}>Farm center</Text>
        <Text style={farmCenter ? styles.statusText : styles.helperText}>
          {farmCenter ? formatFarmCenter(farmCenter) : "No farm center saved yet."}
        </Text>
      </View>
      <View style={styles.sectionBlock}>
        {previewViewState ? (
          <FarmMapPreview
            buttonOnly
            {...previewViewState}
            onViewChanged={handleMapViewChanged}
            onSaveLocation={handleSaveMapLocation}
          />
        ) : (
          <Text style={styles.helperText}>Enter and save latitude and longitude to open the full-screen map.</Text>
        )}
      </View>
      {message ? <Text style={styles.statusText}>{message}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

function PlaceGeometryEditor({
  farmId,
  farmGeometries,
  farmMapSettings,
  farmCenter,
  locations,
  onSaved,
  place,
  repository,
}: {
  farmId: string;
  farmGeometries: FarmPlaceGeometry[];
  farmMapSettings: FarmMapSettings | null;
  farmCenter: FarmPlaceGeometry | null;
  locations: FarmLocation[];
  onSaved: () => Promise<void>;
  place: FarmLocation;
  repository: FarmMapRepository;
}) {
  const [isAddingGeometry, setIsAddingGeometry] = useState(false);
  const [editingGeometryId, setEditingGeometryId] = useState<string | undefined>();
  const [message, setMessage] = useState<string | undefined>();
  const initialMapViewState = mapViewStateFromFarmMap(farmMapSettings, farmCenter);

  return (
    <View style={styles.sectionBlock}>
      <Text style={styles.sectionTitle}>Place geometry</Text>
      <Text style={styles.helperText}>
        Add a point or boundary for this place. The map starts from the farm location, and saving can remember a closer view for this place.
      </Text>
      {farmGeometries.length === 0 ? <Text style={styles.helperText}>No geometry saved for this place yet.</Text> : null}
      {farmGeometries.map((geometry) => {
        const isEditing = editingGeometryId === geometry.id;

        return (
          <View key={geometry.id} style={styles.geometryRow}>
            <Text style={styles.placeTitle}>{geometry.name || geometryRoleLabels[geometry.geometryRole]}</Text>
            <Text style={styles.placeDetail}>
              {geometryRoleLabels[geometry.geometryRole]} - {geometry.geometryType}
            </Text>
            <Button
              label="Edit place geometry"
              onPress={() => {
                setEditingGeometryId(geometry.id);
                setIsAddingGeometry(false);
                setMessage(undefined);
              }}
              size="large"
              variant="secondary"
            />
            {isEditing ? (
              <GeometryForm
                farmId={farmId}
                fixedPlace={place}
                geometry={geometry}
                initialMapViewState={initialMapViewState}
                locations={locations}
                onCancel={() => setEditingGeometryId(undefined)}
                onSaved={async () => {
                  setEditingGeometryId(undefined);
                  await onSaved();
                  setMessage("Place geometry saved.");
                }}
                repository={repository}
              />
            ) : null}
          </View>
        );
      })}
      {isAddingGeometry ? (
        <View style={styles.geometryRow}>
          <GeometryForm
            farmId={farmId}
            fixedPlace={place}
            initialMapViewState={initialMapViewState}
            locations={locations}
            onCancel={() => setIsAddingGeometry(false)}
            onSaved={async () => {
              setIsAddingGeometry(false);
              await onSaved();
              setMessage("Place geometry saved.");
            }}
            repository={repository}
          />
        </View>
      ) : (
        <Button
          label="Add place geometry"
          onPress={() => {
            setIsAddingGeometry(true);
            setEditingGeometryId(undefined);
            setMessage(undefined);
          }}
          size="large"
          variant="secondary"
        />
      )}
      {message ? <Text style={styles.statusText}>{message}</Text> : null}
    </View>
  );
}

function GeometryForm({
  fixedPlace,
  farmId,
  geometry,
  initialMapViewState,
  locations,
  onCancel,
  onSaved,
  repository,
}: {
  fixedPlace?: FarmLocation;
  farmId: string;
  geometry?: FarmPlaceGeometry;
  initialMapViewState: FarmMapPreviewViewState | null;
  locations: FarmLocation[];
  onCancel: () => void;
  onSaved: () => Promise<void>;
  repository: FarmMapRepository;
}) {
  const [name, setName] = useState(geometry?.name ?? "");
  const [notes, setNotes] = useState(geometry?.notes ?? "");
  const [placeId, setPlaceId] = useState(fixedPlace?.id ?? geometry?.placeId ?? "");
  const [role, setRole] = useState<FarmPlaceGeometryRole>(geometry?.geometryRole ?? "fieldBoundary");
  const [geometryType, setGeometryType] = useState<FarmPlaceGeometryType>(geometry?.geometryType ?? "point");
  const [latitude, setLatitude] = useState(pointLatitude(geometry));
  const [longitude, setLongitude] = useState(pointLongitude(geometry));
  const [polygonText, setPolygonText] = useState(polygonTextForGeometry(geometry));
  const [error, setError] = useState<string | undefined>();
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    setIsSaving(true);
    setError(undefined);

    try {
      const geojson = geometryType === "point"
        ? pointGeoJsonFromText(latitude, longitude)
        : polygonGeoJsonFromText(polygonText);

      await saveGeometry(geojson);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Geometry could not be saved.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSaveMapGeometry(geojson: SupportedGeoJsonGeometry, viewState: FarmMapPreviewViewState) {
    setIsSaving(true);
    setError(undefined);

    try {
      applyGeojsonToManualFields(geojson);
      await saveGeometry(geojson, viewState);
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : "Geometry could not be saved.";
      setError(message);
      throw new Error(message);
    } finally {
      setIsSaving(false);
    }
  }

  async function saveGeometry(geojson: SupportedGeoJsonGeometry, mapViewState?: FarmMapPreviewViewState) {
    const linkedPlaceId = fixedPlace?.id ?? (placeId || undefined);

    if (geometry) {
      await updateFarmPlaceGeometry(
        {
          farmId,
          geometryId: geometry.id,
          placeId: linkedPlaceId,
          geometryRole: role,
          geojson,
          name,
          notes,
          mapViewLatitude: mapViewState?.latitude,
          mapViewLongitude: mapViewState?.longitude,
          mapViewZoom: mapViewState?.zoom,
          mapViewPitch: mapViewState?.pitch,
          mapViewBearing: mapViewState?.bearing,
        },
        { clock: systemClock, repository },
      );
    } else {
      await createFarmPlaceGeometry(
        {
          farmId,
          placeId: linkedPlaceId,
          geometryRole: role,
          geojson,
          name,
          notes,
          mapViewLatitude: mapViewState?.latitude,
          mapViewLongitude: mapViewState?.longitude,
          mapViewZoom: mapViewState?.zoom,
          mapViewPitch: mapViewState?.pitch,
          mapViewBearing: mapViewState?.bearing,
        },
        { clock: systemClock, idGenerator: localIdGenerator, repository },
      );
    }

    await onSaved();
  }

  function applyGeojsonToManualFields(geojson: SupportedGeoJsonGeometry) {
    if (geojson.type === "Point") {
      setGeometryType("point");
      setLongitude(formatCoordinate(geojson.coordinates[0]));
      setLatitude(formatCoordinate(geojson.coordinates[1]));
      return;
    }

    if (geojson.type === "Polygon") {
      setGeometryType("polygon");
      setPolygonText(polygonTextForGeoJson(geojson));
    }
  }

  async function handleArchive() {
    if (!geometry) {
      return;
    }

    setIsSaving(true);
    setError(undefined);

    try {
      await archiveFarmPlaceGeometry(
        { farmId, geometryId: geometry.id },
        { clock: systemClock, repository },
      );
      await onSaved();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Geometry could not be archived.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <View style={styles.actionStack}>
      <FormField label="Geometry name" onChangeText={setName} placeholder="North Field boundary" value={name} />
      {fixedPlace ? (
        <Text style={styles.statusText}>Linked to {fixedPlace.name}</Text>
      ) : (
        <SelectField
          label="Linked farm place"
          onChange={setPlaceId}
          options={[{ label: "No linked place", value: "" }, ...buildFarmPlaceOptions(locations)]}
          value={placeId}
        />
      )}
      <SelectField
        label="Geometry role"
        onChange={(value) => setRole(value as FarmPlaceGeometryRole)}
        options={FARM_PLACE_GEOMETRY_ROLES.map((nextRole) => ({
          label: geometryRoleLabels[nextRole],
          value: nextRole,
        }))}
        value={role}
      />
      <SelectField
        label="Geometry type"
        onChange={(value) => setGeometryType(value as FarmPlaceGeometryType)}
        options={[
          { label: "Point", value: "point" },
          { label: "Polygon boundary", value: "polygon" },
        ]}
        value={geometryType}
      />
      {initialMapViewState ? (
        <FarmGeometryMapEditor
          buttonLabel={geometryType === "point" ? "Set point on full-screen map" : "Draw boundary on full-screen map"}
          geometry={geometryForMapEditor(geometry, geometryType)}
          initialViewState={mapViewStateForGeometry(geometry, initialMapViewState)}
          mode={geometryType === "point" ? "point" : "polygon"}
          onSaveGeometry={handleSaveMapGeometry}
          title={geometryType === "point" ? "Set point geometry" : "Draw boundary geometry"}
        />
      ) : (
        <Text style={styles.helperText}>
          Save a farm center first to open the full-screen geometry map. Manual coordinate entry still works here.
        </Text>
      )}
      {geometryType === "point" ? (
        <View style={styles.inlineGrid}>
          <FormField keyboardType="decimal-pad" label="Latitude" onChangeText={setLatitude} placeholder="42.0308" value={latitude} />
          <FormField keyboardType="decimal-pad" label="Longitude" onChangeText={setLongitude} placeholder="-93.6319" value={longitude} />
        </View>
      ) : (
        <>
          <Text style={styles.helperText}>
            Enter one longitude,latitude pair per line. The app will close the boundary if the first point is not repeated.
          </Text>
          <FormField
            label="Boundary coordinates"
            multiline
            onChangeText={setPolygonText}
            placeholder={"-93.20,42.10\n-93.10,42.10\n-93.10,42.20"}
            value={polygonText}
          />
        </>
      )}
      <FormField label="Notes" multiline onChangeText={setNotes} placeholder="Fence line, buffer, water source, etc." value={notes} />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button disabled={isSaving} label={isSaving ? "Saving..." : "Save geometry"} onPress={handleSave} size="large" />
      {geometry ? (
        <Button disabled={isSaving} label="Archive geometry" onPress={handleArchive} size="large" variant="secondary" />
      ) : null}
      <Button label="Cancel" onPress={onCancel} size="large" variant="secondary" />
    </View>
  );
}

function parseCoordinate(value: string, label: string): number {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    throw new Error(`${label} must be a number.`);
  }

  if (label === "Latitude" && (number < -90 || number > 90)) {
    throw new Error("Latitude must be between -90 and 90.");
  }

  if (label === "Longitude" && (number < -180 || number > 180)) {
    throw new Error("Longitude must be between -180 and 180.");
  }

  return number;
}

function parseZoom(value: string): number {
  const number = Number(value);

  if (!Number.isFinite(number) || number < 0 || number > 22) {
    throw new Error("Zoom must be between 0 and 22.");
  }

  return number;
}

function parsePitch(value: string): number {
  const number = Number(value);

  if (!Number.isFinite(number) || number < 0 || number > 85) {
    throw new Error("Pitch must be between 0 and 85.");
  }

  return number;
}

function parseBearing(value: string): number {
  const number = Number(value);

  if (!Number.isFinite(number) || number < -360 || number > 360) {
    throw new Error("Bearing must be between -360 and 360.");
  }

  return number;
}

function previewViewStateFromText(input: {
  latitude: string;
  longitude: string;
  zoom: string;
  pitch: string;
  bearing: string;
}): FarmMapPreviewViewState | null {
  const latitude = Number(input.latitude);
  const longitude = Number(input.longitude);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  return {
    latitude,
    longitude,
    zoom: numberOrDefault(input.zoom, 13),
    pitch: numberOrDefault(input.pitch, 0),
    bearing: numberOrDefault(input.bearing, 0),
  };
}

function numberOrDefault(value: string, fallback: number): number {
  const number = Number(value);

  return Number.isFinite(number) ? number : fallback;
}

function formatCoordinate(value: number): string {
  return value.toFixed(6).replace(/\.?0+$/, "");
}

function formatMapNumber(value: number): string {
  return value.toFixed(2).replace(/\.?0+$/, "");
}

function formatFarmCenter(farmCenter: FarmPlaceGeometry): string {
  if (farmCenter.geojson.type !== "Point") {
    return "Saved geometry is not a point.";
  }

  const [longitude, latitude] = farmCenter.geojson.coordinates;
  return `Latitude ${latitude}, longitude ${longitude}`;
}

const geometryRoleLabels: Record<FarmPlaceGeometryRole, string> = {
  farmCenter: "Farm center",
  fieldBoundary: "Field boundary",
  bedBoundary: "Bed boundary",
  rowLine: "Row line",
  greenhouseBoundary: "Greenhouse boundary",
  buildingFootprint: "Building footprint",
  storageArea: "Storage area",
  washPackArea: "Wash/Pack area",
  bufferZone: "Buffer zone",
  waterSource: "Water source",
  accessRoad: "Access road",
  adjacentLandRiskArea: "Adjacent land risk area",
  driftIncidentArea: "Drift incident area",
  contaminationConcernPoint: "Contamination concern point",
  other: "Other",
};

function pointLatitude(geometry?: FarmPlaceGeometry): string {
  return geometry?.geojson.type === "Point" ? String(geometry.geojson.coordinates[1]) : "";
}

function pointLongitude(geometry?: FarmPlaceGeometry): string {
  return geometry?.geojson.type === "Point" ? String(geometry.geojson.coordinates[0]) : "";
}

function polygonTextForGeometry(geometry?: FarmPlaceGeometry): string {
  if (geometry?.geojson.type !== "Polygon") {
    return "";
  }

  return polygonTextForGeoJson(geometry.geojson);
}

function polygonTextForGeoJson(geojson: Extract<SupportedGeoJsonGeometry, { type: "Polygon" }>): string {
  return geojson.coordinates[0]
    .map(([longitude, latitude]) => `${longitude},${latitude}`)
    .join("\n");
}

function geometryForMapEditor(
  geometry: FarmPlaceGeometry | undefined,
  geometryType: FarmPlaceGeometryType,
): SupportedGeoJsonGeometry | undefined {
  if (!geometry) {
    return undefined;
  }

  if (geometryType === "point" && geometry.geojson.type === "Point") {
    return geometry.geojson;
  }

  if (geometryType === "polygon" && geometry.geojson.type === "Polygon") {
    return geometry.geojson;
  }

  return undefined;
}

function mapViewStateFromFarmCenter(farmCenter: FarmPlaceGeometry | null): FarmMapPreviewViewState | null {
  if (farmCenter?.geojson.type !== "Point") {
    return null;
  }

  const [longitude, latitude] = farmCenter.geojson.coordinates;

  return {
    latitude,
    longitude,
    zoom: 16,
    pitch: 0,
    bearing: 0,
  };
}

function mapViewStateFromFarmMap(
  mapSettings: FarmMapSettings | null,
  farmCenter: FarmPlaceGeometry | null,
): FarmMapPreviewViewState | null {
  if (mapSettings?.defaultCenterLatitude !== undefined && mapSettings.defaultCenterLongitude !== undefined) {
    return {
      latitude: mapSettings.defaultCenterLatitude,
      longitude: mapSettings.defaultCenterLongitude,
      zoom: mapSettings.defaultZoom,
      pitch: mapSettings.defaultPitch,
      bearing: mapSettings.defaultBearing,
    };
  }

  const centerView = mapViewStateFromFarmCenter(farmCenter);

  if (!centerView) {
    return null;
  }

  return {
    ...centerView,
    zoom: mapSettings?.defaultZoom ?? centerView.zoom,
    pitch: mapSettings?.defaultPitch ?? centerView.pitch,
    bearing: mapSettings?.defaultBearing ?? centerView.bearing,
  };
}

function mapViewStateForGeometry(
  geometry: FarmPlaceGeometry | undefined,
  fallback: FarmMapPreviewViewState,
): FarmMapPreviewViewState {
  if (
    geometry?.mapViewLatitude !== undefined &&
    geometry.mapViewLongitude !== undefined
  ) {
    return {
      latitude: geometry.mapViewLatitude,
      longitude: geometry.mapViewLongitude,
      zoom: geometry.mapViewZoom ?? fallback.zoom,
      pitch: geometry.mapViewPitch ?? fallback.pitch,
      bearing: geometry.mapViewBearing ?? fallback.bearing,
    };
  }

  return fallback;
}

function pointGeoJsonFromText(latitude: string, longitude: string): SupportedGeoJsonGeometry {
  return {
    type: "Point",
    coordinates: [parseCoordinate(longitude, "Longitude"), parseCoordinate(latitude, "Latitude")],
  };
}

function polygonGeoJsonFromText(value: string): SupportedGeoJsonGeometry {
  const coordinates = value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [longitude, latitude] = line.split(",").map((part) => Number(part.trim()));
      return [parseCoordinate(String(latitude), "Latitude"), parseCoordinate(String(longitude), "Longitude")] as const;
    })
    .map(([latitude, longitude]) => [longitude, latitude] as [number, number]);

  if (coordinates.length < 3) {
    throw new Error("A boundary needs at least three points.");
  }

  const first = coordinates[0];
  const last = coordinates[coordinates.length - 1];
  const closedCoordinates = first[0] === last[0] && first[1] === last[1]
    ? coordinates
    : [...coordinates, first];

  return { type: "Polygon", coordinates: [closedCoordinates] };
}
