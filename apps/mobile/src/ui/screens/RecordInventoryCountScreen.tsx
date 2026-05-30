import { useEffect, useState } from "react";
import { StyleSheet, Text } from "react-native";
import { useRouter } from "expo-router";
import { z } from "zod";

import type { Farm } from "../../domain/farm/Farm";
import type { FarmLocation } from "../../domain/farm/FarmLocation";
import type { TrackedItem } from "../../domain/farm/TrackedItem";
import { PILOT_UNITS } from "../../domain/quantities/PilotUnit";
import type { FarmReferenceRepository } from "../../application/ports/FarmReferenceRepository";
import type { LocalRecordRepository } from "../../application/ports/LocalRecordRepository";
import { listLocations } from "../../application/use-cases/list-locations/listLocations";
import { listTrackedItems } from "../../application/use-cases/list-tracked-items/listTrackedItems";
import { recordInventoryCount } from "../../application/use-cases/record-inventory-count/RecordInventoryCount";
import { systemClock } from "../../infrastructure/system/clock";
import { localIdGenerator } from "../../infrastructure/system/idGenerator";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { FormField } from "../components/FormField";
import { LocalDataNotice } from "../components/LocalDataNotice";
import { PageHeader } from "../components/PageHeader";
import { Screen } from "../components/Screen";
import { SelectField } from "../components/SelectField";
import { SectionHeading } from "../components/SectionHeading";
import { theme } from "../theme/theme";
import { replaceRoute } from "../navigation";
import { buildFarmPlaceOptions } from "../farmPlaceDisplay";
import { mapZodIssues } from "./screenValidation";

export function RecordInventoryCountScreen({
  farm,
  farmReferenceRepository,
  localRecordRepository,
}: {
  farm: Farm;
  farmReferenceRepository: FarmReferenceRepository;
  localRecordRepository: LocalRecordRepository;
}) {
  const router = useRouter();
  const [items, setItems] = useState<TrackedItem[]>([]);
  const [locations, setLocations] = useState<FarmLocation[]>([]);
  const [trackedItemId, setTrackedItemId] = useState("");
  const [locationId, setLocationId] = useState("");
  const [quantityText, setQuantityText] = useState("");
  const [unit, setUnit] = useState("");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadReferences() {
      const [allItems, nextLocations] = await Promise.all([
        listTrackedItems(farm.id, undefined, farmReferenceRepository),
        listLocations(farm.id, farmReferenceRepository),
      ]);
      setItems(allItems.filter((item) => item.kind === "material" || item.kind === "countableItem"));
      setLocations(nextLocations);
    }
    loadReferences();
  }, [farm.id, farmReferenceRepository]);
  const placeOptions = buildFarmPlaceOptions(locations);

  async function handleSave() {
    setIsSaving(true);
    setErrors({});
    try {
      await recordInventoryCount(
        { farmId: farm.id, trackedItemId, locationId, quantityText, unit, note },
        { clock: systemClock, farmReferenceRepository, idGenerator: localIdGenerator, localRecordRepository },
      );
      replaceRoute(router, "/activity?saved=inventory-count");
    } catch (caughtError) {
      setErrors(caughtError instanceof z.ZodError ? mapZodIssues(caughtError) : { form: "This count could not be saved on this device." });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Screen>
      <PageHeader eyebrow="Inventory count" supportingText="Record an observed count. It will not overwrite earlier history." title="Record inventory count" />
      <LocalDataNotice />
      {items.length === 0 ? (
        <Card>
          <SectionHeading title="Finish setup first" />
          <EmptyState text="Add a material or countable item before recording a count." />
          <Button label="Back to farm setup" onPress={() => replaceRoute(router, "/")} variant="secondary" />
        </Card>
      ) : (
        <Card>
          <SectionHeading detail="A count is an observation, not a replacement for prior records." title="Count details" />
          <SelectField error={errors.trackedItemId} label="Item" onChange={setTrackedItemId} options={items.map((item) => ({ label: item.name, value: item.id }))} value={trackedItemId} />
          <FormField error={errors.quantityText} keyboardType="decimal-pad" label="Observed count" onChangeText={setQuantityText} placeholder="0" value={quantityText} />
          <SelectField error={errors.unit} label="Unit" onChange={setUnit} options={PILOT_UNITS.map((pilotUnit) => ({ label: pilotUnit, value: pilotUnit }))} value={unit} />
          <SelectField error={errors.locationId} label="Farm place" onChange={setLocationId} options={[{ label: "No place", value: "" }, ...placeOptions]} value={locationId} />
          <FormField error={errors.note} label="Note" multiline onChangeText={setNote} placeholder="Optional" value={note} />
          {errors.form ? <Text style={styles.error}>{errors.form}</Text> : null}
          <Button disabled={isSaving} label={isSaving ? "Saving..." : "Save count"} onPress={handleSave} />
        </Card>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  error: {
    color: theme.colors.error,
    fontSize: theme.typography.small,
    lineHeight: 20,
  },
});
