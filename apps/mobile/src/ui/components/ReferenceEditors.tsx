import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { z } from "zod";

import { addLocation } from "../../application/use-cases/add-location/addLocation";
import { addTrackedItem } from "../../application/use-cases/add-tracked-item/addTrackedItem";
import { updateLocation } from "../../application/use-cases/update-location/updateLocation";
import { updateTrackedItem } from "../../application/use-cases/update-tracked-item/updateTrackedItem";
import type { FarmReferenceRepository } from "../../application/ports/FarmReferenceRepository";
import {
  FARM_PLACE_KIND_LABELS,
  FARM_PLACE_KINDS,
  type FarmLocation,
  type FarmLocationId,
  type FarmPlaceKind,
} from "../../domain/farm/FarmLocation";
import type { TrackedItem, TrackedItemKind } from "../../domain/farm/TrackedItem";
import { systemClock } from "../../infrastructure/system/clock";
import { localIdGenerator } from "../../infrastructure/system/idGenerator";
import { buildFarmPlaceDisplays, buildFarmPlaceOptions } from "../farmPlaceDisplay";
import { theme } from "../theme/theme";
import { Button } from "./Button";
import { EmptyState } from "./EmptyState";
import { FormField } from "./FormField";
import { ListRow } from "./ListRow";
import { SelectField } from "./SelectField";

export function FarmPlacesEditor({
  farmId,
  locations,
  repository,
  onReferenceSaved,
  intro,
}: {
  farmId: string;
  locations: FarmLocation[];
  repository: FarmReferenceRepository;
  onReferenceSaved: () => Promise<void>;
  intro?: string;
}) {
  const [name, setName] = useState("");
  const [kind, setKind] = useState<FarmPlaceKind | "">("");
  const [parentId, setParentId] = useState<FarmLocationId | "">("");
  const [editingPlaceId, setEditingPlaceId] = useState<FarmLocationId | undefined>();
  const [error, setError] = useState<string | undefined>();
  const [isSaving, setIsSaving] = useState(false);
  const placeDisplays = buildFarmPlaceDisplays(locations);
  const parentOptions = [
    { label: "No parent / top-level place", value: "" },
    ...buildFarmPlaceOptions(locations).filter((option) => option.value !== editingPlaceId),
  ];

  function resetForm() {
    setName("");
    setKind("");
    setParentId("");
    setEditingPlaceId(undefined);
    setError(undefined);
  }

  async function handleSave() {
    setIsSaving(true);
    setError(undefined);

    try {
      if (editingPlaceId) {
        await updateLocation(
          { farmId, id: editingPlaceId, name, kind: kind || undefined, parentId: parentId || undefined },
          { repository },
        );
      } else {
        await addLocation(
          { farmId, name, kind: kind || undefined, parentId: parentId || undefined },
          { clock: systemClock, idGenerator: localIdGenerator, repository },
        );
      }

      resetForm();
      await onReferenceSaved();
    } catch (caughtError) {
      setError(
        caughtError instanceof z.ZodError
          ? caughtError.issues[0]?.message
          : caughtError instanceof Error
            ? caughtError.message
            : "This place could not be saved.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  function beginEdit(place: FarmLocation) {
    setEditingPlaceId(place.id);
    setName(place.name);
    setKind(place.kind);
    setParentId(place.parentId ?? "");
    setError(undefined);
  }

  return (
    <View style={styles.stack}>
      {intro ? <Text style={styles.helperText}>{intro}</Text> : null}
      <View style={styles.list}>
        {placeDisplays.length === 0 ? (
          <EmptyState text="No farm places yet. Add a field, greenhouse, tunnel, storage area, or other work place." />
        ) : (
          placeDisplays.map((display) => (
            <View key={display.place.id} style={[styles.placeRow, { marginLeft: display.depth * 16 }]}>
              <View style={styles.placeText}>
                <Text style={styles.placeTitle}>{display.place.name}</Text>
                <Text style={styles.placeDetail}>{display.typeLabel}</Text>
              </View>
              <View style={styles.rowActions}>
                <Button
                  label="Edit"
                  onPress={() => beginEdit(display.place)}
                  size="large"
                  variant="secondary"
                />
                <Button
                  label="Add inside"
                  onPress={() => {
                    setEditingPlaceId(undefined);
                    setParentId(display.place.id);
                    setKind("");
                    setName("");
                    setError(undefined);
                  }}
                  size="large"
                  variant="secondary"
                />
              </View>
            </View>
          ))
        )}
      </View>
      <SelectField
        error={error && !kind ? error : undefined}
        label="What kind of place is this?"
        onChange={(value) => setKind(value as FarmPlaceKind)}
        options={FARM_PLACE_KINDS.map((placeKind) => ({
          label: FARM_PLACE_KIND_LABELS[placeKind],
          value: placeKind,
        }))}
        value={kind}
      />
      {kind ? <Text style={styles.helperText}>{placeTypeGuidance[kind]}</Text> : null}
      <FormField
        error={error && kind ? error : undefined}
        label="Name"
        onChangeText={setName}
        onSubmitEditing={handleSave}
        placeholder="Field 1"
        value={name}
      />
      <SelectField label="Parent place" onChange={setParentId} options={parentOptions} value={parentId} />
      <Button
        disabled={isSaving}
        label={isSaving ? "Saving..." : editingPlaceId ? "Save place changes" : locations.length === 0 ? "Add first place" : "Add place"}
        onPress={handleSave}
        size="large"
      />
      {editingPlaceId ? <Button label="Cancel edit" onPress={resetForm} size="large" variant="secondary" /> : null}
    </View>
  );
}

export function TrackedItemsEditor({
  farmId,
  title,
  addLabel,
  placeholder,
  kind,
  items,
  repository,
  onReferenceSaved,
}: {
  farmId: string;
  title: string;
  addLabel: string;
  placeholder: string;
  kind: TrackedItemKind;
  items: TrackedItem[];
  repository: FarmReferenceRepository;
  onReferenceSaved: () => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [editingItemId, setEditingItemId] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();
  const [isSaving, setIsSaving] = useState(false);

  function resetForm() {
    setName("");
    setEditingItemId(undefined);
    setError(undefined);
  }

  async function handleSave() {
    setIsSaving(true);
    setError(undefined);

    try {
      if (editingItemId) {
        await updateTrackedItem({ farmId, id: editingItemId, kind, name }, { repository });
      } else {
        await addTrackedItem(
          { farmId, kind, name },
          { clock: systemClock, idGenerator: localIdGenerator, repository },
        );
      }

      resetForm();
      await onReferenceSaved();
    } catch (caughtError) {
      setError(caughtError instanceof z.ZodError ? caughtError.issues[0]?.message : "This item could not be saved.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <View style={styles.stack}>
      <View style={styles.list}>
        {items.length === 0 ? (
          <EmptyState text={`No ${title.toLowerCase()} yet.`} />
        ) : (
          items.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <View style={styles.itemText}>
                <ListRow title={item.name} />
              </View>
              <Button
                label="Edit"
                onPress={() => {
                  setEditingItemId(item.id);
                  setName(item.name);
                  setError(undefined);
                }}
                size="large"
                variant="secondary"
              />
            </View>
          ))
        )}
      </View>
      <FormField
        error={error}
        label="Name"
        onChangeText={setName}
        onSubmitEditing={handleSave}
        placeholder={placeholder}
        value={name}
      />
      <Button
        disabled={isSaving}
        label={isSaving ? "Saving..." : editingItemId ? `Save ${title.toLowerCase()} changes` : addLabel}
        onPress={handleSave}
        size="large"
        variant={editingItemId ? "primary" : "secondary"}
      />
      {editingItemId ? <Button label="Cancel edit" onPress={resetForm} size="large" variant="secondary" /> : null}
    </View>
  );
}

const placeTypeGuidance: Record<FarmPlaceKind, string> = {
  field: "Fields can later contain beds or rows.",
  bed: "Beds often sit inside a field, greenhouse, or tunnel, but can also stand alone.",
  row: "Rows often sit inside a bed, field, greenhouse, or tunnel.",
  greenhouse: "Greenhouses can contain benches, beds, zones, or rows.",
  highTunnel: "High tunnels can contain beds or rows.",
  greenhouseBed: "Greenhouse beds usually sit inside a greenhouse or tunnel.",
  bench: "Benches usually sit inside a greenhouse or propagation area.",
  storageArea: "Storage areas can hold materials, supplies, equipment, or counted items.",
  washPack: "Wash/Pack areas can contain coolers, freezers, or storage subareas.",
  cooler: "Coolers often sit inside Wash/Pack or storage areas.",
  freezer: "Freezers often sit inside Wash/Pack or storage areas.",
  barnShed: "Barns and sheds can hold tools, supplies, equipment, or materials.",
  other: "Use this when your farm's name for a place does not fit the common choices.",
};

const styles = StyleSheet.create({
  stack: {
    gap: theme.spacing.md,
  },
  list: {
    gap: theme.spacing.sm,
  },
  helperText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body,
    lineHeight: 22,
  },
  placeRow: {
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    gap: theme.spacing.sm,
    padding: theme.spacing.sm,
  },
  placeText: {
    gap: 2,
  },
  placeTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body,
    fontWeight: "700",
  },
  placeDetail: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small,
    lineHeight: 20,
  },
  rowActions: {
    gap: theme.spacing.sm,
  },
  itemRow: {
    gap: theme.spacing.sm,
  },
  itemText: {
    flex: 1,
  },
});
