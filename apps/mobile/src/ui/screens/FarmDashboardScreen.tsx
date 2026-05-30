import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { z } from "zod";

import type { Farm } from "../../domain/farm/Farm";
import {
  FARM_PLACE_KIND_LABELS,
  FARM_PLACE_KINDS,
  type FarmLocation,
  type FarmLocationId,
  type FarmPlaceKind,
} from "../../domain/farm/FarmLocation";
import type { TrackedItem, TrackedItemKind } from "../../domain/farm/TrackedItem";
import { addLocation } from "../../application/use-cases/add-location/addLocation";
import { addTrackedItem } from "../../application/use-cases/add-tracked-item/addTrackedItem";
import type { FarmReferenceRepository } from "../../application/ports/FarmReferenceRepository";
import { systemClock } from "../../infrastructure/system/clock";
import { localIdGenerator } from "../../infrastructure/system/idGenerator";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { FormField } from "../components/FormField";
import { ListRow } from "../components/ListRow";
import { LocalDataNotice } from "../components/LocalDataNotice";
import { PageHeader } from "../components/PageHeader";
import { Screen } from "../components/Screen";
import { SelectField } from "../components/SelectField";
import { SectionHeading } from "../components/SectionHeading";
import { theme } from "../theme/theme";
import { pushRoute } from "../navigation";
import { buildFarmPlaceDisplays, buildFarmPlaceOptions, hasGrowingPlace } from "../farmPlaceDisplay";

type ReferenceSection =
  {
      type: TrackedItemKind;
      title: string;
      addLabel: string;
      placeholder: string;
      items: TrackedItem[];
    };

export function FarmDashboardScreen({
  farm,
  locations,
  crops,
  materials,
  countableItems,
  repository,
  onReferenceSaved,
}: {
  farm: Farm;
  locations: FarmLocation[];
  crops: TrackedItem[];
  materials: TrackedItem[];
  countableItems: TrackedItem[];
  repository: FarmReferenceRepository;
  onReferenceSaved: () => Promise<void>;
}) {
  const router = useRouter();
  const hasPlaces = locations.length > 0;
  const hasGrowingWorkPlace = hasGrowingPlace(locations);
  const hasOperationalSetup = hasGrowingWorkPlace && crops.length > 0 && materials.length > 0 && countableItems.length > 0;
  const sections: ReferenceSection[] = [
    { type: "crop", title: "Crops", addLabel: "Add crop", placeholder: "Kale", items: crops },
    {
      type: "material",
      title: "Materials",
      addLabel: "Add material",
      placeholder: "Compost",
      items: materials,
    },
    {
      type: "countableItem",
      title: "Countable items",
      addLabel: "Add countable item",
      placeholder: "Seedling trays",
      items: countableItems,
    },
  ];

  return (
    <Screen>
      <PageHeader
        eyebrow="Mobile Pilot 1"
        supportingText={
          hasPlaces
            ? "Keep adding the places and items you need for local farm records."
            : "Start with the places where work happens: fields, beds, greenhouses, storage, or wash/pack areas."
        }
        title={farm.name}
      />
      <LocalDataNotice />
      {!hasPlaces ? (
        <Card>
          <SectionHeading
            detail="These places help you record harvests, material use, and counts without making you remember generic location names."
            title="Set up your farm places"
          />
          <Text style={styles.helperText}>
            Start with the places where work happens: fields, beds, greenhouses, tunnels, storage, or wash/pack areas. You can add more later.
          </Text>
        </Card>
      ) : null}
      {hasOperationalSetup ? (
        <Card>
          <SectionHeading detail="Record field work and review what is saved locally." title="Farm work" />
          <View style={styles.actionStack}>
            <Button label="Record harvest" onPress={() => pushRoute(router, "/harvest/new")} />
            <Button label="Record material use" onPress={() => pushRoute(router, "/material-use/new")} variant="secondary" />
            <Button label="Record inventory count" onPress={() => pushRoute(router, "/inventory-count/new")} variant="secondary" />
            <Button label="View activity history" onPress={() => pushRoute(router, "/activity")} variant="secondary" />
            <Button label="Create recovery copy" onPress={() => pushRoute(router, "/data-safety/export")} variant="secondary" />
          </View>
        </Card>
      ) : hasPlaces ? (
        <Card>
          <SectionHeading detail="Add crops, materials, and countable items before recording daily work." title="Add what you grow and use" />
          <Text style={styles.helperText}>
            Recording actions are ready once the app has at least one growing place plus the crops and items those records use.
          </Text>
        </Card>
      ) : null}
      <FarmPlacesCard
        farmId={farm.id}
        locations={locations}
        onReferenceSaved={onReferenceSaved}
        repository={repository}
      />
      <Card>
        <SectionHeading
          detail="Setup stays on this device and supports local farm records."
          title="Local setup"
        />
        <Text style={styles.progress}>
          {locations.length + crops.length + materials.length + countableItems.length} saved setup items
        </Text>
      </Card>
      {sections.map((section) => (
        <ReferenceCard
          farmId={farm.id}
          key={section.type}
          onReferenceSaved={onReferenceSaved}
          repository={repository}
          section={section}
        />
      ))}
    </Screen>
  );
}

function FarmPlacesCard({
  farmId,
  locations,
  repository,
  onReferenceSaved,
}: {
  farmId: string;
  locations: FarmLocation[];
  repository: FarmReferenceRepository;
  onReferenceSaved: () => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [kind, setKind] = useState<FarmPlaceKind | "">("");
  const [parentId, setParentId] = useState<FarmLocationId | "">("");
  const [error, setError] = useState<string | undefined>();
  const [isSaving, setIsSaving] = useState(false);
  const placeDisplays = buildFarmPlaceDisplays(locations);
  const parentOptions = [
    { label: "No parent / top-level place", value: "" },
    ...buildFarmPlaceOptions(locations),
  ];

  async function handleAdd() {
    setIsSaving(true);
    setError(undefined);

    try {
      await addLocation(
        { farmId, name, kind: kind || undefined, parentId: parentId || undefined },
        { clock: systemClock, idGenerator: localIdGenerator, repository },
      );
      setName("");
      setKind("");
      setParentId("");
      await onReferenceSaved();
    } catch (caughtError) {
      setError(caughtError instanceof z.ZodError ? caughtError.issues[0]?.message : caughtError instanceof Error ? caughtError.message : "This place could not be saved.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card>
      <SectionHeading
        detail="Add the fields, beds, greenhouses, tunnels, and work areas where farm activity happens."
        title="Farm places"
      />
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
              <Button
                label="Add inside"
                onPress={() => {
                  setParentId(display.place.id);
                  setKind("");
                }}
                variant="secondary"
              />
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
        onSubmitEditing={handleAdd}
        placeholder="Field 1"
        value={name}
      />
      <SelectField
        label="Parent place"
        onChange={setParentId}
        options={parentOptions}
        value={parentId}
      />
      <Button disabled={isSaving} label={isSaving ? "Saving..." : locations.length === 0 ? "Add first place" : "Add place"} onPress={handleAdd} />
    </Card>
  );
}

function ReferenceCard({
  farmId,
  section,
  repository,
  onReferenceSaved,
}: {
  farmId: string;
  section: ReferenceSection;
  repository: FarmReferenceRepository;
  onReferenceSaved: () => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [isSaving, setIsSaving] = useState(false);

  async function handleAdd() {
    setIsSaving(true);
    setError(undefined);

    try {
      await addTrackedItem(
        { farmId, kind: section.type, name },
        { clock: systemClock, idGenerator: localIdGenerator, repository },
      );

      setName("");
      await onReferenceSaved();
    } catch (caughtError) {
      setError(caughtError instanceof z.ZodError ? caughtError.issues[0]?.message : "This item could not be saved.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card>
      <SectionHeading title={section.title} />
      <View style={styles.list}>
        {section.items.length === 0 ? (
          <EmptyState text={`No ${section.title.toLowerCase()} yet.`} />
        ) : (
          section.items.map((item) => <ListRow key={item.id} title={item.name} />)
        )}
      </View>
      <FormField
        error={error}
        label="Name"
        onChangeText={setName}
        onSubmitEditing={handleAdd}
        placeholder={section.placeholder}
        value={name}
      />
      <Button disabled={isSaving} label={isSaving ? "Saving..." : section.addLabel} onPress={handleAdd} variant="secondary" />
    </Card>
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
  progress: {
    color: theme.colors.success,
    fontSize: theme.typography.body,
    fontWeight: "700",
  },
  list: {
    gap: theme.spacing.sm,
  },
  actionStack: {
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
});
